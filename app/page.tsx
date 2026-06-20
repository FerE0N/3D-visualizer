"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  const getQRLink = () => {
    return `${currentUrl}/?model=${encodeURIComponent(ctrl.modelUrl || '')}`;
  };

  const getFileName = () => {
    if (!ctrl.modelUrl) return '';
    const parts = ctrl.modelUrl.split('/');
    return parts[parts.length - 1] || 'Modelo 3D';
  };

  const renderTools = () => (
    <>
      <button className="tool-btn" onClick={() => ctrl.setPerspective('front')} title="Frente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="12" x2="21" y2="12"></line>
        </svg>
        <span>Frente</span>
      </button>
      <button className="tool-btn" onClick={() => ctrl.setPerspective('top')} title="Arriba">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="3" x2="12" y2="21"></line>
        </svg>
        <span>Arriba</span>
      </button>
      <button className="tool-btn" onClick={() => ctrl.setPerspective('iso')} title="Isométrico">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span>Iso</span>
      </button>
      <hr className="tools-divider" style={{borderColor: 'var(--glass-border)', margin: '4px 0'}} />
      <button className={`tool-btn ${ctrl.autoRotate ? 'active' : ''}`} onClick={ctrl.toggleAutoRotate} title="Giro Automático">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        <span>Giro</span>
      </button>
      <button className={`tool-btn ${ctrl.showGrid ? 'active' : ''}`} onClick={ctrl.toggleGrid} title="Mostrar/Ocultar Malla">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3z"></path>
          <path d="M3 9h18"></path>
          <path d="M3 15h18"></path>
          <path d="M9 3v18"></path>
          <path d="M15 3v18"></path>
        </svg>
        <span>Malla</span>
      </button>
      <button className={`tool-btn ${ctrl.studioLight ? 'active' : ''}`} onClick={ctrl.toggleStudioLight} title="Alternar Luz">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <span>Luz</span>
      </button>
      <hr className="tools-divider" style={{borderColor: 'var(--glass-border)', margin: '4px 0'}} />
      <button className="tool-btn danger" onClick={ctrl.closeViewer} title="Cerrar Visor">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Cerrar</span>
      </button>
    </>
  );

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
              <div className="viewer-layout">
                {/* ÁREA DEL VISOR (IZQUIERDA) */}
                <div className="viewer-main">
                  {/* HAMBURGER MENU BUTTON (Visible solo en móvil) */}
                  <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>

                  {/* PANEL DE HERRAMIENTAS FLOTANTE (Oculto en móvil) */}
                  <div className="tools-panel desktop-only">
                    {renderTools()}
                  </div>

                  <ThreeViewer 
                    modelUrl={ctrl.modelUrl} 
                    autoRotate={ctrl.autoRotate} 
                    showGrid={ctrl.showGrid} 
                    perspective={ctrl.currentPerspective}
                    studioLight={ctrl.studioLight}
                    onMetadataUpdate={ctrl.setModelMetadata}
                  />
                </div>

                {/* PANEL LATERAL DE PROPIEDADES (DERECHA) */}
                {ctrl.modelMetadata && (
                  <div className="properties-panel">
                    <div className="panel-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      {ctrl.selectedMesh ? 'Propiedades de Malla' : 'Propiedades Globales'}
                    </div>

                    {ctrl.selectedMesh && (
                      <button className="clear-selection-btn" onClick={() => ctrl.setSelectedMesh(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Limpiar Selección
                      </button>
                    )}

                    {ctrl.selectedMesh ? (
                      /* VISTA DE OBJETO SELECCIONADO */
                      <>
                        <div className="property-group">
                          <h3>
                            Item: {ctrl.selectedMesh.name}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                          </h3>
                          <div className="property-row">
                            <span className="property-label">Posición X</span>
                            <span className="property-value">{ctrl.selectedMesh.position.x.toFixed(2)}</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Posición Y</span>
                            <span className="property-value">{ctrl.selectedMesh.position.y.toFixed(2)}</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Posición Z</span>
                            <span className="property-value">{ctrl.selectedMesh.position.z.toFixed(2)}</span>
                          </div>
                          <hr style={{borderColor: 'var(--glass-border)', margin: '8px 0'}} />
                          <div className="property-row">
                            <span className="property-label">Escala XYZ</span>
                            <span className="property-value">{ctrl.selectedMesh.scale.x.toFixed(2)}</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Vértices</span>
                            <span className="property-value">{ctrl.selectedMesh.vertices.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="property-group">
                          <h3>
                            Materials ({ctrl.selectedMesh.materials.length})
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                              <path d="M2 12h20"></path>
                            </svg>
                          </h3>
                          {ctrl.selectedMesh.materials.map((mat: any, idx: number) => (
                            <div key={idx} className="material-item">
                              <div className="material-header">
                                <span className="color-swatch" style={{ backgroundColor: mat.colorHex }}></span>
                                {mat.name}
                              </div>
                              <div className="material-stats">
                                <span>Rough: {mat.roughness.toFixed(2)}</span>
                                <span>Metal: {mat.metalness.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* VISTA GLOBAL */
                      <>
                        <div className="property-group">
                          <h3>
                            Transform
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"></polyline>
                              <rect x="1" y="3" width="22" height="5"></rect>
                              <line x1="10" y1="12" x2="14" y2="12"></line>
                            </svg>
                          </h3>
                          <div className="property-row">
                            <span className="property-label">Dimensión X</span>
                            <span className="property-value">{ctrl.modelMetadata.dimensions.x.toFixed(2)}m</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Dimensión Y</span>
                            <span className="property-value">{ctrl.modelMetadata.dimensions.y.toFixed(2)}m</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Dimensión Z</span>
                            <span className="property-value">{ctrl.modelMetadata.dimensions.z.toFixed(2)}m</span>
                          </div>
                        </div>

                        <div className="property-group">
                          <h3>
                            Statistics
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                            </svg>
                          </h3>
                          <div className="property-row">
                            <span className="property-label">Vértices</span>
                            <span className="property-value">{ctrl.modelMetadata.vertices.toLocaleString()}</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Caras / Tris</span>
                            <span className="property-value">{ctrl.modelMetadata.triangles.toLocaleString()}</span>
                          </div>
                          <div className="property-row">
                            <span className="property-label">Mallas (Meshes)</span>
                            <span className="property-value">{ctrl.modelMetadata.meshes}</span>
                          </div>
                        </div>

                        <div className="property-group">
                          <h3>
                            Global Materials ({Array.isArray(ctrl.modelMetadata.materials) ? ctrl.modelMetadata.materials.length : 0})
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                              <path d="M2 12h20"></path>
                            </svg>
                          </h3>
                          {Array.isArray(ctrl.modelMetadata.materials) && ctrl.modelMetadata.materials.map((mat: any, idx: number) => (
                            <div key={idx} className="material-item">
                              <div className="material-header">
                                <span className="color-swatch" style={{ backgroundColor: mat.colorHex || '#ffffff' }}></span>
                                {mat.name}
                              </div>
                              <div className="material-stats">
                                <span>Rough: {mat.roughness !== undefined ? mat.roughness.toFixed(2) : '0.00'}</span>
                                <span>Metal: {mat.metalness !== undefined ? mat.metalness.toFixed(2) : '0.00'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* FLOATING QR BUTTON (Desktop) */}
            {ctrl.modelUrl && (
              <button className="floating-qr-btn desktop-only" onClick={() => setIsQRModalOpen(true)} title="Compartir con QR">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  <line x1="15" y1="15" x2="15.01" y2="15"></line>
                  <line x1="9" y1="15" x2="9.01" y2="15"></line>
                </svg>
              </button>
            )}

            {/* MOBILE SIDEBAR */}
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="sidebar-content">
                <div className="sidebar-header">
                  <h3>Herramientas</h3>
                  <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="sidebar-tools">
                  {renderTools()}
                  <hr style={{borderColor: 'var(--glass-border)', margin: '8px 0'}} />
                  <button className="tool-btn qr-sidebar-btn" onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsQRModalOpen(true);
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
                    </svg>
                    <span>Mostrar Código QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QR MODAL POPUP */}
            {isQRModalOpen && (
              <div className="qr-modal-overlay" onClick={() => setIsQRModalOpen(false)}>
                <div className="qr-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                  <button className="close-modal-btn" onClick={() => setIsQRModalOpen(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <div className="qr-wrapper">
                    <h3>Compartir Modelo</h3>
                    <p className="qr-filename">{getFileName()}</p>
                    <div className="qr-code-box">
                      <QRCodeSVG value={getQRLink()} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
                    </div>
                    <p className="qr-hint">Escanea este código con tu celular para abrir este mismo modelo 3D al instante.</p>
                  </div>
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
