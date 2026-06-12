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

    if (!file.name.endsWith('.blend')) {
      return NextResponse.json({ error: 'El archivo debe ser .blend' }, { status: 400 });
    }

    // Preparar directorio temporal
    const tmpDir = path.join(os.tmpdir(), 'blender-uploads');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Nombres únicos
    const timestamp = Date.now();
    const originalName = file.name;
    const saveName = `${timestamp}_${originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    
    // El .blend sigue siendo temporal
    const inputPath = path.join(tmpDir, `${timestamp}_in.blend`);
    // El .glb se guarda permanentemente en public/models/
    const publicModelsPath = path.join(process.cwd(), 'public', 'models');
    if (!existsSync(publicModelsPath)) {
      await mkdir(publicModelsPath, { recursive: true });
    }
    const outputPath = path.join(publicModelsPath, saveName.replace('.blend', '.glb'));
    const finalUrl = `/models/${saveName.replace('.blend', '.glb')}`;
    const scriptPath = path.join(process.cwd(), 'scripts', 'export_glb.py');

    // Escribir archivo .blend al disco
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Ruta absoluta a Blender encontrada en tu sistema
    const blenderPath = 'C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe';
    const command = `"${blenderPath}" -b "${inputPath}" --python "${scriptPath}" -- "${outputPath}"`;

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
