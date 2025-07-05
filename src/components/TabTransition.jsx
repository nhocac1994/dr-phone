import React from 'react';
import { motion } from 'framer-motion';

const tabVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const tabTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

const TabTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={tabVariants}
      transition={tabTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default TabTransition; 