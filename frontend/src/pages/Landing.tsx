import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '@/components/ui/animated-shader-hero';
import { Activity } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Hero
      trustBadge={{
        text: "ACTIVE EVENT MONITORING SYSTEM",
        icons: [<Activity className="w-4 h-4 text-orange-400" />]
      }}
      headline={{
        line1: "Manage Hackathons",
        line2: "in Real-Time"
      }}
      subtitle="Monitor teams, track projects, and respond instantly to emergencies. Welcome to Mission Control."
      buttons={{
        primary: {
          text: "Get Started",
          onClick: () => navigate('/auth')
        },
        secondary: {
          text: "View Dashboard",
          onClick: () => navigate('/admin')
        }
      }}
    />
  );
};

export default Landing;
