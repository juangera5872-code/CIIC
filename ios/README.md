# LiDAR Scan (iOS)

App SwiftUI para iPhone con LiDAR que escanea espacios y objetos en 3D, mide y exporta a formatos de la industria.

| Pestaña | Tecnología | Salida |
|---|---|---|
| Espacio | RoomPlan | USDZ (paramétrico o malla), **DXF** (AutoCAD), **SVG**, **PDF** con medidas, **JSON** (área, perímetro, altura, puertas, ventanas, mobiliario) |
| Malla | ARKit scene reconstruction | OBJ, PLY, STL, USDZ, USD, ABC (Alembic), GLB (glTF), XYZ (nube de puntos) |
| Objeto | Object Capture | USDZ texturizado |
| Modelos | SceneKit / QuickLook | Visor 3D con **regla** (toca 2 puntos), compartir, borrar, **convertir** USDZ/OBJ/PLY/STL/USD/ABC entre sí |

Los archivos se guardan en `Documents/Scans` y se ven desde la app **Archivos** de iOS.

## Instalación (un comando)
Mac con Xcode 15+, iPhone con LiDAR (12 Pro o posterior) con iOS 17+ y cable USB. En el iPhone activa
*Ajustes > Privacidad y seguridad > Modo desarrollador*.
```sh
cd ios
./install.sh          # o: TEAM_ID=ABCDE12345 BUNDLE_ID=com.tunombre.lidarscan ./install.sh
```
El script instala XcodeGen, genera el proyecto, compila y lo instala/abre en el iPhone.
Para distribuir a otras personas (TestFlight / .ipa firmado) hace falta una cuenta Apple Developer de pago.

## Requisitos
- Mac con Xcode 15+ y iPhone con LiDAR (12 Pro o posterior), iOS 17+.
- No funciona en el simulador (no hay LiDAR ni cámara).

## Abrir el proyecto en Xcode (alternativa manual)
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
