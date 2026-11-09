import SwiftUI
import SceneKit

/// Visor 3D con órbita/zoom y regla: toca dos puntos del modelo para medir (metros).
struct ModelViewer: View {
    let url: URL
    @State private var distance: String?

    var body: some View {
        ZStack(alignment: .bottom) {
            SceneKitView(url: url, distance: $distance).ignoresSafeArea(edges: .bottom)
            Text(distance ?? "Toca dos puntos para medir")
                .font(.footnote.weight(.medium)).padding(8)
                .background(.ultraThinMaterial, in: Capsule())
                .padding(.bottom, 16)
        }
        .navigationTitle(url.lastPathComponent)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct SceneKitView: UIViewRepresentable {
    let url: URL
    @Binding var distance: String?

    func makeCoordinator() -> Coordinator { Coordinator(distance: $distance) }

    func makeUIView(context: Context) -> SCNView {
        let view = SCNView()
        view.scene = try? SCNScene(url: url, options: nil)
        view.allowsCameraControl = true
        view.autoenablesDefaultLighting = true
        view.backgroundColor = .secondarySystemBackground
        view.addGestureRecognizer(UITapGestureRecognizer(target: context.coordinator,
                                                         action: #selector(Coordinator.tap(_:))))
        context.coordinator.view = view
        return view
    }
    func updateUIView(_ uiView: SCNView, context: Context) {}

    final class Coordinator: NSObject {
        weak var view: SCNView?
        var distance: Binding<String?>
        private var points: [SCNVector3] = []
        private var markers: [SCNNode] = []

        init(distance: Binding<String?>) { self.distance = distance }

        @objc func tap(_ g: UITapGestureRecognizer) {
            guard let view, let root = view.scene?.rootNode else { return }
            let hits = view.hitTest(g.location(in: view), options: nil)
            guard let hit = hits.first(where: { $0.node.name != "marker" }) else { return }

            if points.count >= 2 { reset() }
            points.append(hit.worldCoordinates)

            let marker = SCNNode(geometry: SCNSphere(radius: 0.015))
            marker.geometry?.firstMaterial?.diffuse.contents = UIColor.systemRed
            marker.name = "marker"
            marker.position = hit.worldCoordinates
            root.addChildNode(marker)
            markers.append(marker)

            if points.count == 2 {
                let a = points[0], b = points[1]
                let d = sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2) + pow(a.z - b.z, 2))
                distance.wrappedValue = String(format: "Distancia: %.3f m  (%.1f cm)", d, d * 100)
            } else {
                distance.wrappedValue = "Toca el segundo punto"
            }
        }

        private func reset() {
            markers.forEach { $0.removeFromParentNode() }
            markers.removeAll(); points.removeAll()
            distance.wrappedValue = nil
        }
    }
}
