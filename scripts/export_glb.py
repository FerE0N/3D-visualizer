import bpy
import sys

# El último argumento pasado después de '--' será la ruta de salida
argv = sys.argv
if "--" not in argv:
    print("Error: No se especificó la ruta de salida para el archivo GLB.")
    sys.exit(1)

output_path = argv[argv.index("--") + 1]

# Asegurarse de que estamos exportando todo (u objetos seleccionados dependiendo del caso de uso)
# Para este visor, exportaremos toda la escena.
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_materials='EXPORT',
    export_apply=True,
    export_animations=True,
    export_cameras=False,
    export_lights=False
)

print(f"Exportación exitosa a {output_path}")
