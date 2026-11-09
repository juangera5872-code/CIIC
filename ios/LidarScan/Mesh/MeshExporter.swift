import ARKit
import MetalKit
import ModelIO

enum MeshExporter {
    enum ExportError: LocalizedError {
        case noMesh, noMetal, unsupportedFormat
        var errorDescription: String? {
            switch self {
            case .noMesh: "Todavía no hay malla escaneada."
            case .noMetal: "Metal no disponible."
            case .unsupportedFormat: "Formato no soportado en este dispositivo."
            }
        }
    }

    static func export(anchors: [ARMeshAnchor], to url: URL) throws {
        guard !anchors.isEmpty else { throw ExportError.noMesh }
        switch url.pathExtension.lowercased() {
        case "glb":
            let g = worldGeometry(anchors)
            try writeGLB(positions: g.positions, indices: g.indices, to: url)
        case "xyz":
            try writeXYZ(positions: worldGeometry(anchors).positions, to: url)
        default:
            try exportWithModelIO(anchors: anchors, to: url)
        }
    }

    // MARK: - Geometría en coordenadas de mundo

    static func worldPositions(_ anchor: ARMeshAnchor) -> [SIMD3<Float>] {
        let v = anchor.geometry.vertices
        var out: [SIMD3<Float>] = []
        out.reserveCapacity(v.count)
        for i in 0..<v.count {
            let ptr = v.buffer.contents().advanced(by: v.offset + v.stride * i)
            let p = ptr.assumingMemoryBound(to: (Float, Float, Float).self).pointee
            let w = anchor.transform * SIMD4<Float>(p.0, p.1, p.2, 1)
            out.append(SIMD3(w.x, w.y, w.z))
        }
        return out
    }

    static func worldGeometry(_ anchors: [ARMeshAnchor]) -> (positions: [SIMD3<Float>], indices: [UInt32]) {
        var positions: [SIMD3<Float>] = []
        var indices: [UInt32] = []
        for anchor in anchors {
            let base = UInt32(positions.count)
            positions += worldPositions(anchor)
            let f = anchor.geometry.faces
            let n = f.count * f.indexCountPerPrimitive
            for i in 0..<n {
                let ptr = f.buffer.contents().advanced(by: i * f.bytesPerIndex)
                indices.append(base + ptr.assumingMemoryBound(to: UInt32.self).pointee)
            }
        }
        return (positions, indices)
    }

    // MARK: - ModelIO (obj, ply, stl, usd, usdz, abc)

    private static func exportWithModelIO(anchors: [ARMeshAnchor], to url: URL) throws {
        guard let device = MTLCreateSystemDefaultDevice() else { throw ExportError.noMetal }
        guard MDLAsset.canExportFileExtension(url.pathExtension) else { throw ExportError.unsupportedFormat }
        let allocator = MTKMeshBufferAllocator(device: device)
        let asset = MDLAsset(bufferAllocator: allocator)
        for anchor in anchors { asset.add(makeMesh(anchor: anchor, allocator: allocator)) }
        try asset.export(to: url)
    }

    private static func makeMesh(anchor: ARMeshAnchor, allocator: MTKMeshBufferAllocator) -> MDLMesh {
        let positions = worldPositions(anchor)
        var vertexData = Data(capacity: positions.count * 12)
        for p in positions {
            var xyz = (p.x, p.y, p.z)
            withUnsafeBytes(of: &xyz) { vertexData.append(contentsOf: $0) }
        }
        let vertexBuffer = allocator.newBuffer(with: vertexData, type: .vertex)

        let faces = anchor.geometry.faces
        let indexData = Data(
            bytes: faces.buffer.contents(),
            count: faces.bytesPerIndex * faces.indexCountPerPrimitive * faces.count)
        let indexBuffer = allocator.newBuffer(with: indexData, type: .index)
        let submesh = MDLSubmesh(
            indexBuffer: indexBuffer,
            indexCount: faces.count * faces.indexCountPerPrimitive,
            indexType: .uint32,
            geometryType: .triangles,
            material: nil)

        let descriptor = MDLVertexDescriptor()
        descriptor.attributes[0] = MDLVertexAttribute(
            name: MDLVertexAttributePosition, format: .float3, offset: 0, bufferIndex: 0)
        descriptor.layouts[0] = MDLVertexBufferLayout(stride: 12)

        return MDLMesh(vertexBuffer: vertexBuffer, vertexCount: positions.count,
                       descriptor: descriptor, submeshes: [submesh])
    }

    // MARK: - XYZ

    static func writeXYZ(positions: [SIMD3<Float>], to url: URL) throws {
        var s = ""
        s.reserveCapacity(positions.count * 24)
        for p in positions { s += String(format: "%.4f %.4f %.4f\n", p.x, p.y, p.z) }
        try s.write(to: url, atomically: true, encoding: .utf8)
    }

    // MARK: - GLB (glTF 2.0 binario, metros)

    static func writeGLB(positions: [SIMD3<Float>], indices: [UInt32], to url: URL) throws {
        guard !positions.isEmpty, !indices.isEmpty else { throw ExportError.noMesh }

        var bin = Data()
        var mn = positions[0], mx = positions[0]
        for p in positions {
            mn = simd_min(mn, p); mx = simd_max(mx, p)
            var xyz = (p.x, p.y, p.z)
            withUnsafeBytes(of: &xyz) { bin.append(contentsOf: $0) }
        }
        let posBytes = bin.count
        for i in indices {
            var v = i.littleEndian
            withUnsafeBytes(of: &v) { bin.append(contentsOf: $0) }
        }
        let idxBytes = bin.count - posBytes
        while bin.count % 4 != 0 { bin.append(0) }

        let json: [String: Any] = [
            "asset": ["version": "2.0", "generator": "LidarScan"],
            "scene": 0,
            "scenes": [["nodes": [0]]],
            "nodes": [["mesh": 0]],
            "meshes": [["primitives": [["attributes": ["POSITION": 0], "indices": 1, "mode": 4]]]],
            "accessors": [
                ["bufferView": 0, "componentType": 5126, "count": positions.count, "type": "VEC3",
                 "min": [mn.x, mn.y, mn.z], "max": [mx.x, mx.y, mx.z]],
                ["bufferView": 1, "componentType": 5125, "count": indices.count, "type": "SCALAR"],
            ],
            "bufferViews": [
                ["buffer": 0, "byteOffset": 0, "byteLength": posBytes, "target": 34962],
                ["buffer": 0, "byteOffset": posBytes, "byteLength": idxBytes, "target": 34963],
            ],
            "buffers": [["byteLength": bin.count]],
        ]
        var jsonData = try JSONSerialization.data(withJSONObject: json)
        while jsonData.count % 4 != 0 { jsonData.append(0x20) }

        func u32(_ v: UInt32) -> Data {
            var le = v.littleEndian
            return withUnsafeBytes(of: &le) { Data($0) }
        }
        var out = Data()
        out += u32(0x46546C67)                                   // "glTF"
        out += u32(2)
        out += u32(UInt32(12 + 8 + jsonData.count + 8 + bin.count))
        out += u32(UInt32(jsonData.count)); out += u32(0x4E4F534A); out += jsonData   // JSON
        out += u32(UInt32(bin.count));      out += u32(0x004E4942); out += bin        // BIN
        try out.write(to: url)
    }
}
