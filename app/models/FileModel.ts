// ==========================================
// MODEL: FileModel
// Maneja toda la lógica de validación, red y datos.
// ==========================================

export class FileModel {
  static readonly VALID_EXTENSIONS = ['.glb', '.gltf', '.blend'];

  /**
   * Verifica si la extensión del archivo es válida
   */
  static isValidExtension(fileName: string): boolean {
    const name = fileName.toLowerCase();
    return this.VALID_EXTENSIONS.some(ext => name.endsWith(ext));
  }

  /**
   * Verifica si un archivo es un .blend (requiere conversión en backend)
   */
  static isBlenderFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.blend');
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
   * Envía el archivo .blend al backend para su conversión y devuelve la URL del .glb
   */
  static async convertBlendToGlb(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = 'Error al convertir en el servidor';
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Ignorar si no hay JSON
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
