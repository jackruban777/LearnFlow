import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Callback } from './pages/auth/Callback';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { Roadmap } from './pages/Roadmap';
import { Concept } from './pages/Concept';
import { Quiz } from './pages/Quiz';
import { MentorChat } from './pages/MentorChat';
import { Exam } from './pages/Exam';
import { Viva } from './pages/Viva';
import { ProjectSubmit } from './pages/ProjectSubmit';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { Courses } from './pages/Courses';
import { Certificates } from './pages/Certificates';

export default function App() {
  useEffect(() => {
    const handleThemeAndSettings = () => {
      // 1. Theme
      const savedTheme = localStorage.getItem('learnflow-theme') || 'dark';
      const root = document.documentElement;
      if (savedTheme === 'light') {
        root.classList.remove('dark');
      } else if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
      }

      // 2. Accent Color
      const savedAccent = localStorage.getItem('learnflow-accent') || '#8b5cf6';
      root.style.setProperty('--accent-primary', savedAccent);

      // Accent Glow Shadow
      const hex = savedAccent.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      root.style.setProperty(
        '--accent-glow-color',
        `rgba(${r}, ${g}, ${b}, ${savedTheme === 'light' ? 0.15 : 0.3})`
      );

      // 3. Wallpaper
      const wallpaper = localStorage.getItem('app_background_wallpaper');
      if (wallpaper) {
        document.body.style.backgroundImage = `url(${wallpaper})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = ''; // resets to CSS page-gradient
      }
    };

    handleThemeAndSettings();

    window.addEventListener('storage', handleThemeAndSettings);
    window.addEventListener('wallpaper-changed', handleThemeAndSettings);
    return () => {
      window.removeEventListener('storage', handleThemeAndSettings);
      window.removeEventListener('wallpaper-changed', handleThemeAndSettings);
    };
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/roadmap/:id" element={<Roadmap />} />
            <Route path="/roadmap/:id/concept/:conceptId" element={<Concept />} />
            <Route path="/learn/quiz/:conceptId" element={<Quiz />} />
            <Route path="/mentor" element={<MentorChat />} />
            <Route path="/learn/exam/:phaseId" element={<Exam />} />
            <Route path="/learn/viva/:phaseId" element={<Viva />} />
            <Route path="/learn/project/:phaseId" element={<ProjectSubmit />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/certificates" element={<Certificates />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
