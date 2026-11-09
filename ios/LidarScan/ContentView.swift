import SwiftUI
import ARKit

struct ContentView: View {
    var body: some View {
        if !ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            ContentUnavailableView(
                "LiDAR no disponible",
                systemImage: "sensor.tag.radiowaves.forward",
                description: Text("Esta app necesita un iPhone con escáner LiDAR (12 Pro o posterior).")
            )
        } else {
            TabView {
                RoomScanView()
                    .tabItem { Label("Espacio", systemImage: "house") }
                MeshScanView()
                    .tabItem { Label("Malla", systemImage: "cube.transparent") }
                ObjectScanView()
                    .tabItem { Label("Objeto", systemImage: "cube") }
                LibraryView()
                    .tabItem { Label("Modelos", systemImage: "folder") }
            }
        }
    }
}
