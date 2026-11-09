import RoomPlan
import UIKit
import simd

/// Plano 2D (vista cenital, metros) y medidas a partir de un CapturedRoom.
struct FloorPlan {
    struct Segment {
        enum Kind: String, Codable { case wall, door, window, opening, object }
        let kind: Kind
        let a: SIMD2<Float>
        let b: SIMD2<Float>
    }

    struct Item: Codable {
        let type: String
        let widthM: Float
        let heightM: Float
        let depthM: Float
    }

    struct Summary: Codable {
        var areaM2: Float
        var perimeterM: Float
        var ceilingHeightM: Float
        var walls: Int
        var doors: [Item]
        var windows: [Item]
        var openings: [Item]
        var objects: [Item]
    }

    private(set) var segments: [Segment] = []
    private(set) var summary: Summary

    init(room: CapturedRoom) {
        func line(_ s: CapturedRoom.Surface, _ kind: Segment.Kind) -> Segment {
            let t = s.transform
            let c = SIMD2<Float>(t.columns.3.x, t.columns.3.z)
            var d = SIMD2<Float>(t.columns.0.x, t.columns.0.z)
            let len = simd_length(d)
            if len > 1e-6 { d /= len }
            let h = s.dimensions.x / 2
            return Segment(kind: kind, a: c - d * h, b: c + d * h)
        }
        func item(_ s: CapturedRoom.Surface) -> Item {
            Item(type: String(describing: s.category), widthM: s.dimensions.x,
                 heightM: s.dimensions.y, depthM: s.dimensions.z)
        }

        segments += room.walls.map { line($0, .wall) }
        segments += room.doors.map { line($0, .door) }
        segments += room.windows.map { line($0, .window) }
        segments += room.openings.map { line($0, .opening) }

        var objects: [Item] = []
        for o in room.objects {
            let t = o.transform
            let c = SIMD2<Float>(t.columns.3.x, t.columns.3.z)
            func axis(_ col: SIMD4<Float>) -> SIMD2<Float> {
                let v = SIMD2<Float>(col.x, col.z)
                let l = simd_length(v)
                return l > 1e-6 ? v / l : v
            }
            let ax = axis(t.columns.0) * (o.dimensions.x / 2)
            let az = axis(t.columns.2) * (o.dimensions.z / 2)
            let p = [c - ax - az, c + ax - az, c + ax + az, c - ax + az]
            for i in 0..<4 { segments.append(Segment(kind: .object, a: p[i], b: p[(i + 1) % 4])) }
            objects.append(Item(type: String(describing: o.category), widthM: o.dimensions.x,
                                heightM: o.dimensions.y, depthM: o.dimensions.z))
        }

        // Área: polígono del suelo (iOS 17); si no hay, caja envolvente de las paredes.
        var area: Float = 0
        if let floor = room.floors.first, floor.polygonCorners.count >= 3 {
            let c = floor.polygonCorners
            var sum: Float = 0
            for i in 0..<c.count {
                let p = c[i], q = c[(i + 1) % c.count]
                sum += p.x * q.y - q.x * p.y
            }
            area = abs(sum) / 2
        }
        let wallsSegs = segments.filter { $0.kind == .wall }
        if area < 0.01, !wallsSegs.isEmpty {
            let pts = wallsSegs.flatMap { [$0.a, $0.b] }
            let mn = pts.reduce(pts[0], simd_min), mx = pts.reduce(pts[0], simd_max)
            area = (mx.x - mn.x) * (mx.y - mn.y)
        }

        summary = Summary(
            areaM2: area,
            perimeterM: room.walls.reduce(0) { $0 + $1.dimensions.x },
            ceilingHeightM: room.walls.map { $0.dimensions.y }.max() ?? 0,
            walls: room.walls.count,
            doors: room.doors.map(item),
            windows: room.windows.map(item),
            openings: room.openings.map(item),
            objects: objects)
    }

    var summaryText: String {
        String(format: "%.1f m² · perímetro %.1f m · altura %.2f m · %d puertas · %d ventanas",
               summary.areaM2, summary.perimeterM, summary.ceilingHeightM,
               summary.doors.count, summary.windows.count)
    }

    private var bounds: (min: SIMD2<Float>, max: SIMD2<Float>) {
        let pts = segments.flatMap { [$0.a, $0.b] }
        guard let f = pts.first else { return (.zero, SIMD2(1, 1)) }
        return (pts.reduce(f, simd_min), pts.reduce(f, simd_max))
    }

    // MARK: - JSON

    func jsonData() throws -> Data {
        let enc = JSONEncoder()
        enc.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try enc.encode(summary)
    }

    // MARK: - DXF (AutoCAD / CAD, unidades: metros)

