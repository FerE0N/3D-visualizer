import bpy
import sys
import os

# El argumento '--' separa los argumentos de Blender de los de nuestro script
argv = sys.argv
if "--" not in argv:
    print("Error: No se especificaron argumentos para el script.")
    sys.exit(1)

args = argv[argv.index("--") + 1:]

# Si pasamos 1 argumento, es el archivo de salida (modo .blend original).
# Si pasamos 2 argumentos, el primero es el input y el segundo el output (modo conversor universal).
if len(args) == 1:
    output_path = args[0]
elif len(args) == 2:
    input_path = args[0]
    output_path = args[1]
    ext = os.path.splitext(input_path)[1].lower()

    # Como abrimos Blender vacío, limpiamos la escena (cubo, luz y cámara por defecto)
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Importar el archivo según su extensión
    try:
        if ext == '.obj':
            # En Blender 4.0+ se usa wm.obj_import, en versiones antiguas import_scene.obj
            if hasattr(bpy.ops.wm, "obj_import"):
                bpy.ops.wm.obj_import(filepath=input_path)
            else:
                bpy.ops.import_scene.obj(filepath=input_path)
        elif ext == '.stl':
            if hasattr(bpy.ops.wm, "stl_import"):
                bpy.ops.wm.stl_import(filepath=input_path)
            else:
                bpy.ops.import_mesh.stl(filepath=input_path)
        elif ext == '.fbx':
            bpy.ops.import_scene.fbx(filepath=input_path)
        elif ext == '.dae':
            if hasattr(bpy.ops.wm, "collada_import"):
                bpy.ops.wm.collada_import(filepath=input_path)
            else:
                bpy.ops.wm.collada_import(filepath=input_path)
        elif ext == '.ply':
            if hasattr(bpy.ops.wm, "ply_import"):
                bpy.ops.wm.ply_import(filepath=input_path)
            else:
                bpy.ops.import_mesh.ply(filepath=input_path)
        elif ext == '.3ds':
            bpy.ops.import_scene.autodesk_3ds(filepath=input_path)
        else:
            print(f"Error: Extensión {ext} no soportada para importación.")
            sys.exit(1)
    except Exception as e:
        print(f"Error al importar el archivo {ext}: {str(e)}")
        sys.exit(1)
else:
    print("Uso incorrecto del script.")
    sys.exit(1)

# Exportar toda la escena (ya sea el .blend cargado o el archivo recién importado)
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_materials='EXPORT',
    export_apply=True,
    export_animations=True,
    export_cameras=False,
    export_lights=True
)

print(f"Exportación exitosa a {output_path}")
