// Reusable cubic-bezier animations for a premium luxury experience
// Easing matches top-tier brands: cubic-bezier(0.22, 1, 0.36, 1)

export const luxuryEase = [0.22, 1, 0.36, 1];

export const fadeUp = (shouldReduceMotion = false) => ({
  hidden: { 
    opacity: 0, 
    y: shouldReduceMotion ? 0 : 25 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.0,
      ease: luxuryEase
    }
  }
});

export const fadeDown = (shouldReduceMotion = false) => ({
  hidden: { 
    opacity: 0, 
    y: shouldReduceMotion ? 0 : -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: luxuryEase
    }
  }
});

export const fadeLeft = (shouldReduceMotion = false) => ({
  hidden: { 
    opacity: 0, 
    x: shouldReduceMotion ? 0 : 30 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.1,
      ease: luxuryEase
    }
  }
});

export const fadeRight = (shouldReduceMotion = false) => ({
  hidden: { 
    opacity: 0, 
    x: shouldReduceMotion ? 0 : -30 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.1,
      ease: luxuryEase
    }
  }
});

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.96 
  },
  visible: {
    opacity: 1,
    scale: 1.00,
    transition: {
      duration: 1.2,
      ease: luxuryEase
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = (shouldReduceMotion = false) => ({
  hidden: { 
    opacity: 0, 
    y: shouldReduceMotion ? 0 : 15 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: luxuryEase
    }
  }
});
