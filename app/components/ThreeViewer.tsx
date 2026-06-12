"use client";

import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Environment, useGLTF, Center } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
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
      autoRotateSpeed={2}
    />
  );
}

interface ThreeViewerProps {
  modelUrl: string | null;
  autoRotate: boolean;
  showGrid: boolean;
  perspective: string;
  onInteract: () => void;
}

export default function ThreeViewer({ modelUrl, autoRotate, showGrid, perspective, onInteract }: ThreeViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%' }} onPointerDown={onInteract}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Luces (Setup clásico de Blender) */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <Environment preset="city" />

        {/* Modelo 3D centrado automáticamente */}
        {modelUrl && (
          <Center>
            <Model url={modelUrl} />
          </Center>
        )}

        {/* Malla 3D en el piso (Estilo Blender) */}
        {showGrid && (
          <Grid 
            infiniteGrid 
            fadeDistance={50} 
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
