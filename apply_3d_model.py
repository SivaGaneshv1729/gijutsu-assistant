# -*- coding: utf-8 -*-
model_viewer_content = """import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const MotorModel = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
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
  useFrame((state, delta) => {
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
  useFrame((state, delta) => {
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
        Drag to rotate • Scroll to zoom
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
"""

with open("frontend/src/components/ModelViewer.tsx", "w", encoding="utf-8") as f:
    f.write(model_viewer_content)

print("Created frontend/src/components/ModelViewer.tsx")

# Now update Copilot.tsx to import ModelViewer and support language-3dmodel
with open("frontend/src/pages/Copilot.tsx", "r", encoding="utf-8") as f:
    copilot_content = f.read()

copilot_content = copilot_content.replace(
    "import { MermaidRenderer } from '../components/MermaidRenderer';",
    "import { MermaidRenderer } from '../components/MermaidRenderer';\nimport { ModelViewer } from '../components/ModelViewer';"
)

copilot_content = copilot_content.replace(
    """            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match && match[1] === 'mermaid') {
                return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />;
              }""",
    """            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match) {
                if (match[1] === 'mermaid') {
                  return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />;
                }
                if (match[1] === '3dmodel') {
                  return <ModelViewer type={String(children).replace(/\\n$/, '')} />;
                }
              }"""
)

# And add a little simulated chat response logic for demonstration
# When the user asks about a "pump" or "motor", simulate returning a 3D model markdown.
copilot_content = copilot_content.replace(
    """        // Simulated AI thought process and response""",
    """        // Simulated AI thought process and response
        if (content.toLowerCase().includes("3d model") || content.toLowerCase().includes("prototype") || content.toLowerCase().includes("motor") || content.toLowerCase().includes("pump")) {
          const part = content.toLowerCase().includes("pump") ? "pump" : content.toLowerCase().includes("motor") ? "motor" : "prototype";
          setTimeout(() => {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Here is the interactive 3D prototype for the requested part (${part}):\n\n\`\`\`3dmodel\n${part}\n\`\`\`\n\nYou can drag to rotate the model and scroll to zoom. Let me know if you need specific torque or vibration tolerances for this component.`,
              isTyping: true
            };
            setMessages(prev => [...prev, botMessage]);
            setIsStreaming(false);
          }, 2000);
          return;
        }"""
)


with open("frontend/src/pages/Copilot.tsx", "w", encoding="utf-8") as f:
    f.write(copilot_content)

print("Updated Copilot.tsx with 3D model support!")
