import SwiftUI
import RoomPlan

/// Escaneo de habitaciones con RoomPlan: paredes, puertas, ventanas y muebles.
@MainActor
final class RoomScanModel: NSObject, ObservableObject, RoomCaptureViewDelegate, RoomCaptureSessionDelegate {
    let captureView: RoomCaptureView
    @Published var isScanning = false
    @Published var result: CapturedRoom?
    @Published var message: String?

    override init() {
        captureView = RoomCaptureView(frame: .zero)
        super.init()
        captureView.delegate = self
        captureView.captureSession.delegate = self
    }

    // RoomCaptureViewDelegate hereda de NSCoding
    required init?(coder: NSCoder) { fatalError("init(coder:) no soportado") }
    func encode(with coder: NSCoder) {}

    func start() {
        result = nil
        message = nil
        isScanning = true
        captureView.captureSession.run(configuration: RoomCaptureSession.Configuration())
    }

    func stop() {
        isScanning = false
        captureView.captureSession.stop()
    }

    nonisolated func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool { true }

    nonisolated func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        Task { @MainActor in self.result = processedResult }
    }

    func export(to url: URL) {
        guard let result else { return }
        do {
            // .parametric = modelo limpio (cajas); .mesh = malla detallada
            try result.export(to: url, exportOptions: .parametric)
            message = "Guardado: \(url.lastPathComponent)"
        } catch {
            message = "Error al exportar: \(error.localizedDescription)"
        }
    }
}

struct RoomCaptureRepresentable: UIViewRepresentable {
    let view: RoomCaptureView
    func makeUIView(context: Context) -> RoomCaptureView { view }
    func updateUIView(_ uiView: RoomCaptureView, context: Context) {}
}

struct RoomScanView: View {
    @EnvironmentObject var store: ModelStore
    @StateObject private var model = RoomScanModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            RoomCaptureRepresentable(view: model.captureView)
                .ignoresSafeArea()

            VStack(spacing: 12) {
                if let msg = model.message {
                    Text(msg).font(.footnote).padding(8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
                HStack(spacing: 16) {
                    if model.isScanning {
                        Button("Terminar", systemImage: "stop.fill") { model.stop() }
                            .buttonStyle(.borderedProminent).tint(.red)
                    } else {
                        Button("Escanear", systemImage: "viewfinder") { model.start() }
                            .buttonStyle(.borderedProminent)
                        if model.result != nil {
                            Button("Guardar USDZ", systemImage: "square.and.arrow.down") {
                                model.export(to: store.newURL(prefix: "room", ext: "usdz"))
                                store.refresh()
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }
            .padding(.bottom, 24)
        }
    }
}
