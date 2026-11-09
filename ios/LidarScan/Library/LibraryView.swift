import SwiftUI
import QuickLook

struct LibraryView: View {
    @EnvironmentObject var store: ModelStore
    @State private var preview: URL?

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
                                Button {
                                    preview = url
                                } label: {
                                    Label(url.lastPathComponent, systemImage: "cube")
                                }
                                Spacer()
                                ShareLink(item: url) { Image(systemName: "square.and.arrow.up") }
                                    .buttonStyle(.borderless)
                            }
                        }
                        .onDelete { idx in idx.map { store.files[$0] }.forEach(store.delete) }
                    }
                }
            }
            .navigationTitle("Modelos")
            .quickLookPreview($preview)
            .onAppear { store.refresh() }
        }
    }
}
