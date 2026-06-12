import { LibraryItem } from '../api/lib/db';

export class LibraryModel {
  /**
   * Obtiene la lista completa de modelos desde el servidor
   */
  static async fetchLibrary(): Promise<LibraryItem[]> {
    try {
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Error al obtener la librería');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /**
   * Sube un archivo estático (.glb/.gltf) a la librería permanente
   */
  static async uploadToLibrary(file: File): Promise<LibraryItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error subiendo archivo');
    
    return data.item;
  }
}
