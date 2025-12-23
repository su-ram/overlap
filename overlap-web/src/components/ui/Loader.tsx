"use client";

import { motion } from "framer-motion";

export function Loader({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <motion.img
        src="/small_square.svg"
        alt=""
        className={`${sizeClasses.sm} absolute`}
        role="status"
        aria-label="로딩 중"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <motion.img
        src="/medium_square.svg"
        alt=""
        className={`${sizeClasses.md} absolute`}
        role="status"
        aria-label="로딩 중"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.2,
          times: [0, 0.5, 1]
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <motion.img
        src="/big_square.svg"
        alt=""
        className={`${sizeClasses.lg} absolute`}
        role="status"
        aria-label="로딩 중"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.4,
          times: [0, 0.5, 1]
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}







