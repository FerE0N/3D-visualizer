"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Environment, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, onSizeUpdate }: { url: string, onSizeUpdate: (size: number) => void }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // Encontrar el centro y la base exacta
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Calcular el desfase necesario para que el punto más bajo del modelo toque Y=0 (la malla)
      // Restamos box.min.y al offset inicial del modelo
      scene.position.y = scene.position.y - box.min.y;
      
      // Centrar el modelo horizontalmente respecto a X y Z para que siempre aparezca en el medio
      scene.position.x = scene.position.x - center.x;
      scene.position.z = scene.position.z - center.z;

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
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    
    // Obtenemos la distancia actual al objetivo para no perder el zoom
    const distance = camera.position.distanceTo(ctrl.target);
    
    let azimuth = 0;
    let polar = Math.PI / 2;

    switch(perspective) {
      case 'front':
        azimuth = 0;
        polar = Math.PI / 2;
        break;
      case 'top':
        azimuth = 0;
        polar = 0.001; // Evita el Gimbal Lock
        break;
      case 'left':
        azimuth = -Math.PI / 2;
        polar = Math.PI / 2;
        break;
      case 'right':
        azimuth = Math.PI / 2;
        polar = Math.PI / 2;
        break;
      case 'iso':
      default:
        azimuth = Math.PI / 4;
        polar = Math.PI / 3;
        break;
    }

    // Convertir de esféricas a cartesianas
    camera.position.setFromSphericalCoords(distance, polar, azimuth);
    // Sumar la posición del objetivo por si no está en 0,0,0
    camera.position.add(ctrl.target);
    ctrl.update();

  }, [perspective, camera]);

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
  studioLight: boolean;
}

export default function ThreeViewer({ modelUrl, autoRotate, showGrid, perspective, studioLight }: ThreeViewerProps) {
  const [modelSize, setModelSize] = useState<number>(10);

  // Escala dinámica de la malla basada en el tamaño del modelo
  const sectionSize = modelSize; // Cada bloque grande es igual al tamaño del modelo
  const cellSize = sectionSize / 10; // Las divisiones son 1/10
  const fadeDistance = sectionSize * 1000; // Aumentado drásticamente para que cubra todo el canvas y no se difumine cerca

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Luces Condicionales */}
        {studioLight ? (
          <>
            {/* Setup clásico de Visor Web */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
          </>
        ) : (
          <>
            {/* Luces Nativas del Modelo: Entorno neutro oscuro solo para reflejos de PBR */}
            <ambientLight intensity={0.1} />
            <Environment preset="city" background={false} environmentIntensity={0.2} />
          </>
        )}

        {/* Modelo 3D posicionado dinámicamente sobre la malla y Cámara ajustada al tamaño */}
        {modelUrl && (
          <Bounds fit clip observe margin={1.2}>
            <Model url={modelUrl} onSizeUpdate={setModelSize} />
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
