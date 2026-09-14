#!/usr/bin/env python3
"""Render de verificacion del engrane: vista 3D sombreada y perfil 2D acotado.

Requiere numpy y matplotlib (solo para la vista previa; `gear.py` no depende
de ellos). Uso:  python3 preview.py [salida.png]
"""

from __future__ import annotations

import sys

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle, PathPatch
from matplotlib.path import Path
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

from gear import GearSpec, build_mesh, gear_outline

AZUL = "#1e3a8a"
CIAN = "#0ea5e9"


def render(spec: GearSpec, path: str) -> None:
    fig = plt.figure(figsize=(13, 6.2), facecolor="white")

    # --- Vista 3D ---------------------------------------------------------
    ax = fig.add_subplot(1, 2, 1, projection="3d")
    tris = np.array(build_mesh(spec))
    ax.add_collection3d(
        Poly3DCollection(
            tris,
            facecolors=CIAN,
            edgecolors=CIAN,  # sin aristas visibles: el relieve lo da el sombreado
            linewidths=0,
            shade=True,
            lightsource=matplotlib.colors.LightSource(azdeg=225, altdeg=45),
        )
    )
    lim = spec.tip_radius * 1.05
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_zlim(-lim, lim)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=28, azim=-52)
    ax.set_axis_off()
    ax.set_title(
        f"Engrane recto  Ø{2 * spec.tip_radius:g} mm  ·  m={spec.module:g}  z={spec.teeth}",
        color=AZUL,
        fontsize=13,
        pad=0,
    )

    # --- Perfil 2D --------------------------------------------------------
    ax2 = fig.add_subplot(1, 2, 2)
    points = gear_outline(spec)
    outline = np.array(points + [points[0]])
    # Relleno con el barreno como hueco: contorno exterior CCW + barreno CW.
    theta = np.linspace(0, 2 * np.pi, 96)
    hole = np.column_stack([(spec.bore / 2) * np.cos(theta), (spec.bore / 2) * np.sin(theta)])[::-1]
    verts = np.vstack([outline, hole])
    codes = (
        [Path.MOVETO] + [Path.LINETO] * (len(outline) - 2) + [Path.CLOSEPOLY]
        + [Path.MOVETO] + [Path.LINETO] * (len(hole) - 2) + [Path.CLOSEPOLY]
    )
    ax2.add_patch(PathPatch(Path(verts, codes), color=CIAN, alpha=0.28, lw=0, zorder=1))
    ax2.plot(outline[:, 0], outline[:, 1], color=AZUL, lw=1.4, zorder=3)

    circles = [
        (spec.tip_radius, f"Ø exterior {2 * spec.tip_radius:g}", "-", "#dc2626"),
        (spec.pitch_radius, f"Ø primitivo {2 * spec.pitch_radius:g}", "--", "#16a34a"),
        (spec.base_radius, f"Ø base {2 * spec.base_radius:.2f}", ":", "#a16207"),
        (spec.root_radius, f"Ø raiz {2 * spec.root_radius:g}", "-.", "#7c3aed"),
        (spec.bore / 2, f"Barreno Ø{spec.bore:g}", "-", "#0f172a"),
    ]
    for radius, label, style, color in circles:
        ax2.add_patch(
            Circle((0, 0), radius, fill=False, ls=style, lw=1.1, ec=color, label=label, zorder=4)
        )

    ax2.set_xlim(-lim, lim)
    ax2.set_ylim(-lim, lim)
    ax2.set_aspect("equal")
    ax2.grid(alpha=0.2, lw=0.5)
    ax2.set_xlabel("mm")
    ax2.set_ylabel("mm")
    ax2.set_title("Perfil de evolvente (alpha = 20°)", color=AZUL, fontsize=13)
    ax2.legend(loc="upper right", fontsize=8, framealpha=0.9)

    fig.tight_layout()
    fig.savefig(path, dpi=150)
    print(f"Vista previa: {path}")


if __name__ == "__main__":
    render(GearSpec(), sys.argv[1] if len(sys.argv) > 1 else "engrane-30mm.png")
