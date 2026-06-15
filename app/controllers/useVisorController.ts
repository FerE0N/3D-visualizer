import { useState, useCallback, useRef, useEffect } from 'react';
import { FileModel } from '../models/FileModel';
import { LibraryModel } from '../models/LibraryModel';
import { ToastData, ToastType } from '../components/Toast';

export type AppTab = 'viewer' | 'library';
export type Perspective = 'front' | 'top' | 'left' | 'right' | 'iso';

export function useVisorController() {
  // State
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [currentPerspective, setCurrentPerspective] = useState<string>('iso');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [studioLight, setStudioLight] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<AppTab>('viewer');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar librería al inicio
  useEffect(() => {
    LibraryModel.fetchLibrary().then(items => setLibraryItems(items.reverse()));
  }, []);

  // Limpieza de memoria al desmontar
  useEffect(() => {
    return () => {
      if (modelUrl && modelUrl.startsWith('blob:')) FileModel.revokeLocalUrl(modelUrl);
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
  const setPerspective = (persp: Perspective) => {
    setCurrentPerspective(persp);
    setShowGrid(true); // Encender malla inteligentemente
  };

  const toggleGrid = () => setShowGrid(!showGrid);
  const toggleAutoRotate = () => setAutoRotate(!autoRotate);
  const toggleStudioLight = () => setStudioLight(!studioLight);

  const processFile = async (file: File) => {
    if (!FileModel.isValidExtension(file.name)) {
      showToast('Formato no soportado. Usa .glb, .blend, .stl, .obj, .fbx...', 'warning');
      return;
    }

    try {
      setIsUploading(true);

      if (FileModel.isConvertibleFile(file.name)) {
        // Proceso Backend: Subir .blend, .stl, .obj, etc. para convertir a .glb
        showToast('Convirtiendo formato universal a GLB optimizado...', 'info');
        const newItem = await FileModel.convertBlendToGlb(file);
        setModelUrl(newItem.url);
        setLibraryItems(prev => [newItem, ...prev]);
        showToast('Conversión guardada en Biblioteca', 'success');
      } else {
        // Proceso Backend: Subir archivo estático a la librería
        showToast('Guardando modelo en Biblioteca...', 'info');
        const newItem = await LibraryModel.uploadToLibrary(file);
        setModelUrl(newItem.url);
        setLibraryItems(prev => [newItem, ...prev]);
        showToast('Modelo guardado exitosamente', 'success');
      }
    } catch (error: any) {
      showToast(`Fallo crítico: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
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
    if (modelUrl && modelUrl.startsWith('blob:')) FileModel.revokeLocalUrl(modelUrl);
    setModelUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFromLibrary = (url: string) => {
    setModelUrl(url);
    setCurrentTab('viewer'); // Cambia automáticamente a la vista del modelo
    showToast('Abriendo desde la Biblioteca', 'info');
  };

  return {
    // Estado
    modelUrl,
    isUploading,
    isDragOver,
    toasts,
    libraryItems,
    currentPerspective,
    showGrid,
    autoRotate,
    studioLight,
    currentTab,
    fileInputRef,

    // Acciones
    setIsDragOver,
    handleDrop,
    handleFileChange,
    openFileDialog,
    closeViewer,
    openFromLibrary,
    setCurrentTab,
    setPerspective,
    toggleGrid,
    setShowGrid,
    toggleAutoRotate,
    toggleStudioLight
  };
}
