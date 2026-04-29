import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import TeamDashboard from './pages/TeamDashboard';
import Auth from './pages/Auth';
import EmergencyBanner from './components/dashboard/EmergencyBanner';
import ShaderBackground from './components/ui/shader-background';
import { AnimatedLogoIntro } from './components/ui/animated-logo-intro';
import GlobalChatbotWrapper from './components/dashboard/GlobalChatbotWrapper';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-transparent text-gray-100 relative">
        <ShaderBackground />
        <AnimatedLogoIntro />
        <EmergencyBanner />
        <main className="w-full relative z-0">
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              {/* Admin-only */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Any logged-in user */}
              <Route
                path="/team/*"
                element={
                  <ProtectedRoute>
                    <TeamDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <GlobalChatbotWrapper />
          </Router>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
