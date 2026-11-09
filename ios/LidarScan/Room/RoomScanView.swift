import SwiftUI
import RoomPlan

/// Escaneo de habitaciones con RoomPlan: paredes, puertas, ventanas y muebles.
enum RoomExportFormat: String, CaseIterable, Identifiable {
    case usdzParametric, usdzMesh, dxf, svg, pdf, json
    var id: String { rawValue }
    var ext: String {
        switch self {
        case .usdzParametric, .usdzMesh: "usdz"
        case .dxf: "dxf"
        case .svg: "svg"
        case .pdf: "pdf"
        case .json: "json"
        }
    }
    var label: String {
        switch self {
        case .usdzParametric: "USDZ – modelo paramétrico (cajas)"
        case .usdzMesh: "USDZ – malla detallada"
        case .dxf: "DXF – plano 2D para AutoCAD / CAD"
        case .svg: "SVG – plano 2D vectorial"
        case .pdf: "PDF – plano con medidas"
        case .json: "JSON – medidas y listado de elementos"
        }
    }
}

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

    var summaryText: String? {
        result.map { FloorPlan(room: $0).summaryText }
    }

    func export(_ format: RoomExportFormat, store: ModelStore) {
        guard let result else { return }
        let url = store.newURL(prefix: "room", ext: format.ext)
        do {
            let plan = FloorPlan(room: result)
            switch format {
            case .usdzParametric: try result.export(to: url, exportOptions: .parametric)
            case .usdzMesh: try result.export(to: url, exportOptions: .mesh)
            case .dxf: try plan.dxf().write(to: url, atomically: true, encoding: .utf8)
            case .svg: try plan.svg().write(to: url, atomically: true, encoding: .utf8)
            case .pdf: try plan.pdfData().write(to: url)
            case .json: try plan.jsonData().write(to: url)
            }
            store.refresh()
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
                if let summary = model.summaryText, !model.isScanning {
                    Text(summary).font(.footnote.weight(.medium)).padding(8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
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
                            Menu {
                                ForEach(RoomExportFormat.allCases) { f in
                                    Button(f.label) { model.export(f, store: store) }
                                }
                            } label: {
                                Label("Exportar", systemImage: "square.and.arrow.down")
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
