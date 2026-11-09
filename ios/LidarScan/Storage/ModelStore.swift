import Foundation

/// Guarda y lista los modelos exportados en Documents/Scans
/// (visible desde la app Archivos gracias a UIFileSharingEnabled).
@MainActor
final class ModelStore: ObservableObject {
    @Published private(set) var files: [URL] = []

    let directory: URL = {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Scans", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    init() { refresh() }

    func newURL(prefix: String, ext: String) -> URL {
        let f = DateFormatter()
        f.dateFormat = "yyyyMMdd-HHmmss"
        return directory.appendingPathComponent("\(prefix)-\(f.string(from: .now)).\(ext)")
    }

    func refresh() {
        let urls = (try? FileManager.default.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: [.creationDateKey],
            options: [.skipsHiddenFiles])) ?? []
        files = urls
            .filter { ["usdz", "obj", "usd"].contains($0.pathExtension.lowercased()) }
            .sorted { $0.lastPathComponent > $1.lastPathComponent }
    }

    func delete(_ url: URL) {
        try? FileManager.default.removeItem(at: url)
        refresh()
    }
}
