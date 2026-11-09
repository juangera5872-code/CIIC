import SwiftUI
import RealityKit

/// Escaneo de objetos con Object Capture (iOS 17+, requiere LiDAR):
/// guía de captura en pantalla + fotogrametría en el dispositivo.
@MainActor
final class ObjectScanModel: ObservableObject {
    @Published var session: ObjectCaptureSession?
    @Published var state: ObjectCaptureSession.CaptureState = .initializing
    @Published var progress: Double?
    @Published var message: String?

    private var imagesDir: URL?
    private var stateTask: Task<Void, Never>?

    func start() {
        message = nil
        progress = nil
        let base = FileManager.default.temporaryDirectory
            .appendingPathComponent("capture-\(UUID().uuidString)", isDirectory: true)
        let images = base.appendingPathComponent("Images", isDirectory: true)
        try? FileManager.default.createDirectory(at: images, withIntermediateDirectories: true)
        imagesDir = images

        let s = ObjectCaptureSession()
        var config = ObjectCaptureSession.Configuration()
        config.checkpointDirectory = base.appendingPathComponent("Snapshots", isDirectory: true)
        s.start(imagesDirectory: images, configuration: config)
        session = s

        stateTask?.cancel()
        stateTask = Task { [weak self] in
            for await newState in s.stateUpdates {
                guard let self else { return }
                self.state = newState
                if case .failed(let error) = newState {
                    self.message = "Error: \(error.localizedDescription)"
                }
            }
        }
    }

    func cancel() {
        session?.cancel()
        session = nil
    }

    /// Procesa las fotos y escribe el USDZ final.
    func reconstruct(to output: URL) async {
        guard let imagesDir else { return }
        do {
            var config = PhotogrammetrySession.Configuration()
            config.featureSensitivity = .normal
            let pg = try PhotogrammetrySession(input: imagesDir, configuration: config)
            try pg.process(requests: [.modelFile(url: output, detail: .medium)])
            for try await event in pg.outputs {
                switch event {
                case .requestProgress(_, let fraction):
                    progress = fraction
                case .requestComplete:
                    progress = nil
                    message = "Guardado: \(output.lastPathComponent)"
                case .requestError(_, let error):
                    progress = nil
                    message = "Error: \(error.localizedDescription)"
                default:
                    break
                }
            }
        } catch {
            progress = nil
            message = "Error: \(error.localizedDescription)"
        }
        session = nil
    }
}

struct ObjectScanView: View {
    @EnvironmentObject var store: ModelStore
    @StateObject private var model = ObjectScanModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            if let session = model.session, model.progress == nil {
                ObjectCaptureView(session: session)
                    .ignoresSafeArea()
            } else {
                Color(.systemBackground).ignoresSafeArea()
            }

            VStack(spacing: 12) {
                if let p = model.progress {
                    ProgressView("Generando modelo…", value: p).padding(.horizontal, 32)
                }
                if let msg = model.message {
                    Text(msg).font(.footnote).padding(8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
                controls
            }
            .padding(.bottom, 24)
        }
    }

    @ViewBuilder
    private var controls: some View {
        if model.progress != nil {
            EmptyView()
        } else if let session = model.session {
            switch model.state {
            case .ready:
                Button("Detectar objeto") { _ = session.startDetecting() }
                    .buttonStyle(.borderedProminent)
            case .detecting:
                Button("Empezar captura") { session.startCapturing() }
                    .buttonStyle(.borderedProminent)
            case .capturing:
                Button("Terminar captura") { session.finish() }
                    .buttonStyle(.borderedProminent).tint(.green)
            case .completed:
                Button("Generar modelo 3D") {
                    let url = store.newURL(prefix: "object", ext: "usdz")
                    Task {
                        await model.reconstruct(to: url)
                        store.refresh()
                    }
                }
                .buttonStyle(.borderedProminent)
            default:
                EmptyView()
            }
            Button("Cancelar", role: .cancel) { model.cancel() }
        } else {
            Button("Escanear objeto", systemImage: "cube") { model.start() }
                .buttonStyle(.borderedProminent)
        }
    }
}
