import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { useNotification } from './useNotification';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, isAuthenticated, isGuest, accessToken, setAccessToken, setUser, logout } =
    useAuthStore();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handlePendingEnrollment = async () => {
    const pendingId = localStorage.getItem('pending_roadmap_id');
    if (pendingId) {
      try {
        await api.post('/roadmaps/enroll', { roadmapId: pendingId });
        localStorage.removeItem('pending_roadmap_id');
        navigate(`/roadmap/${pendingId}`);
        return true;
      } catch (enrollErr) {
        console.error('Failed to auto-enroll in pending roadmap:', enrollErr);
      }
    }
    return false;
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data.data;
      setAccessToken(token);
      setUser(userData);
      console.log('[Auth] Login successful for:', userData.email);
      showToast('success', 'Welcome back!', `Logged in as ${userData.name}`);
      
      const enrolled = await handlePendingEnrollment();
      if (!enrolled) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      const message = err.response?.data?.message ?? err.message ?? 'Login failed. Please check your credentials.';
      showToast('error', 'Login failed', message);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('[Auth] Attempting registration for:', email);
      const res = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = res.data.data;
      setAccessToken(token);
      setUser(userData);
      console.log('[Auth] Registration successful for:', userData.email);
      showToast('success', 'Account created!', 'Welcome to LearnFlow 🎉');
      
      const enrolled = await handlePendingEnrollment();
      if (!enrolled) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('[Auth] Registration error:', err);
      const message = err.response?.data?.message ?? err.message ?? 'Registration failed. Please try again.';
      showToast('error', 'Registration failed', message);
      throw err;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (err: any) {
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    logout();
    navigate('/');
    showToast('info', 'Logged out', 'See you next time!');
  };

  return { user, isAuthenticated, isGuest, accessToken, login, register, logout: logoutUser, verifyEmail };
}
