import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { addToLibrary } from '../lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const validExtensions = ['.glb', '.gltf'];
    const originalName = file.name;
    const isValido = validExtensions.some(ext => originalName.toLowerCase().endsWith(ext));

    if (!isValido) {
      return NextResponse.json({ error: 'Formato no soportado para carga directa' }, { status: 400 });
    }

    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const saveName = `${timestamp}_${originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const publicModelsPath = path.join(process.cwd(), 'public', 'models');
    const outputPath = path.join(publicModelsPath, saveName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(outputPath, buffer);

    const newItem = await addToLibrary({
      name: originalName,
      originalName: originalName,
      url: `/models/${saveName}`,
      type: 'glb'
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
