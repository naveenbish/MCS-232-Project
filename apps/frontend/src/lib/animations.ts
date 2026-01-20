export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const slideIn = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export const scaleButton = {
  tap: { scale: 0.95 },
  hover: { scale: 1.05 }
};

export const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.2
    }
  }
};

export const quantityAnimation = {
  initial: { scale: 1.3 },
  animate: { scale: 1 },
  transition: { type: "spring", stiffness: 300 }
};