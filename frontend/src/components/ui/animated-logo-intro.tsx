import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FallbackLogoIcon = () => (
  <svg width="120" height="100" viewBox="0 0 100 100" className="mb-2 overflow-visible">
    {/* Cyan Sweeps */}
    <path d="M 40 10 C 65 10, 75 35, 45 50" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
    <circle cx="45" cy="50" r="5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.8))" }} />
    
    <path d="M 50 0 C 85 0, 95 45, 55 60" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
    <circle cx="55" cy="60" r="5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.8))" }} />

    {/* Purple Sweeps */}
    <path d="M 10 65 C 10 95, 60 95, 80 75" fill="none" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" />
    <circle cx="80" cy="75" r="5" fill="#d946ef" style={{ filter: "drop-shadow(0 0 6px rgba(217,70,239,0.8))" }} />

    <path d="M 20 50 C 20 80, 50 85, 70 65" fill="none" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" />
    <circle cx="70" cy="65" r="5" fill="#d946ef" style={{ filter: "drop-shadow(0 0 6px rgba(217,70,239,0.8))" }} />
  </svg>
);

export const AnimatedLogoIntro = () => {
  const [phase, setPhase] = useState<'intro' | 'nav'>('intro');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('nav');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const logoContent = imageError ? (
    <div className="flex flex-col items-center whitespace-nowrap">
      <FallbackLogoIcon />
      <span className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 uppercase mt-2">
        SMART-HACK
      </span>
      <span className="text-[10px] md:text-xs text-gray-300/80 tracking-[0.25em] mt-2 uppercase font-medium">
        Hack With Convenience
      </span>
    </div>
  ) : (
    <img 
      src="/logo.png" 
      alt="System Logo" 
      onError={() => setImageError(true)}
      className="object-contain w-full h-full"
    />
  );

  return (
    <>
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 backdrop-blur-xl"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed z-[101] flex items-center justify-center \${phase === 'intro' ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'}`}
        style={{ transformOrigin: "top left" }}
        initial={{
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          scale: 0.5,
          opacity: 0,
          filter: "blur(20px) drop-shadow(0 0 0px rgba(59,130,246,0))",
        }}
        animate={
          phase === 'intro' 
            ? {
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                scale: 1.2,
                opacity: 1,
                filter: "blur(0px) drop-shadow(0 0 40px rgba(168,85,247,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6))",
              }
            : {
                top: "1.25rem",
                left: "1.5rem",
                x: "0%",
                y: "0%",
                scale: imageError ? 0.35 : 0.3,
                opacity: 1,
                filter: "blur(0px) drop-shadow(0 0 10px rgba(168,85,247,0.3))",
              }
        }
        transition={
          phase === 'intro' 
            ? { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
            : { duration: 1.2, ease: [0.25, 1, 0.5, 1] }
        }
      >
        <div className={`\${imageError ? '' : 'w-72 h-32'} flex flex-col items-center justify-center`}>
          {logoContent}
        </div>
      </motion.div>
    </>
  );
};

export default AnimatedLogoIntro;
