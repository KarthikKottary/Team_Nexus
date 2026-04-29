import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotWidget from './ChatbotWidget';
import { useAuth } from '../../context/AuthContext';

export default function GlobalChatbotWrapper() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide entirely in the Admin portal
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // The TeamDashboard explicitly renders its own ChatbotWidget and passes the specific teamId 
  // so the AI knows the team context. Therefore, we hide the global one on the team route.
  if (location.pathname.startsWith('/team')) {
    return null;
  }

  return <ChatbotWidget userId={user?.id} />;
}
