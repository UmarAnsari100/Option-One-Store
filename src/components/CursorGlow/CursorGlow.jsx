import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import './CursorGlow.css';

const CursorGlow = () => {
  const shouldReduceMotion = useReducedMotion();
  
  // Motion values for coordinates
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Springs for liquid inertia follow
  const springConfig = { damping: 45, stiffness: 220, mass: 0.7 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e) => {
      // Offset by half of glow width (400px / 2 = 200px)
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <motion.div 
      className="luxury-cursor-glow" 
      style={{ x: glowX, y: glowY }}
      pointerEvents="none"
    />
  );
};

export default CursorGlow;
