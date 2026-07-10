import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleNotch, GoogleLogo, GithubLogo, WarningCircle } from '@phosphor-icons/react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useAuthStore } from '../../stores/auth.store';
import { useNotification } from '../../hooks/useNotification';
import { api } from '../../lib/api';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function Callback() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { setAccessToken, setUser } = useAuthStore();
  const [status, setStatus] = useState('Authenticating…');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'google' | 'github'>('google');

  useEffect(() => {
    const processOAuth = async () => {
      try {
        // ── 1. Check for mock provider (development shortcut) ──────────────
        const params = new URLSearchParams(window.location.search);
        const mockProvider = params.get('mock');

        if (mockProvider === 'google' || mockProvider === 'github') {
          setProvider(mockProvider);
          setStatus('Creating mock session…');

          const email = `mock.${mockProvider}@learnflow.dev`;
          const name = mockProvider === 'google' ? 'Mock Google Learner' : 'Mock GitHub Learner';
          const providerAccountId = `mock-${mockProvider}-${Date.now()}`;

          const res = await api.post('/auth/oauth-login', {
            email,
            name,
            provider: mockProvider,
            providerAccountId,
          });

          const { token, user } = res.data.data;
          setAccessToken(token);
          setUser(user);

          showToast('success', 'Signed in (Development Mock)!', `Welcome, ${user.name} 🎉`);

          const pendingId = localStorage.getItem('pending_roadmap_id');
          if (pendingId) {
            try {
              await api.post('/roadmaps/enroll', { roadmapId: pendingId });
              localStorage.removeItem('pending_roadmap_id');
              navigate(`/roadmap/${pendingId}`);
              return;
            } catch (_) {}
          }
          navigate('/dashboard');
          return;
        }

        // ── 2. Real Supabase OAuth flow ────────────────────────────────────
        if (!isSupabaseConfigured()) {
          setStatus('No authentication session found. Redirecting…');
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        setStatus('Verifying with provider…');

        // First try getSession() — in PKCE flow the code may already be exchanged
        // by the time React mounts, especially on fast connections.
        let session = null;
        try {
          const { data, error: sessionErr } = await supabase.auth.getSession();
          if (!sessionErr && data?.session) {
            session = data.session;
          }
        } catch (_) {}

        if (!session) {
          // Wait for onAuthStateChange — PKCE emits INITIAL_SESSION or SIGNED_IN
          session = await new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Authentication timed out. Please try again.'));
            }, 15000);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, s: Session | null) => {
              // PKCE callback fires INITIAL_SESSION or SIGNED_IN with a session
              if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && s) {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve(s);
              } else if (event === 'SIGNED_OUT') {
                clearTimeout(timeout);
                subscription.unsubscribe();
                reject(new Error('No authentication session found. Please try again.'));
              }
              // Ignore TOKEN_REFRESHED, USER_UPDATED and INITIAL_SESSION with no session
            });
          });
        }

        // We have a valid session — exchange it for our own JWT
        const supabaseUser = session.user;
        const email = supabaseUser.email!;
        const name =
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.user_metadata?.user_name ||
          email.split('@')[0] ||
          'OAuth Learner';
        const oauthProvider =
          supabaseUser.app_metadata?.provider ||
          supabaseUser.identities?.[0]?.provider ||
          'google';
        const providerAccountId = supabaseUser.id;

        setProvider(oauthProvider === 'github' ? 'github' : 'google');
        setStatus('Creating your session…');

        const res = await api.post('/auth/oauth-login', {
          email,
          name,
          provider: oauthProvider,
          providerAccountId,
        });

        const { token, user } = res.data.data;
        setAccessToken(token);
        setUser(user);

        // Sign out from Supabase — we use our own JWT from here on
        try { await supabase.auth.signOut(); } catch (_) {}

        showToast('success', 'Signed in!', `Welcome, ${user.name} 🎉`);

        const pendingId = localStorage.getItem('pending_roadmap_id');
        if (pendingId) {
          try {
            await api.post('/roadmaps/enroll', { roadmapId: pendingId });
            localStorage.removeItem('pending_roadmap_id');
            navigate(`/roadmap/${pendingId}`);
            return;
          } catch (_) {}
        }
        navigate('/dashboard');

      } catch (err: any) {
        console.error('[Callback] OAuth error:', err);
        const msg = err?.response?.data?.message || err.message || 'OAuth authentication failed.';
        setError(msg);
        showToast('error', 'Authentication failed', msg);
        setTimeout(() => navigate('/auth/login'), 3500);
      }
    };

    processOAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-liquid-mesh">
      {/* Liquid orbs */}
      <div className="liquid-orb w-[500px] h-[500px] top-[-80px] left-[-80px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
      <div className="liquid-orb w-[350px] h-[350px] bottom-[-60px] right-[-40px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(147,210,255,0.45) 0%, transparent 70%)', animationDelay: '-8s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-sm"
      >
        <div className="liquid-card p-10 text-center space-y-6">
          {error ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 0 24px rgba(239,68,68,0.15)',
                }}
              >
                <WarningCircle size={32} className="text-red-400" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--text-white)' }}>
                  Authentication Error
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-gray-500)' }}>{error}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-gray-600)' }}>
                  Redirecting to login…
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-16 h-16 mx-auto">
                {/* Spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <CircleNotch size={64} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />
                </motion.div>
                {/* Provider icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {provider === 'google'
                    ? <GoogleLogo size={26} className="text-[#EA4335]" />
                    : <GithubLogo size={26} style={{ color: 'var(--text-white)' }} />}
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--text-white)' }}>
                  Authorizing Session
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-gray-500)' }}>{status}</p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
