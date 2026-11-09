import SwiftUI
import QuickLook

struct LibraryView: View {
    @EnvironmentObject var store: ModelStore
    @State private var preview: URL?
    @State private var message: String?

    var body: some View {
        NavigationStack {
            Group {
                if store.files.isEmpty {
                    ContentUnavailableView("Sin modelos", systemImage: "cube",
                                           description: Text("Los escaneos exportados aparecerán aquí."))
                } else {
                    List {
                        ForEach(store.files, id: \.self) { url in
                            HStack {
                                if ModelStore.isViewable(url) {
                                    NavigationLink(value: url) { row(url) }
                                } else {
                                    Button { preview = url } label: { row(url) }
                                }
                                ShareLink(item: url) { Image(systemName: "square.and.arrow.up") }
                                    .buttonStyle(.borderless)
                            }
                            .contextMenu {
                                if ModelStore.isViewable(url) {
                                    Menu("Convertir a…", systemImage: "arrow.triangle.2.circlepath") {
                                        ForEach(ModelConverter.targets.filter { $0 != url.pathExtension.lowercased() }, id: \.self) { ext in
                                            Button(ext.uppercased()) { convert(url, ext) }
                                        }
                                    }
                                }
                                Button("Borrar", systemImage: "trash", role: .destructive) { store.delete(url) }
                            }
                        }
                        .onDelete { idx in idx.map { store.files[$0] }.forEach(store.delete) }
                    }
                }
            }
            .navigationTitle("Modelos")
            .navigationDestination(for: URL.self) { ModelViewer(url: $0) }
            .quickLookPreview($preview)
            .safeAreaInset(edge: .bottom) {
                if let message {
                    Text(message).font(.footnote).padding(8)
                        .background(.ultraThinMaterial, in: Capsule())
                }
            }
            .onAppear { store.refresh() }
        }
    }

    private func row(_ url: URL) -> some View {
        Label(url.lastPathComponent, systemImage: ModelStore.isViewable(url) ? "cube" : "doc")
    }

    private func convert(_ url: URL, _ ext: String) {
        let dest = url.deletingPathExtension().appendingPathExtension(ext)
        do {
            try ModelConverter.convert(url, to: ext, destination: dest)
            store.refresh()
            message = "Convertido: \(dest.lastPathComponent)"
        } catch {
            message = "Error: \(error.localizedDescription)"
        }
    }
}
