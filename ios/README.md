# LiDAR Scan (iOS)

App SwiftUI para iPhone con LiDAR que escanea espacios y objetos en 3D y exporta modelos.

| Pestaña | Tecnología | Salida |
|---|---|---|
| Espacio | RoomPlan | USDZ paramétrico (paredes, puertas, ventanas, muebles) |
| Malla | ARKit scene reconstruction + ModelIO | OBJ / USDZ de la malla completa |
| Objeto | Object Capture + PhotogrammetrySession | USDZ texturizado |
| Modelos | QuickLook | Vista previa, compartir, borrar |

Los archivos se guardan en `Documents/Scans` y se ven desde la app **Archivos** de iOS.

## Requisitos
- Mac con Xcode 15+ y iPhone con LiDAR (12 Pro o posterior), iOS 17+.
- No funciona en el simulador (no hay LiDAR ni cámara).

## Abrir el proyecto
```sh
brew install xcodegen
cd ios
xcodegen generate     # crea LidarScan.xcodeproj
open LidarScan.xcodeproj
```
En Xcode: selecciona tu Team en *Signing & Capabilities*, conecta el iPhone y pulsa Run.

## Notas
- El alcance útil del LiDAR es ~5 m; vidrio y superficies reflectantes se escanean mal.
- Código escrito sin compilar en Xcode: si hay algún error de compilación menor, avísame.
