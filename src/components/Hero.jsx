import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AbstractShapes() {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2, 0, -2]} rotation={[0, 0.5, 0]}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial 
            color="#22d3ee" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={2} 
          />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[-3, 1,-1]}>
          <torusGeometry args={[1, 0.3, 16, 32]} />
          <meshPhysicalMaterial 
            color="#8b5cf6" 
            transmission={0.8} 
            opacity={1} 
            metalness={0.2} 
            roughness={0.1} 
            ior={1.5} 
            thickness={2} 
          />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1} floatIntensity={3}>
        <mesh position={[1, -1.5, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial 
            color="#00f0ff" 
            transmission={0.95} 
            opacity={1} 
            metalness={0.1} 
            roughness={0} 
            ior={1.5} 
            thickness={1.5} 
          />
        </mesh>
      </Float>
    </>
  );
}

function MouseParallax() {
  useFrame((state) => {
    state.camera.position.x += (state.pointer.x * 0.5 - state.camera.position.x) * 0.05;
    state.camera.position.y += (state.pointer.y * 0.5 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Hero() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleEarlyAccess = () => {
    navigate('/signup');
  };

  const handleLivePerformance = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/access');
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <MouseParallax />
          <AbstractShapes />
          <Environment preset="city" resolution={256} />
          <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2} far={4.5} resolution={256} frames={1} />
        </Canvas>
      </div>
      
      {/* Background gradients for added depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-bg/50 to-dark-bg z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-border bg-dark-card backdrop-blur-sm mb-8"
        >
          <BrainCircuit className="w-5 h-5 text-neon-blue" />
          <span className="text-sm font-medium text-gray-300">Next-Gen Algorithmic Trading</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-6"
        >
          AI-Native <br />
          <span className="text-gradient">Hedge Fund</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-xl md:text-2xl text-gray-400 mb-10 font-light"
        >
          Autonomous intelligence. Smarter capital. Discover patterns invisible to the human eye and achieve unparalleled market performance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <button 
            onClick={handleEarlyAccess}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-dark-bg font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 flex items-center gap-2 group"
          >
            Get Early Access
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={handleLivePerformance}
            className="px-8 py-4 rounded-full border border-dark-border glass text-white font-semibold text-lg hover:bg-white/5 transition-all duration-300"
          >
            View Live Performance
          </button>
        </motion.div>
      </div>
    </section>
  );
}
