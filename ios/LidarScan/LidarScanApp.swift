import SwiftUI

@main
struct LidarScanApp: App {
    @StateObject private var store = ModelStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
