import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef();
  const count = 15000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"depth":60,"width":30,"speed":2,"synaptic":0.2}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const THREE_LIB = THREE;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
        // USER CODE START
        const depth = addControl("depth", "Layer Depth", 20, 100, 60);
        const width = addControl("width", "Layer Width", 10, 50, 30);
        const speed = addControl("speed", "Signal Velocity", 0.5, 5.0, 2.0);
        const synaptic = addControl("synaptic", "Synaptic Noise", 0.0, 1.0, 0.2);
        
        const layerCount = 5;
        const particlesPerLayer = Math.floor(count / (layerCount + (layerCount - 1)));
        const t = time * speed;
        
        let x, y, z, h, s, l;
        
        if (i < count * 0.4) {
        const layerIdx = Math.floor((i / (count * 0.4)) * layerCount);
        const pInLayer = i % Math.floor((count * 0.4) / layerCount);
        
        const gridSide = Math.sqrt((count * 0.4) / layerCount);
        const gx = (pInLayer % gridSide) - gridSide * 0.5;
        const gy = Math.floor(pInLayer / gridSide) - gridSide * 0.5;
        
        const pulse = Math.sin(t + layerIdx - Math.sqrt(gx * gx + gy * gy) * 0.5);
        
        x = (layerIdx - (layerCount - 1) * 0.5) * (depth / layerCount);
        y = gx * (width / gridSide);
        z = gy * (width / gridSide);
        
        h = 0.6 - (layerIdx * 0.05);
        s = 0.8;
        l = 0.2 + (pulse * 0.15 + 0.15);
        
        const excitation = Math.max(0, pulse);
        y += (Math.random() - 0.5) * synaptic * excitation;
        z += (Math.random() - 0.5) * synaptic * excitation;
        } else {
        const segment = (i - count * 0.4) % (layerCount - 1);
        const pInFlow = (i - count * 0.4);
        const progress = ((pInFlow + t * 50) % 1000) / 1000;
        
        const startLayer = segment;
        const endLayer = segment + 1;
        
        const xStart = (startLayer - (layerCount - 1) * 0.5) * (depth / layerCount);
        const xEnd = (endLayer - (layerCount - 1) * 0.5) * (depth / layerCount);
        
        const seed = (pInFlow % 100);
        const yOffset = Math.sin(seed) * (width * 0.4);
        const zOffset = Math.cos(seed) * (width * 0.4);
        
        x = xStart + (xEnd - xStart) * progress;
        y = yOffset + (Math.random() - 0.5) * synaptic;
        z = zOffset + (Math.random() - 0.5) * synaptic;
        
        h = 0.1;
        s = 1.0;
        l = Math.pow(1.0 - Math.abs(progress - 0.5) * 2.0, 2.0) * 0.8;
        }
        
        target.set(x, y, z);
        color.setHSL(h, s, l);
        
        if (i === 0) {
        setInfo("Neural Architecture", "A feed-forward topology visualizing weight activation and signal propagation.");
        annotate("input", new THREE.Vector3(-depth * 0.5, 0, 0), "Input Vector");
        annotate("output", new THREE.Vector3(depth * 0.5, 0, 0), "Prediction");
        }
        // USER CODE END

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <fog attach="fog" args={['#000000', 0.01]} />
        <ParticleSwarm />
        <OrbitControls autoRotate={true} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  );
}