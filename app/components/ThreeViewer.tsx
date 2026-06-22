"use client";

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Environment, useGLTF, Center, Bounds, Html } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, onSizeUpdate, onMetadataUpdate, onMeshSelect }: { url: string, onSizeUpdate: (size: number) => void, onMetadataUpdate?: (metadata: any) => void, onMeshSelect?: (meshData: any | null) => void }) {
  const { scene } = useGLTF(url, true); // true habilita DRACO loader
  const [selectedNode, setSelectedNode] = useState<THREE.Object3D | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      const extractMaterialData = (mat: any) => {
        if (!mat) return [];
        const matArray = Array.isArray(mat) ? mat : [mat];
        return matArray.map(m => ({
          name: m.name || 'Material',
          colorHex: m.color ? '#' + m.color.getHexString() : '#ffffff',
          roughness: m.roughness !== undefined ? m.roughness : 0.5,
          metalness: m.metalness !== undefined ? m.metalness : 0.0
        }));
      };

      // Extracción de metadatos (Estilo Blender)
      let vertices = 0;
      let triangles = 0;
      let meshes = 0;
      const materialsMap = new Map();

      scene.traverse((child: any) => {
        if (child.isMesh) {
          meshes++;
          if (child.geometry) {
            const count = child.geometry.attributes.position ? child.geometry.attributes.position.count : 0;
            vertices += count;
            // Un aproximado rápido de triángulos si está indexado o no
            if (child.geometry.index) {
              triangles += child.geometry.index.count / 3;
            } else {
              triangles += count / 3;
            }
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => materialsMap.set(m.uuid, m));
            } else {
              materialsMap.set(child.material.uuid, child.material);
            }
          }
        }
      });

      const globalMaterials = extractMaterialData(Array.from(materialsMap.values()));

      if (onMetadataUpdate) {
        onMetadataUpdate({
          vertices,
          triangles: Math.floor(triangles),
          meshes,
          materials: globalMaterials,
          dimensions: {
            x: size.x,
            y: size.y,
            z: size.z
          }
        });
      }

      // Encontrar el centro y la base exacta
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Calcular el desfase necesario para que el punto más bajo del modelo toque Y=0 (la malla)
      scene.position.y = scene.position.y - box.min.y;
      
      // Centrar el modelo horizontalmente respecto a X y Z para que siempre aparezca en el medio
      scene.position.x = scene.position.x - center.x;
      scene.position.z = scene.position.z - center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      onSizeUpdate(maxDim > 0.001 ? maxDim : 10);
    }
  }, [scene, onSizeUpdate, onMetadataUpdate]);

  // Actualizar el HelperBox cuando cambia el nodo
  useEffect(() => {
    if (selectedNode) {
      if (!boxHelperRef.current) {
        boxHelperRef.current = new THREE.BoxHelper(selectedNode, 0xffaa00);
      } else {
        boxHelperRef.current.setFromObject(selectedNode);
      }
    } else {
      boxHelperRef.current = null;
    }
  }, [selectedNode]);

  const extractMaterialData = (mat: any) => {
    if (!mat) return [];
    const matArray = Array.isArray(mat) ? mat : [mat];
    return matArray.map(m => ({
      name: m.name || 'Material',
      colorHex: m.color ? '#' + m.color.getHexString() : '#ffffff',
      roughness: m.roughness !== undefined ? m.roughness : 0.5,
      metalness: m.metalness !== undefined ? m.metalness : 0.0
    }));
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const mesh = e.object;
    setSelectedNode(mesh);

    if (onMeshSelect) {
      const vertices = mesh.geometry?.attributes?.position?.count || 0;
      const triangles = mesh.geometry?.index ? mesh.geometry.index.count / 3 : vertices / 3;
      
      const pos = new THREE.Vector3();
      const scale = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      mesh.getWorldScale(scale);

      onMeshSelect({
        name: mesh.name || 'Objeto',
        vertices,
        triangles: Math.floor(triangles),
        position: { x: pos.x, y: pos.y, z: pos.z },
        scale: { x: scale.x, y: scale.y, z: scale.z },
        materials: extractMaterialData(mesh.material)
      });
    }
  };

  const handlePointerMissed = () => {
    setSelectedNode(null);
    if (onMeshSelect) onMeshSelect(null);
  };

  return (
    <group onPointerMissed={handlePointerMissed}>
      <primitive object={scene} onClick={handlePointerDown} />
      {selectedNode && boxHelperRef.current && (
        <primitive object={boxHelperRef.current} />
      )}
    </group>
  );
}

// Wrapper para los controles que responde a la perspectiva
function CameraController({ autoRotate, perspective }: { autoRotate: boolean, perspective: {view: string, id: number} }) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    
    // Obtenemos la distancia actual al objetivo para no perder el zoom
    const distance = camera.position.distanceTo(ctrl.target);
    
    let azimuth = 0;
    let polar = Math.PI / 2;

    switch(perspective.view) {
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
      enableDamping={false} /* Desactiva la inercia, deteniéndose instantáneamente como Blender */
    />
  );
}

interface ThreeViewerProps {
  modelUrl: string | null;
  autoRotate: boolean;
  showGrid: boolean;
  perspective: {view: string, id: number};
  studioLight: boolean;
  onMetadataUpdate?: (metadata: any) => void;
  onMeshSelect?: (meshData: any | null) => void;
}

export default function ThreeViewer({ modelUrl, autoRotate, showGrid, perspective, studioLight, onMetadataUpdate, onMeshSelect }: ThreeViewerProps) {
  const [modelSize, setModelSize] = useState<number>(10);

  // Escala dinámica de la malla basada en el tamaño del modelo
  const sectionSize = modelSize; // Cada bloque grande es igual al tamaño del modelo
  const cellSize = sectionSize / 10; // Las divisiones son 1/10
  const fadeDistance = sectionSize * 50; // Reducido a 50x el tamaño para evitar desbordamiento y temblores en cálculos matemáticos de la tarjeta gráfica

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
          <Suspense fallback={<Html center><div style={{color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '8px', whiteSpace: 'nowrap'}}>Cargando modelo...</div></Html>}>
            <Bounds fit clip margin={1.2}>
              <Model url={modelUrl} onSizeUpdate={setModelSize} onMetadataUpdate={onMetadataUpdate} onMeshSelect={onMeshSelect} />
            </Bounds>
          </Suspense>
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
