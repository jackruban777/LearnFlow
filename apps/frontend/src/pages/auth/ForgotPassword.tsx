import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Envelope, GraduationCap, ArrowLeft } from '@phosphor-icons/react';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@learnflow/shared';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { api } from '../../lib/api';
import { useNotification } from '../../hooks/useNotification';
import { useState } from 'react';

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { showToast } = useNotification();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      showToast('success', 'OTP Sent', 'Check your email for the reset code.');
    } catch (err: any) {
      showToast('error', 'Failed', err.response?.data?.message ?? 'Could not send OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-page-gradient -z-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-violet flex items-center justify-center">
              <GraduationCap size={20} weight="fill" className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">LearnFlow</span>
          </Link>
        </div>
        <GlassCard className="p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="font-bold text-xl text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">We've sent a 6-digit OTP to reset your password.</p>
              <Link to="/auth/login"><GlassButton variant="secondary" className="w-full">Back to Sign In</GlassButton></Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link to="/auth/login" className="inline-flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
                <h1 className="font-display font-bold text-2xl text-white">Reset password</h1>
                <p className="text-gray-400 text-sm mt-1">Enter your email and we'll send you a reset OTP.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <GlassInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Envelope size={18} />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <GlassButton type="submit" isLoading={isSubmitting} className="w-full">
                  Send Reset OTP
                </GlassButton>
              </form>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
