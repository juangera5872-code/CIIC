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
            case .unsupportedFormat: "Formato no soportado."
            }
        }
    }

    /// Exporta todas las mallas del ARSession a un único archivo (obj, usdz...),
    /// con los vértices ya transformados a coordenadas de mundo.
    static func export(anchors: [ARMeshAnchor], to url: URL) throws {
        guard !anchors.isEmpty else { throw ExportError.noMesh }
        guard let device = MTLCreateSystemDefaultDevice() else { throw ExportError.noMetal }
        guard MDLAsset.canExportFileExtension(url.pathExtension) else { throw ExportError.unsupportedFormat }

        let allocator = MTKMeshBufferAllocator(device: device)
        let asset = MDLAsset(bufferAllocator: allocator)
        for anchor in anchors {
            asset.add(makeMesh(anchor: anchor, allocator: allocator))
        }
        try asset.export(to: url)
    }

    private static func makeMesh(anchor: ARMeshAnchor, allocator: MTKMeshBufferAllocator) -> MDLMesh {
        let geometry = anchor.geometry
        let vertices = geometry.vertices

        // Vértices en espacio de mundo, empaquetados como 3 floats (stride 12)
        var vertexData = Data(capacity: vertices.count * 12)
        for i in 0..<vertices.count {
            let ptr = vertices.buffer.contents().advanced(by: vertices.offset + vertices.stride * i)
            let p = ptr.assumingMemoryBound(to: (Float, Float, Float).self).pointee
            let w = anchor.transform * SIMD4<Float>(p.0, p.1, p.2, 1)
            var xyz = (w.x, w.y, w.z)
            withUnsafeBytes(of: &xyz) { vertexData.append(contentsOf: $0) }
        }
        let vertexBuffer = allocator.newBuffer(with: vertexData, type: .vertex)

        let faces = geometry.faces
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

        return MDLMesh(
            vertexBuffer: vertexBuffer,
            vertexCount: vertices.count,
            descriptor: descriptor,
            submeshes: [submesh])
    }
}
