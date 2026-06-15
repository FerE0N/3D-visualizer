import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { addToLibrary } from '../lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const validExtensions = ['.blend', '.stl', '.obj', '.fbx', '.dae', '.ply', '.3ds'];
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!validExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Formato no soportado por el conversor universal' }, { status: 400 });
    }

    // Preparar directorio temporal
    const tmpDir = path.join(os.tmpdir(), 'blender-uploads');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Nombres únicos
    const timestamp = Date.now();
    const saveName = `${timestamp}_${originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    
    // El archivo subido sigue siendo temporal
    const inputPath = path.join(tmpDir, `${timestamp}_in${ext}`);
    // El .glb se guarda permanentemente en public/models/
    const publicModelsPath = path.join(process.cwd(), 'public', 'models');
    if (!existsSync(publicModelsPath)) {
      await mkdir(publicModelsPath, { recursive: true });
    }
    
    const outputFileName = saveName.replace(ext, '.glb');
    const outputPath = path.join(publicModelsPath, outputFileName);
    const finalUrl = `/models/${outputFileName}`;
    const scriptPath = path.join(process.cwd(), 'scripts', 'export_glb.py');

    // Escribir archivo original al disco
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Ruta absoluta a Blender encontrada en tu sistema
    const blenderPath = 'C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe';
    
    // Si es .blend, Blender lo abre como su archivo principal. Si es otro, abrimos Blender vacío y el script importa.
    let command;
    if (ext === '.blend') {
      command = `"${blenderPath}" -b "${inputPath}" --python "${scriptPath}" -- "${outputPath}"`;
    } else {
      command = `"${blenderPath}" -b --python "${scriptPath}" -- "${inputPath}" "${outputPath}"`;
    }

    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecutando Blender: ${error}`);
          console.error(`Stderr: ${stderr}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    // Leer el archivo .glb generado
    if (!existsSync(outputPath)) {
      throw new Error('Blender terminó pero el archivo .glb no fue generado.');
    }

    // Limpieza de archivos temporales (no bloqueante)
    unlink(inputPath).catch(e => console.error('Error limpiando tmp:', e));

    // Guardar en base de datos local
    const newItem = await addToLibrary({
      name: originalName,
      originalName: originalName,
      url: finalUrl,
      type: 'blend-converted'
    });

    // Enviar el nuevo item con su URL para que el frontend lo use directamente
    return NextResponse.json({ success: true, item: newItem });

  } catch (error: any) {
    console.error('Error en el endpoint de conversión:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
