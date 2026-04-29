import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Zap, ChevronDown, Network, Building2, BellRing, Coffee, Trophy, Clock, Cpu } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  {
    title: "Intelligent Room Allocation",
    description: "Automated algorithms group identical colleges, optimize physical spatial capacity, and instantly resolve overflow mapping conflicts.",
    icon: Building2,
    color: "text-blue-400"
  },
  {
    title: "Context-Aware Notice Board",
    description: "Role-based and phase-specific system announcements dynamically broadcasted in real-time to targeted dashboards via WebSockets.",
    icon: BellRing,
    color: "text-orange-400"
  },
  {
    title: "Smart Refreshment Management",
    description: "Batch-based meal scheduling cron jobs. Dynamically splits active teams into cohorts to stagger invitations and prevent physical crowding.",
    icon: Coffee,
    color: "text-amber-500"
  },
  {
    title: "Predictive Analytics Leaderboard",
    description: "Evaluates teams on Innovation, Technical, and Impact metrics. Built-in rule engines automatically flag 'At-Risk' or 'Rising Star' teams.",
    icon: Trophy,
    color: "text-yellow-400"
  },
  {
    title: "Automated Phase Checkpoints",
    description: "Strict deadline tracking systems that monitor progress, detect missed submissions, and dispatch urgent warnings to inactive participants.",
    icon: Clock,
    color: "text-red-400"
  },
  {
    title: "Multi-Agent AI Orchestrator",
    description: "A completely decoupled event-driven backend ecosystem. Autonomous Emergency and Activity agents react to anomalies instantly.",
    icon: Cpu,
    color: "text-purple-400"
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress for the main container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transformations for the hero section
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center overflow-x-hidden relative">
      
      {/* Hero Section - Now with Parallax */}
      <motion.div 
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="min-h-screen w-full flex flex-col items-center justify-center p-8 text-center relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-2xl">
          Manage Hackathons<br className="hidden md:block" /> in Real-Time
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl drop-shadow-lg">
          Monitor teams, track projects, and respond instantly to emergencies. Welcome to Mission Control.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold tracking-wide transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold tracking-wide transition-all hover:scale-105"
          >
            View Dashboard
          </button>
        </div>

        <motion.div 
          animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-10 text-cyan-500"
        >
          <ChevronDown className="w-10 h-10" />
        </motion.div>
      </motion.div>

      {/* Scroll Based Info Section */}
      <div className="w-full max-w-6xl mx-auto py-32 px-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            Next-Generation Orchestration
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Smart-Hack isn't just a dashboard—it's an intelligent orchestration engine designed to automate the lifecycle of large-scale hackathons. By fusing predictive analytics with an autonomous event-driven architecture, it completely eliminates logistical friction.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100, scale: 0.9, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative overflow-hidden group cursor-pointer"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className={`w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center border border-gray-800 mb-6 shadow-inner \${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-3 tracking-wide">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
