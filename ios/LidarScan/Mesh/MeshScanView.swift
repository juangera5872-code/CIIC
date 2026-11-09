import SwiftUI
import RealityKit
import ARKit

/// Escaneo libre de malla con LiDAR (ARKit scene reconstruction).
struct MeshARView: UIViewRepresentable {
    let arView: ARView

    func makeUIView(context: Context) -> ARView {
        arView.debugOptions = [.showSceneUnderstanding]
        arView.renderOptions.insert(.disableMotionBlur)
        MeshARView.runSession(on: arView, reset: false)
        return arView
    }
    func updateUIView(_ uiView: ARView, context: Context) {}

    static func runSession(on arView: ARView, reset: Bool) {
        let config = ARWorldTrackingConfiguration()
        config.sceneReconstruction = .meshWithClassification
        config.environmentTexturing = .automatic
        arView.session.run(config, options: reset ? [.resetTracking, .removeExistingAnchors] : [])
    }
}

struct MeshScanView: View {
    @EnvironmentObject var store: ModelStore
    @State private var arView = ARView(frame: .zero)
    @State private var message: String?

    var body: some View {
        ZStack(alignment: .bottom) {
            MeshARView(arView: arView).ignoresSafeArea()

            VStack(spacing: 12) {
                if let message {
                    Text(message).font(.footnote).padding(8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
                HStack(spacing: 12) {
                    Button("Reiniciar", systemImage: "arrow.counterclockwise") {
                        MeshARView.runSession(on: arView, reset: true)
                        message = nil
                    }
                    .buttonStyle(.bordered)

                    Menu {
                        ForEach(MeshFormat.allCases.filter(\.isAvailable)) { f in
                            Button(f.label) { export(ext: f.rawValue) }
                        }
                    } label: {
                        Label("Exportar", systemImage: "square.and.arrow.down")
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding(.bottom, 24)
        }
    }

    private func export(ext: String) {
        let anchors = arView.session.currentFrame?.anchors.compactMap { $0 as? ARMeshAnchor } ?? []
        let url = store.newURL(prefix: "mesh", ext: ext)
        do {
            try MeshExporter.export(anchors: anchors, to: url)
            store.refresh()
            message = "Guardado: \(url.lastPathComponent)"
        } catch {
            message = error.localizedDescription
        }
    }
}