    func dxf() -> String {
        func layer(_ k: Segment.Kind) -> (name: String, aci: Int) {
            switch k {
            case .wall: ("MUROS", 7)
            case .door: ("PUERTAS", 3)
            case .window: ("VENTANAS", 5)
            case .opening: ("HUECOS", 4)
            case .object: ("MOBILIARIO", 30)
            }
        }
        var s = "0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n6\n0\nENDSEC\n"
        s += "0\nSECTION\n2\nENTITIES\n"
        for seg in segments {
            let l = layer(seg.kind)
            // DXF tiene Y hacia arriba; el plano usa Z hacia abajo → se invierte.
            s += String(format: "0\nLINE\n8\n%@\n62\n%d\n10\n%.4f\n20\n%.4f\n30\n0\n11\n%.4f\n21\n%.4f\n31\n0\n",
                        l.name, l.aci, seg.a.x, -seg.a.y, seg.b.x, -seg.b.y)
        }
        s += "0\nENDSEC\n0\nEOF\n"
        return s
    }

    // MARK: - SVG

    func svg() -> String {
        let (mn, mx) = bounds
        let m: Float = 0.6
        let w = mx.x - mn.x + 2 * m, h = mx.y - mn.y + 2 * m + 0.5
        func color(_ k: Segment.Kind) -> (String, Float) {
            switch k {
            case .wall: ("#111111", 0.12)
            case .door: ("#2e9e44", 0.06)
            case .window: ("#2b6fd6", 0.06)
            case .opening: ("#18a2a2", 0.06)
            case .object: ("#b5651d", 0.03)
            }
        }
        var s = String(format: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"%.3f %.3f %.3f %.3f\" width=\"%d\" height=\"%d\">\n",
                       mn.x - m, mn.y - m, w, h, Int(w * 100), Int(h * 100))
        s += String(format: "<rect x=\"%.3f\" y=\"%.3f\" width=\"%.3f\" height=\"%.3f\" fill=\"white\"/>\n", mn.x - m, mn.y - m, w, h)
        for seg in segments {
            let (c, sw) = color(seg.kind)
            s += String(format: "<line x1=\"%.4f\" y1=\"%.4f\" x2=\"%.4f\" y2=\"%.4f\" stroke=\"%@\" stroke-width=\"%.3f\" stroke-linecap=\"round\"/>\n",
                        seg.a.x, seg.a.y, seg.b.x, seg.b.y, c, sw)
            if seg.kind == .wall {
                let mid = (seg.a + seg.b) / 2
                s += String(format: "<text x=\"%.3f\" y=\"%.3f\" font-size=\"0.18\" font-family=\"sans-serif\" text-anchor=\"middle\" fill=\"#555\">%.2f m</text>\n",
                            mid.x, mid.y - 0.12, simd_distance(seg.a, seg.b))
            }
        }
        s += String(format: "<text x=\"%.3f\" y=\"%.3f\" font-size=\"0.22\" font-family=\"sans-serif\" fill=\"#111\">%@</text>\n</svg>\n",
                    mn.x - m + 0.2, mx.y + m + 0.3, summaryText)
        return s
    }

    // MARK: - PDF (A4 horizontal)

    func pdfData() -> Data {
        let page = CGRect(x: 0, y: 0, width: 842, height: 595)
        let (mn, mx) = bounds
        let w = max(mx.x - mn.x, 0.1), h = max(mx.y - mn.y, 0.1)
        let scale = CGFloat(min((842 - 100) / w, (595 - 160) / h))
        func pt(_ p: SIMD2<Float>) -> CGPoint {
            CGPoint(x: 50 + CGFloat(p.x - mn.x) * scale, y: 90 + CGFloat(p.y - mn.y) * scale)
        }
        return UIGraphicsPDFRenderer(bounds: page).pdfData { ctx in
            ctx.beginPage()
            ("Plano de planta" as NSString).draw(at: CGPoint(x: 50, y: 30),
                withAttributes: [.font: UIFont.boldSystemFont(ofSize: 18)])
            (summaryText as NSString).draw(at: CGPoint(x: 50, y: 56),
                withAttributes: [.font: UIFont.systemFont(ofSize: 11), .foregroundColor: UIColor.darkGray])
            for seg in segments {
                let path = UIBezierPath()
                path.move(to: pt(seg.a)); path.addLine(to: pt(seg.b))
                switch seg.kind {
                case .wall: UIColor.black.setStroke(); path.lineWidth = 3
                case .door: UIColor.systemGreen.setStroke(); path.lineWidth = 2
                case .window: UIColor.systemBlue.setStroke(); path.lineWidth = 2
                case .opening: UIColor.systemTeal.setStroke(); path.lineWidth = 2
                case .object: UIColor.brown.setStroke(); path.lineWidth = 1
                }
                path.stroke()
                if seg.kind == .wall {
                    let a = pt(seg.a), b = pt(seg.b)
                    (String(format: "%.2f m", simd_distance(seg.a, seg.b)) as NSString).draw(
                        at: CGPoint(x: (a.x + b.x) / 2 - 15, y: (a.y + b.y) / 2 - 14),
                        withAttributes: [.font: UIFont.systemFont(ofSize: 9), .foregroundColor: UIColor.gray])
                }
            }
        }
    }
}
