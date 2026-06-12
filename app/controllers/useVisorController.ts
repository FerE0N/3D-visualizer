import { useState, useCallback, useRef, useEffect } from 'react';
import { FileModel } from '../models/FileModel';
import { ToastData, ToastType } from '../components/Toast';

export function useVisorController() {
  // State
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpieza de memoria al desmontar
  useEffect(() => {
    return () => {
      if (modelUrl) FileModel.revokeLocalUrl(modelUrl);
    };
  }, [modelUrl]);

  // Manejador de Alertas (Toasts)
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-eliminar
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Lógica principal de procesamiento de archivo
  const processFile = async (file: File) => {
    if (!FileModel.isValidExtension(file.name)) {
      showToast('Formato no soportado. Usa .glb, .gltf o .blend', 'warning');
      return;
    }

    if (FileModel.isBlenderFile(file.name)) {
      // Proceso Backend
      setIsUploading(true);
      showToast('Enviando .blend al servidor...', 'info');
      
      try {
        const objectUrl = await FileModel.convertBlendToGlb(file);
        setModelUrl(objectUrl);
        showToast('Conversión completada con éxito', 'success');
      } catch (error: any) {
        showToast(`Fallo crítico: ${error.message}`, 'error');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Proceso Local Frontend
      const objectUrl = FileModel.createLocalUrl(file);
      setModelUrl(objectUrl);
      showToast('Modelo cargado exitosamente', 'success');
    }
  };

  // Eventos de la UI
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const closeViewer = () => {
    if (modelUrl) FileModel.revokeLocalUrl(modelUrl);
    setModelUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    // Estado
    modelUrl,
    isUploading,
    isDragOver,
    toasts,
    fileInputRef,
    
    // Acciones
    setIsDragOver,
    handleDrop,
    handleFileChange,
    openFileDialog,
    closeViewer
  };
}
