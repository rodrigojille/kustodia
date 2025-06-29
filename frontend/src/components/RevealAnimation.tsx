'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealAnimationProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function RevealAnimation({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: RevealAnimationProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 60, opacity: 0 };
      case 'down': return { y: -60, opacity: 0 };
      case 'left': return { x: 60, opacity: 0 };
      case 'right': return { x: -60, opacity: 0 };
      default: return { y: 60, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
