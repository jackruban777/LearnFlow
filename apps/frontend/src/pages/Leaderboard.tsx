import { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  CircleNotch,
  Sparkle,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  certCount: number;
  weeklyXp: number;
}

export function Leaderboard() {
  const { showToast } = useNotification();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'global' | 'weekly'>('global');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await api.get('/leaderboard');
        setEntries(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to retrieve rankings data');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [showToast]);

  if (loading) {
    return (
      <AppShell title="Leaderboard">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  // Sort entries based on filter
  const sortedEntries = [...entries].sort((a, b) => {
    if (filter === 'weekly') {
      return b.weeklyXp - a.weeklyXp;
    }
    return b.xp - a.xp;
  });

  // Re-rank items index
  const rankedEntries = sortedEntries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
  }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">👑</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-mono text-gray-500 font-bold text-xs">{rank}</span>;
  };

  const getRankColors = (rank: number) => {
    if (rank === 1) return 'border-accent-amber/40 bg-accent-amber/5 text-accent-amber shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    if (rank === 2) return 'border-gray-400/40 bg-gray-400/5 text-gray-300';
    if (rank === 3) return 'border-amber-700/40 bg-amber-700/5 text-amber-600';
    return 'border-white/5 bg-transparent';
  };

  return (
    <AppShell title="Leaderboard">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page title and description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-white mb-1 flex items-center gap-2">
              <Trophy size={24} className="text-accent-amber" />
              Global Standings
            </h2>
            <p className="text-xs text-gray-400">
              Compete with developers worldwide. Boost your mastery rank by generating roadmaps and finishing assessments.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 self-start">
            <button
              onClick={() => setFilter('global')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'global' ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Global XP
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'weekly' ? 'bg-accent-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly XP
            </button>
          </div>
        </div>

        {/* Podium Top 3 cards */}
        {rankedEntries.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            {/* Rank 2 (Podium silver, rendered first on md grids for center visual balance) */}
            <GlassCard
              className={`p-5 text-center flex flex-col items-center justify-center border order-2 md:order-1 ${getRankColors(2)}`}
            >
              <span className="text-2xl">🥈</span>
              <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-sm font-bold text-gray-300 mt-2 overflow-hidden">
                {rankedEntries[1].avatarUrl ? (
                  <img src={rankedEntries[1].avatarUrl} alt={rankedEntries[1].name} className="w-full h-full object-cover" />
                ) : (
                  rankedEntries[1].name.charAt(0).toUpperCase()
                )}
              </div>
              <h4 className="font-semibold text-white text-sm mt-2.5 truncate max-w-full">
                {rankedEntries[1].name}
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Rank 2</p>
              <GlassBadge variant="default" size="sm" className="mt-3">
                {filter === 'weekly' ? `${rankedEntries[1].weeklyXp.toLocaleString()} XP` : `${rankedEntries[1].xp.toLocaleString()} XP`}
              </GlassBadge>
            </GlassCard>

            {/* Rank 1 (Gold podium, center) */}
            <GlassCard
              className={`p-6 text-center flex flex-col items-center justify-center border order-1 md:order-2 scale-100 md:scale-105 ${getRankColors(1)}`}
              glow
            >
              <div className="flex items-center gap-1">
                <span className="text-3xl">👑</span>
                <Sparkle size={12} className="text-accent-amber animate-pulse" />
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-accent-amber bg-accent-amber/15 flex items-center justify-center text-lg font-bold text-accent-amber mt-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
                {rankedEntries[0].avatarUrl ? (
                  <img src={rankedEntries[0].avatarUrl} alt={rankedEntries[0].name} className="w-full h-full object-cover" />
                ) : (
                  rankedEntries[0].name.charAt(0).toUpperCase()
                )}
              </div>
              <h4 className="font-bold text-white text-base mt-2.5 truncate max-w-full font-display">
                {rankedEntries[0].name}
              </h4>
              <p className="text-[10px] text-accent-amber font-semibold uppercase tracking-wider mt-0.5">Champion</p>
              <GlassBadge variant="warning" size="sm" className="mt-3">
                {filter === 'weekly' ? `${rankedEntries[0].weeklyXp.toLocaleString()} XP` : `${rankedEntries[0].xp.toLocaleString()} XP`}
              </GlassBadge>
            </GlassCard>

            {/* Rank 3 (Podium bronze) */}
            <GlassCard
              className={`p-5 text-center flex flex-col items-center justify-center border order-3 ${getRankColors(3)}`}
            >
              <span className="text-2xl">🥉</span>
              <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-sm font-bold text-amber-700 mt-2 overflow-hidden">
                {rankedEntries[2].avatarUrl ? (
                  <img src={rankedEntries[2].avatarUrl} alt={rankedEntries[2].name} className="w-full h-full object-cover" />
                ) : (
                  rankedEntries[2].name.charAt(0).toUpperCase()
                )}
              </div>
              <h4 className="font-semibold text-white text-sm mt-2.5 truncate max-w-full">
                {rankedEntries[2].name}
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Rank 3</p>
              <GlassBadge variant="default" size="sm" className="mt-3">
                {filter === 'weekly' ? `${rankedEntries[2].weeklyXp.toLocaleString()} XP` : `${rankedEntries[2].xp.toLocaleString()} XP`}
              </GlassBadge>
            </GlassCard>
          </div>
        )}

        {/* Full rankings table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-4 px-5 w-16 text-center">Rank</th>
                  <th className="py-4 px-5">Developer</th>
                  <th className="py-4 px-5 text-center">Streak</th>
                  <th className="py-4 px-5 text-center">Certifications</th>
                  <th className="py-4 px-5 text-right">XP Points</th>
                </tr>
              </thead>
              <tbody>
                {rankedEntries.map((entry) => {
                  const isCurrentUser = user && entry.userId === user.id;

                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-white/5 transition-colors ${
                        isCurrentUser ? 'bg-accent-violet/10 hover:bg-accent-violet/15' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-5 text-center font-medium">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg mx-auto">
                          {getRankBadge(entry.rank)}
                        </div>
                      </td>

                      {/* Developer Details */}
                      <td className="py-4 px-5 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-xs font-bold text-accent-violet shrink-0 overflow-hidden">
                            {entry.avatarUrl ? (
                              <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                            ) : (
                              entry.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5">
                              {entry.name}
                              {isCurrentUser && (
                                <GlassBadge variant="violet" size="sm">
                                  You
                                </GlassBadge>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-5 text-center text-gray-300 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Flame size={14} className="text-accent-rose shrink-0" />
                          <span>{entry.streak}d</span>
                        </div>
                      </td>

                      {/* Certifications */}
                      <td className="py-4 px-5 text-center text-gray-300 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy size={14} className="text-accent-indigo shrink-0" />
                          <span>{entry.certCount}</span>
                        </div>
                      </td>

                      {/* Total/Weekly XP */}
                      <td className="py-4 px-5 text-right font-bold text-glow-violet text-white">
                        {filter === 'weekly' ? `${entry.weeklyXp.toLocaleString()} XP` : `${entry.xp.toLocaleString()} XP`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </AppShell>
  );
}
