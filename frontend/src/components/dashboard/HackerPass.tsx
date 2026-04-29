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
  // Generate a clean, monochrome QR code for professional scanning
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${teamId}&color=ffffff&bgcolor=0a0a0a`;

  return (
    <div className="bg-[#0a0a0a] border border-gray-800/60 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
      {/* QR Code Section */}
      <div className="p-2 bg-[#111] rounded-lg border border-gray-800 shrink-0">
        <img src={qrUrl} alt="Team QR Code" className="w-28 h-28 rounded opacity-95" />
      </div>

      {/* Identity Details Section */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Team Identity Card</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-100 mb-1 tracking-tight">{teamName}</h3>
        <p className="text-sm text-gray-400 mb-6">{collegeName}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111] p-3 rounded-md border border-gray-800">
            <span className="block text-[10px] text-gray-500 font-medium mb-1 tracking-wider uppercase">Team ID</span>
            <span className="block text-xs font-mono text-gray-300 truncate">{teamId}</span>
          </div>
          <div className="bg-[#111] p-3 rounded-md border border-gray-800">
            <span className="block text-[10px] text-gray-500 font-medium mb-1 tracking-wider uppercase">Access Code</span>
            <span className="block text-sm font-mono font-bold text-gray-100">{joinCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
