import ModelIO

/// Convierte un modelo 3D guardado (p. ej. el USDZ de Object Capture) a otro formato.
enum ModelConverter {
    static let targets = ["obj", "ply", "stl", "usd", "abc", "usdz"]

    static func convert(_ source: URL, to ext: String, destination: URL) throws {
        guard MDLAsset.canExportFileExtension(ext) else { throw MeshExporter.ExportError.unsupportedFormat }
        let asset = MDLAsset(url: source)
        asset.loadTextures()
        try asset.export(to: destination)
    }
}
