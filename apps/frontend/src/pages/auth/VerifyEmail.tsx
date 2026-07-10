import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Warning, ArrowRight, Spinner } from '@phosphor-icons/react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { showToast } = useNotification();

  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setStatus('failed');
        showToast('error', 'Invalid Token', 'Invalid or missing email verification token.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        showToast('success', 'Verified', 'Email verified successfully!');
      } catch (err) {
        setStatus('failed');
        showToast('error', 'Verification Failed', 'Email verification failed. The token may be expired.');
      }
    };

    runVerification();
  }, [token, verifyEmail, showToast]);

  return (
    <div className="min-h-screen bg-page-gradient relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-glass-glow opacity-30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard glow className="p-8 text-center">
          <span className="text-2xl font-black text-white tracking-wider font-display mb-8 block">
            Learn<span className="text-accent-violet">Flow</span>
          </span>

          {status === 'verifying' && (
            <div className="space-y-4">
              <Spinner className="w-12 h-12 text-accent-violet animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white font-display">Verifying your email</h3>
              <p className="text-xs text-gray-400">
                Please wait a moment while we verify your credentials with our servers...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mx-auto text-accent-emerald">
                <ShieldCheck className="w-8 h-8" weight="fill" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Verification Complete!</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Thank you! Your email address has been successfully verified. You now have full access to your personalized roadmap dashboards.
                </p>
              </div>
              <GlassButton variant="success" className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-1" />
              </GlassButton>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-rose/20 border border-accent-rose/30 flex items-center justify-center mx-auto text-accent-rose">
                <Warning className="w-8 h-8" weight="fill" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Verification Failed</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The link was invalid, expired, or has already been used. Please try requesting a new email verification code in your Settings.
                </p>
              </div>
              <GlassButton variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
                Continue to Dashboard
              </GlassButton>
              <div className="text-xs text-gray-400">
                Need help? <Link to="/support" className="text-accent-violet font-semibold hover:underline">Contact Support</Link>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
