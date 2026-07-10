import React from 'react';
import { List, Flame, Lightning, Trophy } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'My Workspace';
    if (path === '/explore') return 'Skill Tracks';
    if (path.startsWith('/roadmap/')) return 'Roadmap Overview';
    if (path.startsWith('/concept/')) return 'Concept Lesson';
    if (path.startsWith('/learn/quiz/')) return 'Concept Quiz';
    if (path === '/mentor') return 'AI Mentor Chat';
    if (path.startsWith('/learn/exam/')) return 'Phase Exam';
    if (path.startsWith('/learn/viva/')) return 'Oral Viva Session';
    if (path.startsWith('/learn/project/')) return 'Project Evaluation';
    if (path === '/leaderboard') return 'Championships';
    if (path === '/settings') return 'Settings';
    return 'LearnFlow';
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-dark-900/80 backdrop-blur-glass border-b border-white/10 px-6 flex items-center justify-between z-30 transition-all duration-300 shadow-sm">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <List className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white font-display tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* User Stats and Profile */}
      {user && (
        <div className="flex items-center gap-4">
          {/* XP Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-violet/10 border border-accent-violet/20 rounded-full text-accent-violet">
            <Lightning className="w-4 h-4 text-glow-violet" weight="fill" />
            <span className="text-xs font-bold font-display">{user.xp} XP</span>
          </div>

          {/* Streak Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-amber/10 border border-accent-amber/20 rounded-full text-accent-amber">
            <Flame className="w-4 h-4 text-glow-amber animate-pulse" weight="fill" />
            <span className="text-xs font-bold font-display">{user.streak} Days</span>
          </div>

          {/* Level Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full text-accent-emerald">
            <Trophy className="w-4 h-4 text-glow-emerald" weight="fill" />
            <span className="text-xs font-bold font-display">Lvl {user.level}</span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* User Profile Mini */}
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-xs font-semibold text-white leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {user.plan} Account
              </span>
            </div>
            <img
              src={user.avatarUrl ?? 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-white/20 object-cover bg-white/5"
            />
          </div>
        </div>
      )}
    </header>
  );
};
