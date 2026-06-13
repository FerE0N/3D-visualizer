"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Environment, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, onSizeUpdate }: { url: string, onSizeUpdate: (size: number) => void }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      onSizeUpdate(maxDim > 0.001 ? maxDim : 10);
    }
  }, [scene, onSizeUpdate]);

  // Clonar opcional, pero useGLTF gestiona caché automáticamente
  return <primitive object={scene} />;
}

// Wrapper para los controles que responde a la perspectiva
function CameraController({ autoRotate, perspective }: { autoRotate: boolean, perspective: string }) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    
    // Angulos esféricos (Azimut, Polar)
    switch(perspective) {
      case 'front':
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(Math.PI / 2);
        break;
      case 'top':
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(0);
        break;
      case 'left':
        ctrl.setAzimuthalAngle(-Math.PI / 2);
        ctrl.setPolarAngle(Math.PI / 2);
        break;
      case 'right':
        ctrl.setAzimuthalAngle(Math.PI / 2);
        ctrl.setPolarAngle(Math.PI / 2);
        break;
      case 'iso':
      default:
        ctrl.setAzimuthalAngle(Math.PI / 4);
        ctrl.setPolarAngle(Math.PI / 3);
        break;
    }
  }, [perspective]);

  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      autoRotate={autoRotate} 
      autoRotateSpeed={0.5} /* Reducido de 2 a 0.5 para un giro suave */
    />
  );
}

interface ThreeViewerProps {
  modelUrl: string | null;
  autoRotate: boolean;
  showGrid: boolean;
  perspective: string;
}

export default function ThreeViewer({ modelUrl, autoRotate, showGrid, perspective }: ThreeViewerProps) {
  const [modelSize, setModelSize] = useState<number>(10);

  // Escala dinámica de la malla basada en el tamaño del modelo
  const sectionSize = modelSize; // Cada bloque grande es igual al tamaño del modelo
  const cellSize = sectionSize / 10; // Las divisiones son 1/10
  const fadeDistance = sectionSize * 10; // La malla se difumina a 10 veces el tamaño

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Luces (Setup clásico de Blender) */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <Environment preset="city" />

        {/* Modelo 3D centrado automáticamente y Cámara ajustada dinámicamente al tamaño */}
        {modelUrl && (
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <Model url={modelUrl} onSizeUpdate={setModelSize} />
            </Center>
          </Bounds>
        )}

        {/* Malla 3D en el piso (Estilo Blender) - Adaptable a escala */}
        {showGrid && (
          <Grid 
            infiniteGrid 
            fadeDistance={fadeDistance} 
            sectionSize={sectionSize}
            cellSize={cellSize}
            sectionColor="#6b7280" 
            cellColor="#374151" 
            position={[0, -0.01, 0]} 
          />
        )}

        {/* Gizmo Estilo Blender (Ejes superior derecha) */}
        <GizmoHelper alignment="top-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ff3653', '#8adb00', '#2c8fff']} labelColor="white" />
        </GizmoHelper>

        {/* Controles de Cámara */}
        <CameraController autoRotate={autoRotate} perspective={perspective} />
      </Canvas>
    </div>
  );
}
