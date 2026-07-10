import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ShieldCheck,
  Bell,
  Palette,
  Warning,
  Camera,
  FloppyDisk,
  Trash,
  Eye,
  EyeSlash,
  SunHorizon,
  Moon,
  Desktop,
  Check,
  CircleNotch,
  X,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import { useNotification } from '../hooks/useNotification';

// ─── Types ────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'privacy' | 'notifications' | 'appearance' | 'danger';
type Theme = 'dark' | 'light' | 'system';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { id: 'profile',       label: 'Profile',       icon: <User size={18} weight="duotone" /> },
  { id: 'privacy',       label: 'Privacy',        icon: <ShieldCheck size={18} weight="duotone" /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell size={18} weight="duotone" /> },
  { id: 'appearance',    label: 'Appearance',     icon: <Palette size={18} weight="duotone" /> },
  { id: 'danger',        label: 'Danger Zone',    icon: <Warning size={18} weight="duotone" /> },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? 'bg-accent-violet' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel p-6 max-w-sm w-full mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-400">
              <Warning size={22} weight="fill" />
              <h3 className="text-base font-bold text-white">Delete Account</h3>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-2">
            This action is <span className="text-rose-400 font-semibold">permanent and irreversible</span>. All your
            roadmaps, progress, certificates, and data will be permanently erased.
          </p>
          <p className="text-xs text-gray-500 mb-6">Are you absolutely sure you want to delete your account?</p>
          <div className="flex gap-3">
            <GlassButton variant="secondary" size="sm" onClick={onCancel} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton variant="danger" size="sm" onClick={onConfirm} isLoading={loading} className="flex-1">
              Yes, Delete
            </GlassButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useNotification();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(user?.avatarUrl ?? '');

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Fetch full profile on mount to get latest fields
  useEffect(() => {
    api.get('/users/me').then((res) => {
      const profile = res.data.data;
      setName(profile.name ?? user?.name ?? '');
      setEmailVerified(profile.emailVerified ?? false);
      setAvatarUrl(profile.avatarUrl ?? user?.avatarUrl ?? '');
      setTempAvatarUrl(profile.avatarUrl ?? user?.avatarUrl ?? '');
      if (profile.createdAt) {
        setMemberSince(new Date(profile.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }));
      }
    }).catch(() => {/* silently use store values */});
  }, [user?.name, user?.avatarUrl]);

  const handleSaveProfile = async () => {
    if (!name.trim()) return showToast('error', 'Validation', 'Name cannot be empty');
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { name: name.trim(), avatarUrl: avatarUrl || null });
      updateUser(res.data.data);
      showToast('success', 'Saved!', 'Your profile has been updated');
    } catch {
      showToast('error', 'Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return showToast('error', 'Validation', 'Both fields are required');
    if (newPw.length < 8) return showToast('error', 'Validation', 'New password must be at least 8 characters');
    setPwSaving(true);
    try {
      await api.patch('/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw('');
      setNewPw('');
      showToast('success', 'Password Changed', 'Your password was updated successfully');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to change password';
      showToast('error', 'Error', msg);
    } finally {
      setPwSaving(false);
    }
  };

  const avatarLetter = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar + Basic Info */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <User size={16} weight="duotone" className="text-accent-violet" />
          Basic Information
        </h3>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar Preview */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center text-2xl font-bold text-white shadow-accent-glow border border-accent-violet/30 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setTempAvatarUrl(avatarUrl);
                setIsAvatarModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-accent-violet/20 transition-colors focus:outline-none"
            >
              <Camera size={12} className="text-gray-400" />
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4 w-full">
            <GlassInput
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
            <GlassInput
              label="Email Address"
              value={user?.email ?? ''}
              readOnly
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${emailVerified ? 'bg-accent-emerald' : 'bg-amber-400'}`} />
                <span className="text-xs text-gray-400">
                  {emailVerified ? 'Email verified' : 'Email not verified'}
                </span>
              </div>
              {memberSince && (
                <span className="text-xs text-gray-500">Member since {memberSince}</span>
              )}
            </div>
          </div>
        </div>

        {/* Plan Badge */}
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <span className="text-xs bg-accent-violet/15 border border-accent-violet/25 text-accent-violet px-3 py-1 rounded-full font-medium">
              {user?.plan ?? 'FREE'} Plan
            </span>
            <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-full font-medium">
              Level {user?.level ?? 1}
            </span>
            <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1 rounded-full font-medium">
              {(user?.xp ?? 0).toLocaleString()} XP
            </span>
          </div>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            isLoading={saving}
            icon={<FloppyDisk size={15} />}
          >
            Save Changes
          </GlassButton>
        </div>
      </GlassCard>

      {/* Change Password */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Lock size={16} weight="duotone" className="text-accent-violet" />
          Change Password
        </h3>
        <div className="space-y-4">
          <GlassInput
            label="Current Password"
            type={showCurrentPw ? 'text' : 'password'}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Enter current password"
            rightIcon={
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                {showCurrentPw ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <GlassInput
            label="New Password"
            type={showNewPw ? 'text' : 'password'}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Min. 8 characters"
            rightIcon={
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}>
                {showNewPw ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Strength indicator */}
          {newPw.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      newPw.length >= i * 3
                        ? i <= 1
                          ? 'bg-rose-500'
                          : i <= 2
                          ? 'bg-amber-400'
                          : i <= 3
                          ? 'bg-yellow-300'
                          : 'bg-accent-emerald'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-500">
                {newPw.length < 4 ? 'Too weak' : newPw.length < 7 ? 'Moderate' : newPw.length < 10 ? 'Good' : 'Strong'}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleChangePassword}
              isLoading={pwSaving}
              icon={<Lock size={15} />}
            >
              Update Password
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Avatar Selection Modal */}
      <GlassModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Choose Profile Picture"
        size="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-gray-400">
            Select one of our stylish geometric presets or paste a custom image URL.
          </p>

          {/* Presets Grid */}
          <div className="grid grid-cols-5 gap-3">
            {/* None Option */}
            <button
              type="button"
              onClick={() => setTempAvatarUrl('')}
              className={`aspect-square rounded-xl overflow-hidden border bg-white/5 transition-all p-1 relative flex flex-col items-center justify-center gap-1 ${
                tempAvatarUrl === ''
                  ? 'border-accent-violet scale-105 shadow-accent-glow'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[9px] font-bold text-gray-400">
                None
              </div>
              {tempAvatarUrl === '' && (
                <div className="absolute inset-0 bg-accent-violet/25 flex items-center justify-center">
                  <Check size={16} className="text-white" weight="bold" />
                </div>
              )}
            </button>

            {[
              'Cosmic', 'Nebula', 'Eclipse', 'Quantum', 'Prism',
              'Vector', 'Helix', 'Aura', 'Matrix'
            ].map((seed) => {
              const url = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
              const isSelected = tempAvatarUrl === url;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setTempAvatarUrl(url)}
                  title={seed}
                  className={`aspect-square rounded-xl overflow-hidden border bg-white/5 transition-all p-1 relative flex items-center justify-center ${
                    isSelected
                      ? 'border-accent-violet scale-105 shadow-accent-glow'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img src={url} alt={seed} className="w-full h-full object-contain" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent-violet/25 flex items-center justify-center">
                      <Check size={16} className="text-white" weight="bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom URL Field */}
          <div className="border-t border-white/5 pt-4">
            <GlassInput
              label="Or paste a custom image URL"
              value={tempAvatarUrl}
              onChange={(e) => setTempAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => {
                setAvatarUrl(tempAvatarUrl);
                setIsAvatarModalOpen(false);
              }}
              className="flex-1"
            >
              Select
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

// ─── Tab: Privacy Policy ──────────────────────────────────────────────────

function PrivacyTab() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'We collect information you provide directly to us, such as your name, email address, and password when you register for an account. We also collect usage data including learning progress, quiz results, and interaction logs to power your personalized learning experience.',
    },
    {
      title: '2. How We Use Your Information',
      body: 'Your data is used exclusively to deliver and improve LearnFlow services — including AI-generated roadmaps, mentor sessions, progress tracking, and leaderboard features. We do not sell, rent, or share your personal data with third parties for marketing purposes.',
    },
    {
      title: '3. Data Storage & Security',
      body: 'All data is stored securely in our Supabase PostgreSQL database with row-level security enabled. Passwords are hashed using bcrypt and never stored in plain text. Access tokens use short-lived JWTs (15 minutes) with rotating refresh tokens.',
    },
    {
      title: '4. Cookies',
      body: 'We use HTTP-only cookies to store your refresh token securely. These cookies are not accessible via JavaScript and are used solely for maintaining your authenticated session.',
    },
    {
      title: '5. Your Rights',
      body: 'You have the right to access, update, or delete your personal data at any time via the Settings page. Account deletion removes all associated data from our systems including roadmaps, progress records, certificates, and messages.',
    },
    {
      title: '6. Third-Party Services',
      body: 'LearnFlow may integrate with third-party APIs including OpenAI for AI-generated content and Stripe for subscription management. These providers have their own privacy policies and we recommend reviewing them.',
    },
    {
      title: '7. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy.',
    },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-accent-violet/10 border border-accent-violet/20">
            <ShieldCheck size={20} weight="duotone" className="text-accent-violet" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Privacy Policy</h3>
            <p className="text-xs text-gray-500">Last updated: June 2026</p>
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="border-l-2 border-accent-violet/30 pl-4">
              <h4 className="text-sm font-semibold text-white mb-1">{s.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 flex items-center gap-2">
          <Check size={14} className="text-accent-emerald" />
          Your data is protected under GDPR-compliant policies.
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────

function NotificationsTab() {
  const { showToast } = useNotification();
  const [prefs, setPrefs] = useState({
    emailStreak: true,
    emailCertificate: true,
    emailWeeklySummary: false,
    pushXpEarned: true,
    pushLevelUp: true,
    pushMentorReply: true,
    pushStreakAtRisk: true,
    pushProjectEvaluated: false,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me/notifications', {
        emailNotifications: prefs.emailStreak || prefs.emailCertificate,
        pushNotifications: prefs.pushXpEarned || prefs.pushLevelUp,
      });
      showToast('success', 'Saved!', 'Notification preferences updated');
    } catch {
      showToast('error', 'Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const groups = [
    {
      label: 'Email Notifications',
      icon: <Bell size={16} weight="duotone" className="text-accent-indigo" />,
      items: [
        { key: 'emailStreak' as const, label: 'Streak reminders', desc: 'Daily reminder if you haven\'t completed your goal' },
        { key: 'emailCertificate' as const, label: 'Certificate issued', desc: 'Notify when you earn a new certificate' },
        { key: 'emailWeeklySummary' as const, label: 'Weekly progress summary', desc: 'Get a weekly recap of your learning' },
      ],
    },
    {
      label: 'Push Notifications',
      icon: <Bell size={16} weight="fill" className="text-accent-violet" />,
      items: [
        { key: 'pushXpEarned' as const, label: 'XP earned', desc: 'Notify when you earn experience points' },
        { key: 'pushLevelUp' as const, label: 'Level up', desc: 'Celebrate when you reach a new level' },
        { key: 'pushMentorReply' as const, label: 'AI Mentor replies', desc: 'Notify when mentor responds' },
        { key: 'pushStreakAtRisk' as const, label: 'Streak at risk', desc: 'Alert when your streak is about to break' },
        { key: 'pushProjectEvaluated' as const, label: 'Project evaluated', desc: 'Notify when AI evaluates your project' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GlassCard key={group.label} className="p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            {group.icon}
            {group.label}
          </h3>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <Toggle checked={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
      <div className="flex justify-end">
        <GlassButton variant="primary" size="sm" onClick={handleSave} isLoading={saving} icon={<FloppyDisk size={15} />}>
          Save Preferences
        </GlassButton>
      </div>
    </div>
  );
}

// ─── Tab: Appearance ──────────────────────────────────────────────────────

function AppearanceTab() {
  const { showToast } = useNotification();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('learnflow-theme') as Theme) ?? 'dark';
  });

  const applyTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('learnflow-theme', t);
    // Toggle dark class on root
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
    } else if (t === 'dark') {
      root.classList.add('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
    // Sync accent glows since it depends on the current theme (light vs dark opacity)
    const currentAccent = localStorage.getItem('learnflow-accent') || '#8b5cf6';
    const hex = currentAccent.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const resolvedTheme = t === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    root.style.setProperty('--accent-glow-color', `rgba(${r}, ${g}, ${b}, ${resolvedTheme === 'light' ? 0.15 : 0.3})`);

    window.dispatchEvent(new Event('wallpaper-changed'));
    showToast('success', 'Theme Applied', `Switched to ${t} mode`);
  };

  const themes: { value: Theme; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'dark',
      label: 'Dark',
      desc: 'Deep dark background — best for late-night study sessions',
      icon: <Moon size={24} weight="duotone" className="text-accent-indigo" />,
    },
    {
      value: 'light',
      label: 'Light',
      desc: 'Clean bright layout — ideal for daytime learning',
      icon: <SunHorizon size={24} weight="duotone" className="text-amber-400" />,
    },
    {
      value: 'system',
      label: 'System',
      desc: 'Automatically matches your OS theme preference',
      icon: <Desktop size={24} weight="duotone" className="text-accent-emerald" />,
    },
  ];

  const accentColors = [
    { label: 'Violet', value: '#8b5cf6', cls: 'bg-accent-violet' },
    { label: 'Indigo', value: '#6366f1', cls: 'bg-accent-indigo' },
    { label: 'Emerald', value: '#10b981', cls: 'bg-accent-emerald' },
    { label: 'Rose', value: '#f43f5e', cls: 'bg-accent-rose' },
    { label: 'Amber', value: '#f59e0b', cls: 'bg-accent-amber' },
  ];

  const [accent, setAccent] = useState(localStorage.getItem('learnflow-accent') ?? '#8b5cf6');

  const applyAccent = (color: string) => {
    setAccent(color);
    localStorage.setItem('learnflow-accent', color);
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', color);

    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const savedTheme = localStorage.getItem('learnflow-theme') || 'dark';
    const resolvedTheme = savedTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : savedTheme;
    root.style.setProperty('--accent-glow-color', `rgba(${r}, ${g}, ${b}, ${resolvedTheme === 'light' ? 0.15 : 0.3})`);

    window.dispatchEvent(new Event('wallpaper-changed'));
    showToast('success', 'Accent Updated', 'Accent colour changed');
  };

  const WALLPAPERS = [
    { name: 'Abstract Silk Blue', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Deep Space & Stars', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Nordic Aurora', url: 'https://images.unsplash.com/photo-1517495306686-860c914b9f31?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Minimal Slate', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Cyberpunk Grid', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Abstract Ocean Blue', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Nebula Dust', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Digital Code Blue', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Dark Flowing Sand', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Aesthetic Geometric', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80' }
  ];

  const [currentWallpaper, setCurrentWallpaper] = useState(localStorage.getItem('app_background_wallpaper') || '');

  const applyWallpaper = (url: string) => {
    setCurrentWallpaper(url);
    if (url) {
      localStorage.setItem('app_background_wallpaper', url);
    } else {
      localStorage.removeItem('app_background_wallpaper');
    }
    window.dispatchEvent(new Event('wallpaper-changed'));
    showToast('success', 'Wallpaper Updated', 'Background wallpaper has been applied');
  };

  const handleUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Limit Exceeded', 'Background image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        applyWallpaper(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Palette size={16} weight="duotone" className="text-accent-violet" />
          Theme Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <motion.button
              key={t.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyTheme(t.value)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${
                theme === t.value
                  ? 'bg-accent-violet/15 border-accent-violet/40 shadow-accent-glow'
                  : 'bg-white/3 border-white/8 hover:bg-white/8 hover:border-white/15'
              }`}
            >
              {theme === t.value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-violet flex items-center justify-center">
                  <Check size={11} weight="bold" className="text-white" />
                </div>
              )}
              <div className="mb-3">{t.icon}</div>
              <p className="text-sm font-semibold text-white">{t.label}</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{t.desc}</p>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Accent Colour */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Palette size={16} weight="fill" className="text-accent-violet" />
          Accent Colour
        </h3>
        <div className="flex gap-3 flex-wrap">
          {accentColors.map((c) => (
            <motion.button
              key={c.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyAccent(c.value)}
              title={c.label}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                accent === c.value ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
            >
              {accent === c.value && <Check size={14} weight="bold" className="text-white" />}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Accent colour changes the highlight colour used across buttons, badges, and active states.
        </p>
      </GlassCard>

      {/* Background Wallpaper */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Palette size={16} weight="duotone" className="text-accent-indigo" />
          Background Wallpaper
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {/* Default Option */}
          <button
            onClick={() => applyWallpaper('')}
            className={`h-16 rounded-xl border relative flex flex-col items-center justify-center transition-all bg-page-gradient ${
              !currentWallpaper ? 'border-white scale-105 shadow-accent-glow' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {!currentWallpaper && <Check size={14} weight="bold" className="text-white mb-0.5" />}
            <span className="text-[10px] font-semibold text-white">Default Theme</span>
          </button>

          {/* Presets */}
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.name}
              onClick={() => applyWallpaper(wp.url)}
              className={`h-16 rounded-xl border relative overflow-hidden transition-all ${
                currentWallpaper === wp.url ? 'border-white scale-105 shadow-accent-glow' : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                backgroundImage: `url(${wp.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              title={wp.name}
            >
              {currentWallpaper === wp.url && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Check size={16} weight="bold" className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Custom Upload:</span>
            <input
              type="file"
              accept="image/*"
              id="wallpaper-upload-input"
              className="hidden"
              onChange={handleUploadWallpaper}
            />
            <label
              htmlFor="wallpaper-upload-input"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all inline-block"
            >
              Upload Wallpaper
            </label>
          </div>
          
          {currentWallpaper && (
            <button
              onClick={() => applyWallpaper('')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Reset Background
            </button>
          )}
        </div>
      </GlassCard>

      {/* Font Size */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Desktop size={16} weight="duotone" className="text-accent-violet" />
          Interface Density
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['Compact', 'Default', 'Comfortable'] as const).map((density) => (
            <motion.button
              key={density}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => showToast('info', 'Coming Soon', 'Density settings are in development')}
              className="p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 transition-all text-sm text-gray-400 hover:text-white"
            >
              {density}
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Tab: Danger Zone ─────────────────────────────────────────────────────

function DangerTab() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { showToast } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/me');
      logout();
      navigate('/');
      showToast('info', 'Account Deleted', 'Your account has been permanently removed');
    } catch {
      showToast('error', 'Error', 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {showModal && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowModal(false)}
          loading={deleting}
        />
      )}

      <div className="space-y-4">
        {/* Export Data */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Export My Data</h3>
              <p className="text-xs text-gray-400">
                Download a copy of all your learning data, certificates, and progress history.
              </p>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => showToast('info', 'Coming Soon', 'Data export is being prepared')}
              className="shrink-0"
            >
              Export Data
            </GlassButton>
          </div>
        </GlassCard>

        {/* Deactivate */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Deactivate Account</h3>
              <p className="text-xs text-gray-400">
                Temporarily hide your profile and pause all learning activity. You can reactivate at any time.
              </p>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => showToast('info', 'Coming Soon', 'Account deactivation is in development')}
              className="shrink-0"
            >
              Deactivate
            </GlassButton>
          </div>
        </GlassCard>

        {/* Delete Account */}
        <div className="relative rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 overflow-hidden">
          {/* Glow border effect */}
          <div className="absolute inset-0 rounded-2xl bg-rose-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Warning size={16} weight="fill" className="text-rose-400" />
                <h3 className="text-sm font-semibold text-rose-400">Delete Account Permanently</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Permanently delete your account and all associated data. This includes all roadmaps,
                learning progress, certificates, mentor history, and account information.{' '}
                <span className="text-rose-400 font-medium">This cannot be undone.</span>
              </p>
            </div>
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => setShowModal(true)}
              icon={<Trash size={15} />}
              className="shrink-0"
            >
              Delete Account
            </GlassButton>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabContent: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab />,
    privacy:       <PrivacyTab />,
    notifications: <NotificationsTab />,
    appearance:    <AppearanceTab />,
    danger:        <DangerTab />,
  };

  return (
    <AppShell title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Account Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your profile, preferences, and account</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tab Sidebar */}
          <div className="md:w-52 shrink-0">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? tab.id === 'danger'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        : 'bg-accent-violet/15 text-accent-violet border border-accent-violet/25'
                      : tab.id === 'danger'
                      ? 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
