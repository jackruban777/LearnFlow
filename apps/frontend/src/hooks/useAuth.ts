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
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data.data;
      setAccessToken(token);
      setUser(userData);
      showToast('success', 'Welcome back!', `Logged in as ${userData.name}`);
      
      const enrolled = await handlePendingEnrollment();
      if (!enrolled) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Login failed';
      showToast('error', 'Login failed', message);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = res.data.data;
      setAccessToken(token);
      setUser(userData);
      showToast('success', 'Account created!', 'Welcome to LearnFlow 🎉');
      
      const enrolled = await handlePendingEnrollment();
      if (!enrolled) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Registration failed';
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
