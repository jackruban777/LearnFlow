import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeSlash, GoogleLogo, GithubLogo, Spinner } from '@phosphor-icons/react';
import { LoginSchema, type LoginInput } from '@learnflow/shared';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    await login(data.email, data.password);
  };

  const handleGoogleLogin = async () => {
    if (oauthLoading) return;
    setOauthLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google sign in failed:', err);
      showToast('error', 'Google Sign In Failed', err.message || 'Could not connect to authentication provider');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    if (oauthLoading) return;
    setOauthLoading('github');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('GitHub sign in failed:', err);
      showToast('error', 'GitHub Sign In Failed', err.message || 'Could not connect to authentication provider');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-liquid-mesh">
      {/* Animated liquid orbs */}
      <div className="liquid-orb w-[500px] h-[500px] top-[-100px] left-[-80px] opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
      <div className="liquid-orb w-[400px] h-[400px] bottom-[-80px] right-[-60px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(147,210,255,0.45) 0%, transparent 70%)', animationDelay: '-6s' }} />
      <div className="liquid-orb w-[300px] h-[300px] top-[40%] right-[10%] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(251,191,255,0.4) 0%, transparent 70%)', animationDelay: '-12s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="font-display font-bold text-2xl tracking-tight"
            style={{ color: 'var(--text-white)' }}>LearnFlow</span>
        </Link>

        {/* Liquid Glass Card */}
        <div className="liquid-card p-8">
          <div className="mb-7">
            <h1 className="font-display font-bold text-[1.6rem] leading-tight"
              style={{ color: 'var(--text-white)' }}>Welcome back</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-gray-500)' }}>
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <GlassInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="transition-colors" style={{ color: 'var(--text-gray-500)' }}>
                    {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-2">
                <Link to="/auth/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'var(--accent-primary)' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.015 } : undefined}
              whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              className="glass-button-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Spinner size={16} className="animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
            <span className="mx-3 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-gray-500)' }}>or continue with</span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              disabled={!!oauthLoading}
              whileHover={!oauthLoading ? { scale: 1.02 } : undefined}
              whileTap={!oauthLoading ? { scale: 0.97 } : undefined}
              onClick={handleGoogleLogin}
              className="glass-button-secondary flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google'
                ? <Spinner size={18} className="animate-spin" />
                : <GoogleLogo size={18} className="text-[#EA4335]" />}
              Google
            </motion.button>
            <motion.button
              type="button"
              disabled={!!oauthLoading}
              whileHover={!oauthLoading ? { scale: 1.02 } : undefined}
              whileTap={!oauthLoading ? { scale: 0.97 } : undefined}
              onClick={handleGithubLogin}
              className="glass-button-secondary flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github'
                ? <Spinner size={18} className="animate-spin" />
                : <GithubLogo size={18} />}
              GitHub
            </motion.button>
          </div>

          <p className="text-center text-sm mt-7" style={{ color: 'var(--text-gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/auth/register"
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent-primary)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
