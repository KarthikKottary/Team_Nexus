import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, ScanFace } from 'lucide-react';

interface HackerPassProps {
  teamName: string;
  collegeName: string;
  teamId: string;
  joinCode: string;
}

export const HackerPass = ({ teamName, collegeName, teamId, joinCode }: HackerPassProps) => {
  // Generate a live QR code mapping directly to the MongoDB Team ID for physical scanning.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${teamId}&color=22d3ee&bgcolor=030712`;

  return (
    <motion.div 
      whileHover={{ scale: 1.01, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gray-950/80 border border-cyan-900/40 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.05)] flex flex-col md:flex-row items-center gap-6 cursor-pointer group"
      style={{ perspective: 1000 }}
    >
      {/* Background Decal */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <ScanFace className="w-48 h-48 text-cyan-400" />
      </div>

      {/* Cyberpunk Scan Line overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-scan pointer-events-none" />

      {/* QR Code Section */}
      <div className="relative p-2 bg-gray-950 rounded-xl border border-cyan-900/50 shrink-0 shadow-lg shadow-cyan-900/20">
        <img src={qrUrl} alt="Team QR Code" className="w-32 h-32 rounded-lg opacity-90 mix-blend-screen" />
        {/* Scanning laser line animation */}
        <motion.div 
          animate={{ y: [0, 128, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute top-2 left-2 right-2 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10"
        />
      </div>

      {/* Identity Details Section */}
      <div className="flex-1 z-10 w-full">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-cyan-500 uppercase">Official Hacker Pass</span>
        </div>
        <h3 className="text-3xl font-bold text-gray-100 mb-1 tracking-tight drop-shadow-md">{teamName}</h3>
        <p className="text-sm text-gray-400 font-medium mb-6 uppercase tracking-wider">{collegeName}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/80 backdrop-blur-sm">
            <span className="block text-[10px] text-gray-500 font-mono mb-1 tracking-wider">SECURE TEAM ID</span>
            <span className="block text-xs font-mono text-gray-300 truncate opacity-80">{teamId}</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/80 backdrop-blur-sm">
            <span className="block text-[10px] text-gray-500 font-mono mb-1 tracking-wider">ACCESS CODE</span>
            <span className="block text-sm font-mono font-bold text-fuchsia-400 tracking-widest drop-shadow-[0_0_5px_rgba(232,121,249,0.3)]">{joinCode}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
