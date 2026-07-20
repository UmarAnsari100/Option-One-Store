import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '../../utils/animations';

const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = fadeUp(shouldReduceMotion);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
