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

# Algoritmo de curación de geometría: Recalcular normales hacia afuera
# Seleccionar y activar cada malla para entrar a modo de edición y recalcular
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        # make_consistent(inside=False) obliga a las normales a mirar hacia el exterior
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        obj.select_set(False)

# Exportar toda la escena (ya sea el .blend cargado o el archivo recién importado y curado)
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
