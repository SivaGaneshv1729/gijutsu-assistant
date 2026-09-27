import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const MotorModel = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={group}>
      <Cylinder args={[1, 1, 2, 32]} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 3, 32]} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Box args={[1.5, 1.5, 0.5]} position={[-1, 0, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </Box>
      <Box args={[0.5, 0.8, 0.5]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
    </group>
  );
};

const PumpModel = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.x += delta * 0.2;
      group.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={group}>
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.2} />
      </Sphere>
      <Cylinder args={[0.5, 0.5, 2, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.5, 0.5, 2, 32]} rotation={[0, 0, Math.PI / 2]} position={[1.5, 0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>
    </group>
  );
};

const GenericModel = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.x += delta * 0.5;
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={group}>
      <Box args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial color="#8b5cf6" metalness={0.5} roughness={0.5} wireframe />
      </Box>
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial color="#10b981" metalness={1} roughness={0} />
      </Sphere>
    </group>
  );
};

export const ModelViewer = ({ type }: { type: string }) => {
  const modelType = type.toLowerCase().trim();

  return (
    <div className="w-full h-64 md:h-80 bg-gradient-to-tr from-[#09090b] to-[#111827] rounded-xl border border-white/10 my-6 relative overflow-hidden shadow-2xl group">
      <div className="absolute top-3 left-4 z-10">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          3D Interactive Prototype
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-1">TYPE: {type.toUpperCase()}</div>
      </div>
      <div className="absolute bottom-3 right-4 z-10 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to rotate - Scroll to zoom
      </div>
      
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            {modelType === 'motor' ? <MotorModel /> : modelType === 'pump' ? <PumpModel /> : <GenericModel />}
          </Float>
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enablePan={false} maxDistance={10} minDistance={2} />
        </Suspense>
      </Canvas>
    </div>
  );
};
