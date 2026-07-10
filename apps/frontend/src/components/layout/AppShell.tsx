import { useState, useEffect, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Compass,
  Robot,
  Gear,
  SignOut,
  Lightning,
  List,
  X,
  BookOpen,
  Bell,
  Check,
  GraduationCap,
} from '@phosphor-icons/react';
import { useAuthStore } from '../../stores/auth.store';
import { useNotification } from '../../hooks/useNotification';
import { api } from '../../lib/api';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <House size={20} weight="duotone" /> },
  { label: 'Explore', to: '/explore', icon: <Compass size={20} weight="duotone" /> },
  { label: 'My Courses', to: '/courses', icon: <BookOpen size={20} weight="duotone" /> },
  { label: 'Certificates', to: '/certificates', icon: <GraduationCap size={20} weight="duotone" /> },
  { label: 'AI Mentor', to: '/mentor', icon: <Robot size={20} weight="duotone" /> },
];

function Sidebar({ isMobileOpen, onMobileClose }: { isMobileOpen: boolean; onMobileClose: () => void }) {
  const { user, logout } = useAuthStore();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    logout();
    navigate('/');
    showToast('info', 'Logged out', 'See you next time!');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center shadow-accent-glow">
          <GraduationCap size={18} weight="fill" className="text-white" />
        </div>
        <span className="font-display font-bold text-white text-lg">LearnFlow</span>
        {isMobileOpen && (
          <button onClick={onMobileClose} className="ml-auto text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={isMobileOpen ? onMobileClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Gear size={20} weight="duotone" />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
        >
          <SignOut size={20} />
          Sign Out
        </button>
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mt-1 glass-panel rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet/40 to-accent-indigo/40 border border-accent-indigo/30 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-dark-800 border-r border-white/10 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('success', 'Read All', 'All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all focus:outline-none flex items-center justify-center cursor-pointer"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-indigo text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="!absolute right-0 top-full bottom-auto mt-2 w-80 glass-panel p-4 z-50 max-h-96 overflow-y-auto bg-[#070c19]/80 border-white/15 shadow-2xl rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-accent-indigo hover:underline font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loading && notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No notifications yet</div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        notif.read
                          ? 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5'
                          : 'bg-accent-indigo/5 border-accent-indigo/35 text-white hover:bg-accent-indigo/10 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <p className="text-xs font-bold leading-tight">{notif.title}</p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-accent-indigo rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug">{notif.body}</p>
                      <p className="text-[9px] text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    logout();
    navigate('/');
    showToast('info', 'Logged out', 'See you next time!');
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet/30 to-accent-indigo/30 border border-accent-indigo/30 flex items-center justify-center text-sm font-bold text-white hover:from-accent-violet/50 hover:to-accent-indigo/50 transition-all duration-200 cursor-pointer focus:outline-none overflow-hidden"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="!absolute right-0 top-full mt-3 w-64 glass-panel p-4 z-50 bg-[#070c19]/80 border-white/15 shadow-2xl rounded-2xl flex flex-col gap-3"
            >
              {/* User info */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-violet/40 to-accent-indigo/40 border border-accent-indigo/30 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="glass-panel p-2 flex flex-col border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Level</span>
                  <span className="font-bold text-white mt-0.5">{user.level}</span>
                </div>
                <div className="glass-panel p-2 flex flex-col border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Plan</span>
                  <span className="font-bold text-accent-violet mt-0.5">{user.plan}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-1 mt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/settings');
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                >
                  <Gear size={16} />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all text-left w-full cursor-pointer"
                >
                  <SignOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopNav({
  onMobileMenuOpen,
  title,
}: {
  onMobileMenuOpen: () => void;
  title?: string;
}) {
  const { user } = useAuthStore();
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-white/10 bg-dark-800 backdrop-blur-glass shadow-sm">
      {/* Left side: Menu toggle + Home */}
      <button
        onClick={onMobileMenuOpen}
        title="Toggle sidebar"
        className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0"
      >
        <List size={18} />
      </button>
      <NavLink
        to="/dashboard"
        title="Home"
        className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0"
      >
        <House size={18} />
      </NavLink>

      {/* Page title */}
      <div className="flex-1">
        {title && title !== 'Settings' && (
          <h1 className="text-base font-semibold text-white">{title}</h1>
        )}
      </div>

      {/* Right side: XP + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-lg">
            <Lightning size={14} weight="fill" className="text-amber-400" />
            <span className="text-sm font-semibold text-white">{user.xp.toLocaleString()} XP</span>
          </div>
        )}
        {user && <NotificationDropdown />}
        <ProfileDropdown />
      </div>
    </header>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopNav onMobileMenuOpen={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export { Sidebar, TopNav };
export { BookOpen };
