"use client";

import React from 'react';
import { useVisorController } from './controllers/useVisorController';
import ToastContainer from './components/Toast';

// Declaración para Web Components en React 18+
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function Home() {
  const ctrl = useVisorController();

  return (
    <div className="app-container">
      {/* HEADER */}
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

      {/* VISTA PRINCIPAL */}
      <main className="main-content">
        {!ctrl.modelUrl ? (
          <div 
            className={`glass-panel upload-section ${ctrl.isDragOver ? 'dragover' : ''} ${ctrl.isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); ctrl.setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); ctrl.setIsDragOver(false); }}
            onDrop={ctrl.handleDrop}
            onClick={ctrl.openFileDialog}
          >
            <input 
              type="file" 
              ref={ctrl.fileInputRef} 
              accept=".glb,.gltf,.blend" 
              style={{ display: 'none' }} 
              onChange={ctrl.handleFileChange}
            />
            <div className="upload-content">
              {ctrl.isUploading ? (
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
              src={ctrl.modelUrl}
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
              <button className="btn-secondary" onClick={ctrl.closeViewer}>Cerrar Visor</button>
            </div>
          </div>
        )}
      </main>

      {/* VISTA DEL SISTEMA DE NOTIFICACIONES */}
      <ToastContainer toasts={ctrl.toasts} />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
