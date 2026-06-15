// ==========================================
// MODEL: FileModel
// Maneja toda la lógica de validación, red y datos.
// ==========================================

export class FileModel {
  static readonly VALID_EXTENSIONS = ['.glb', '.gltf', '.blend', '.stl', '.obj', '.fbx', '.dae', '.ply', '.3ds'];

  /**
   * Verifica si la extensión del archivo es válida
   */
  static isValidExtension(fileName: string): boolean {
    const name = fileName.toLowerCase();
    return this.VALID_EXTENSIONS.some(ext => name.endsWith(ext));
  }

  /**
   * Verifica si el archivo necesita conversión en el backend (no es glb nativo)
   */
  static isConvertibleFile(fileName: string): boolean {
    const name = fileName.toLowerCase();
    return !name.endsWith('.glb') && !name.endsWith('.gltf');
  }

  /**
   * Genera una URL local para visor instantáneo (Cero subida)
   */
  static createLocalUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Limpia una URL generada para liberar memoria
   */
  static revokeLocalUrl(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Envía el archivo .blend al backend para su conversión y guardado
   */
  static async convertBlendToGlb(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al convertir en el servidor');
    }

    return data.item;
  }
}
