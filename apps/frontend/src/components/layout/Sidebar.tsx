import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Compass,
  ChatTeardropDots,
  Gear,
  SignOut,
  X,
  GraduationCap,
  BookOpen
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <House className="w-5 h-5" /> },
    { name: 'Explore Tracks', path: '/explore', icon: <Compass className="w-5 h-5" /> },
    { name: 'Certificates & Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'AI Mentor Chat', path: '/mentor', icon: <ChatTeardropDots className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-dark-900/60 backdrop-blur-glass border-r border-white/10 p-6 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-violet/20 border border-accent-violet/30 rounded-xl text-accent-violet shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              <GraduationCap className="w-6 h-6 animate-float" weight="fill" />
            </div>
            <span className="text-xl font-black text-white tracking-wider font-display">
              Learn<span className="text-accent-violet">Flow</span>
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl border font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-violet/15 border-accent-violet/35 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Area with Settings and Logout */}
        <div className="border-t border-white/10 pt-4 space-y-1 flex-shrink-0">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl border font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-violet/15 border-accent-violet/35 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Gear className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </NavLink>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl w-full text-left font-medium text-accent-rose/70 hover:text-accent-rose hover:bg-accent-rose/5 border border-transparent hover:border-accent-rose/20 transition-all duration-200"
          >
            <SignOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
