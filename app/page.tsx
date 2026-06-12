"use client";

import React, { useState, useRef, useEffect } from 'react';

// Declaración para ignorar el error de TypeScript sobre el tag <model-viewer>
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (modelUrl && modelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const processFile = async (file: File) => {
    const validExtensions = ['.glb', '.gltf', '.blend'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      showToast('Formato no soportado. Sube .glb, .gltf o .blend');
      return;
    }

    if (fileName.endsWith('.blend')) {
      // Necesita procesarse en el backend
      setIsUploading(true);
      showToast('Enviando .blend al servidor para conversión...');
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al convertir en el servidor');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setModelUrl(objectUrl);
        showToast('¡Conversión exitosa!');
      } catch (err: any) {
        console.error(err);
        showToast(`Error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Es .glb o .gltf: procesar localmente
      const objectUrl = URL.createObjectURL(file);
      setModelUrl(objectUrl);
    }
  };

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

  return (
    <div className="app-container">
      <header className="glass-header">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h1>3D Visor Pro</h1>
        </div>
        <p className="subtitle">Sube archivos .glb, .gltf o <b>.blend</b> directamente</p>
      </header>

      <main className="main-content">
        {!modelUrl ? (
          <div 
            className={`glass-panel upload-section ${isDragOver ? 'dragover' : ''} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".glb,.gltf,.blend" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div className="upload-content">
              {isUploading ? (
                <>
                  <div style={{width: 64, height: 64, border: '4px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem'}} />
                  <h2>Convirtiendo en el servidor...</h2>
                  <p>Por favor, espera unos segundos.</p>
                </>
              ) : (
                <>
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <h2>Selecciona un modelo 3D</h2>
                  <p>Arrastra tu archivo aquí o <span className="highlight">explora en tu dispositivo</span></p>
                  <span className="file-hint">Formatos soportados: .glb, .gltf, .blend</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel viewer-section">
            <model-viewer 
              src={modelUrl}
              alt="Modelo 3D"
              camera-controls 
              auto-rotate
              ar 
              ar-modes="webxr scene-viewer quick-look"
              shadow-intensity="1"
              environment-image="neutral"
            >
              <button slot="ar-button" id="ar-button">
                Ver en tu espacio (AR)
              </button>
            </model-viewer>
            
            <div className="viewer-controls">
              <button className="btn-secondary" onClick={() => setModelUrl(null)}>Cerrar Visor</button>
            </div>
          </div>
        )}
      </main>

      <div className={`toast ${toastMsg ? '' : 'hidden'}`}>
        {toastMsg}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
