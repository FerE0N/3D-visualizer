import fs from 'fs/promises';
import path from 'path';

export interface LibraryItem {
  id: string;
  name: string;
  originalName: string;
  url: string; // url pública (ej: /models/123.glb)
  date: string;
  type: string; // 'glb', 'blend-converted'
}

const libraryPath = path.join(process.cwd(), 'data', 'library.json');

export async function addToLibrary(item: Omit<LibraryItem, 'id' | 'date'>) {
  let library: LibraryItem[] = [];
  
  try {
    const data = await fs.readFile(libraryPath, 'utf8');
    library = JSON.parse(data);
  } catch (e) {
    // Si falla (no existe o vacío), empezamos con array vacío
  }

  const newItem: LibraryItem = {
    ...item,
    id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
    date: new Date().toISOString()
  };

  library.push(newItem);

  await fs.writeFile(libraryPath, JSON.stringify(library, null, 2));
  return newItem;
}
