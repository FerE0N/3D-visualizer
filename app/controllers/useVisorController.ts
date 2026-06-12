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
  const [cameraOrbit, setCameraOrbit] = useState<string>('45deg 55deg 105%');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<AppTab>('viewer');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelViewerRef = useRef<any>(null);

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
    const orbits = {
      front: '0deg 90deg 105%',
      top: '0deg 0deg 105%',
      left: '-90deg 90deg 105%',
      right: '90deg 90deg 105%',
      iso: '45deg 55deg 105%'
    };
    
    // Actuamos directamente sobre el componente web si existe
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = orbits[persp];
      setShowGrid(true); // Encender malla inteligentemente
    } else {
      setCameraOrbit(orbits[persp]); // Fallback
      setShowGrid(true);
    }
  };

  const toggleGrid = () => setShowGrid(!showGrid);
  const toggleAutoRotate = () => setAutoRotate(!autoRotate);

  const processFile = async (file: File) => {
    if (!FileModel.isValidExtension(file.name)) {
      showToast('Formato no soportado. Usa .glb, .gltf o .blend', 'warning');
      return;
    }

    setIsUploading(true);

    try {
      if (FileModel.isBlenderFile(file.name)) {
        // Proceso Backend: Convertir y guardar en librería
        showToast('Enviando .blend al servidor...', 'info');
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
    cameraOrbit,
    showGrid,
    autoRotate,
    currentTab,
    fileInputRef,
    modelViewerRef,

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
    toggleAutoRotate
  };
}
