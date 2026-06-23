import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const libraryPath = path.join(process.cwd(), 'data', 'library.json');
    const data = await fs.readFile(libraryPath, 'utf8');
    const library = JSON.parse(data);
    
    return NextResponse.json(library);
  } catch (error) {
    console.error('Error reading library:', error);
    // Si no existe, retornamos un arreglo vacío
    return NextResponse.json([]);
  }
}
