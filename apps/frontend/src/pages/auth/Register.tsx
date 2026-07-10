import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeSlash, GoogleLogo, GithubLogo, Spinner, GraduationCap } from '@phosphor-icons/react';
import { RegisterSchema, type RegisterInput } from '@learnflow/shared';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const { register: registerUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch('password', '');
  const strength = password.length === 0 ? 0 : password.length < 5 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#fde047', '#10b981'];

  const onSubmit = async (data: RegisterInput) => {
    await registerUser(data.name, data.email, data.password);
  };

  const handleGoogleSignup = async () => {
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
      if (error) {
        if (error.message === 'MOCK_FALLBACK') {
          window.location.href = `${window.location.origin}/auth/callback?mock=google`;
          return;
        }
        throw error;
      }
      // Supabase will redirect the browser — loading state persists until navigation
    } catch (err: any) {
      console.warn('Google sign up failed, falling back to mock:', err);
      window.location.href = `${window.location.origin}/auth/callback?mock=google`;
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithubSignup = async () => {
    if (oauthLoading) return;
    setOauthLoading('github');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message === 'MOCK_FALLBACK') {
          window.location.href = `${window.location.origin}/auth/callback?mock=github`;
          return;
        }
        throw error;
      }
      // Supabase will redirect the browser — loading state persists until navigation
    } catch (err: any) {
      console.warn('GitHub sign up failed, falling back to mock:', err);
      window.location.href = `${window.location.origin}/auth/callback?mock=github`;
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-liquid-mesh">
      {/* Liquid orbs */}
      <div className="liquid-orb w-[500px] h-[500px] top-[-100px] right-[-80px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
      <div className="liquid-orb w-[400px] h-[400px] bottom-[-80px] left-[-60px] opacity-35"
        style={{ background: 'radial-gradient(circle, rgba(251,191,255,0.45) 0%, transparent 70%)', animationDelay: '-7s' }} />
      <div className="liquid-orb w-[280px] h-[280px] top-[30%] left-[5%] opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(147,210,255,0.4) 0%, transparent 70%)', animationDelay: '-14s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
            <GraduationCap size={20} weight="fill" className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight"
            style={{ color: 'var(--text-white)' }}>LearnFlow</span>
        </Link>

        {/* Liquid Glass Card */}
        <div className="liquid-card p-8">
          <div className="mb-7">
            <h1 className="font-display font-bold text-[1.6rem] leading-tight"
              style={{ color: 'var(--text-white)' }}>Create account</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-gray-500)' }}>
              Start mastering skills with AI-powered guidance
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput
              label="Full Name"
              placeholder="Alex Johnson"
              error={errors.name?.message}
              {...register('name')}
            />
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
                placeholder="Min. 8 characters"
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="transition-colors" style={{ color: 'var(--text-gray-500)' }}>
                    {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength ? strengthColor[strength] : 'var(--glass-border)',
                          opacity: i <= strength ? 1 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-gray-500)' }}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.015 } : undefined}
              whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              className="glass-button-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Spinner size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
            <span className="mx-3 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-gray-500)' }}>or sign up with</span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              disabled={!!oauthLoading}
              whileHover={!oauthLoading ? { scale: 1.02 } : undefined}
              whileTap={!oauthLoading ? { scale: 0.97 } : undefined}
              onClick={handleGoogleSignup}
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
              onClick={handleGithubSignup}
              className="glass-button-secondary flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github'
                ? <Spinner size={18} className="animate-spin" />
                : <GithubLogo size={18} />}
              GitHub
            </motion.button>
          </div>

          <p className="text-center text-sm mt-7" style={{ color: 'var(--text-gray-500)' }}>
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold transition-colors"
              style={{ color: 'var(--accent-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
