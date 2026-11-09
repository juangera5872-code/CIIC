import ModelIO

/// Formatos de exportación de malla / nube de puntos.
enum MeshFormat: String, CaseIterable, Identifiable {
    case obj, ply, stl, usdz, usd, abc, glb, xyz

    var id: String { rawValue }

    var label: String {
        switch self {
        case .obj:  "OBJ – Wavefront (CAD / Blender / Maya)"
        case .ply:  "PLY – malla / nube (MeshLab, CloudCompare)"
        case .stl:  "STL – impresión 3D / CAD"
        case .usdz: "USDZ – Apple AR / Quick Look"
        case .usd:  "USD – Pixar / NVIDIA Omniverse"
        case .abc:  "ABC – Alembic (VFX)"
        case .glb:  "GLB – glTF binario (web, Unity, Unreal)"
        case .xyz:  "XYZ – nube de puntos (texto)"
        }
    }

    /// GLB y XYZ los escribe la app; el resto depende de ModelIO en el dispositivo.
    var isAvailable: Bool {
        switch self {
        case .glb, .xyz: true
        default: MDLAsset.canExportFileExtension(rawValue)
        }
    }
}
