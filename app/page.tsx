"use client";

import React from 'react';
import { useVisorController } from './controllers/useVisorController';
import ToastContainer from './components/Toast';
import ThreeViewer from './components/ThreeViewer';

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
      {/* 1. HEADER (BLOQUE AZUL REPRESENATIVO) */}
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

      {/* 2. MENÚ DE OPCIONES (BLOQUE AMARILLO REPRESENTATIVO) */}
      <nav className="nav-menu">
        <button
          className={`nav-item ${ctrl.currentTab === 'viewer' ? 'active' : ''}`}
          onClick={() => ctrl.setCurrentTab('viewer')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          Visor 3D
        </button>
        <button
          className={`nav-item ${ctrl.currentTab === 'library' ? 'active' : ''}`}
          onClick={() => ctrl.setCurrentTab('library')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Mi Biblioteca Compartida
        </button>
      </nav>

      {/* 3. ÁREA PRINCIPAL (BLOQUE NEGRO REPRESENTATIVO) */}
      <main className="main-content">

        {/* VISTA: VISOR O SUBIDA */}
        {ctrl.currentTab === 'viewer' && (
          <>
            {!ctrl.modelUrl ? (
              <div
                className={`glass-panel upload-section ${ctrl.isDragOver ? 'dragover' : ''} ${ctrl.isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ margin: '2rem auto', maxWidth: '800px', width: '100%' }}
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
                      <div style={{ width: 64, height: 64, border: '4px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
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
              <div className="viewer-section">
                
                {/* PANEL DE HERRAMIENTAS FLOTANTE */}
                <div className="tools-panel">
                  <button className="tool-btn" onClick={() => ctrl.setPerspective('front')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                    </svg>
                    Frente
                  </button>
                  <button className="tool-btn" onClick={() => ctrl.setPerspective('top')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="12" y1="3" x2="12" y2="21"></line>
                    </svg>
                    Arriba
                  </button>
                  <button className="tool-btn" onClick={() => ctrl.setPerspective('iso')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    Iso
                  </button>
                  <hr style={{borderColor: 'var(--glass-border)', margin: '4px 0'}} />
                  <button className={`tool-btn ${ctrl.autoRotate ? 'active' : ''}`} onClick={ctrl.toggleAutoRotate}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                    Giro
                  </button>
                  <button className={`tool-btn ${ctrl.showGrid ? 'active' : ''}`} onClick={ctrl.toggleGrid}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h18v18H3z"></path>
                      <path d="M3 9h18"></path>
                      <path d="M3 15h18"></path>
                      <path d="M9 3v18"></path>
                      <path d="M15 3v18"></path>
                    </svg>
                    Malla
                  </button>
                </div>

                <ThreeViewer 
                  modelUrl={ctrl.modelUrl} 
                  autoRotate={ctrl.autoRotate} 
                  showGrid={ctrl.showGrid} 
                  perspective={ctrl.currentPerspective}
                  onInteract={() => ctrl.setShowGrid(false)} 
                />
                
                <div className="viewer-controls">
                  <button className="btn-secondary" onClick={ctrl.closeViewer}>Cerrar Visor</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* VISTA: BIBLIOTECA */}
        {ctrl.currentTab === 'library' && (
          <section className="library-section">
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Todos los modelos guardados</h3>
            {ctrl.libraryItems.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>La biblioteca está vacía. Ve al Visor 3D y sube un modelo.</p>
            ) : (
              <div className="library-grid">
                {ctrl.libraryItems.map((item) => (
                  <div
                    key={item.id}
                    className="library-card"
                    onClick={() => ctrl.openFromLibrary(item.url)}
                  >
                    <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span className="card-title">{item.name}</span>
                    <span className="card-date">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
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
