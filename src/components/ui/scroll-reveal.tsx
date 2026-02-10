'use client';

import { motion, useInView, Variant } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';
  delay?: number;
  duration?: number;
  viewportAmount?: number;
  classNameWrapper?: string;
}

export function ScrollReveal({
  children,
  className,
  variant = 'slide-up',
  delay = 0,
  duration = 0.5,
  viewportAmount = 0.2,
  classNameWrapper
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, // Critical for bidirectional: triggers every time
    amount: viewportAmount 
  });

  const variants = {
    hidden: { opacity: 0, y: variant === 'slide-up' ? 30 : 0, x: variant === 'slide-left' ? -30 : variant === 'slide-right' ? 30 : 0, scale: variant === 'scale' ? 0.9 : 1 },
    visible: { opacity: 1, y: 0, x: 0, scale: 1 }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
