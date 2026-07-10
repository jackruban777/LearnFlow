import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  BookOpen,
  Folder,
  ArrowRight,
  Sparkle,
  GraduationCap,
  ListChecks,
  CircleNotch,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { ProgressRing } from '../components/ui/ProgressRing';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import { useNotification } from '../hooks/useNotification';

interface Telemetry {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  certCount: number;
  projectCount: number;
  activeSkills: number;
  interviewReadinessScore: number;
  dailyGoalProgress: number;
  dailyGoalTarget: number;
}

interface EnrolledRoadmap {
  id: string;
  roadmapId: string;
  status: string;
  masteryScore: number;
  roadmap: {
    id: string;
    skill: {
      name: string;
      category: string;
    };
    estimatedWeeks: number;
    phases: {
      id: string;
      title: string;
      order: number;
      status: string;
      concepts: {
        id: string;
        title: string;
        status: string;
      }[];
    }[];
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [roadmaps, setRoadmaps] = useState<EnrolledRoadmap[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [telemetryRes, roadmapsRes] = await Promise.all([
          api.get('/progress/dashboard'),
          api.get('/roadmaps/user'),
        ]);

        setTelemetry(telemetryRes.data.data);
        setRoadmaps(roadmapsRes.data.data);
      } catch (err) {
        showToast('error', 'Sync Failed', 'Failed to sync learning progress');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [showToast]);

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  // Calculate stats
  const currentStreak = telemetry?.streak ?? 0;
  const targetXp = telemetry?.dailyGoalTarget ?? 50;
  const currentDailyXp = telemetry?.dailyGoalProgress ?? 0;
  const xpPercent = Math.min(100, Math.round((currentDailyXp / targetXp) * 100));

  return (
    <AppShell title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Section with Aurora Backdrop */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-white/5 border border-white/10 shadow-glass bg-aurora-glow">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-violet flex items-center gap-1.5 mb-2">
                <Sparkle size={14} weight="fill" className="animate-pulse" />
                AI Learning Mastery
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Welcome back, {user?.name || 'Learner'}!
              </h2>
              <p className="text-sm text-gray-400 max-w-xl">
                Your interview readiness score is at{' '}
                <span className="text-accent-emerald font-semibold">{telemetry?.interviewReadinessScore}%</span>.
                Complete quizzes, submit projects, and pass oral viva exams to reach 100%!
              </p>
            </div>
            <div className="flex gap-4 items-center shrink-0">
              <div className="glass-panel p-4 flex flex-col items-center justify-center text-center w-28">
                <Flame size={28} weight="fill" className="text-accent-rose animate-bounce" />
                <span className="text-xl font-bold text-white mt-1">{currentStreak}</span>
                <span className="text-[10px] text-gray-500 uppercase font-medium">Day Streak</span>
              </div>
              <div className="glass-panel p-4 flex flex-col items-center justify-center text-center w-28">
                <Trophy size={28} weight="fill" className="text-accent-amber" />
                <span className="text-xl font-bold text-white mt-1">{telemetry?.level ?? 1}</span>
                <span className="text-[10px] text-gray-500 uppercase font-medium">Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Overview & Daily XP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily XP Goal */}
          <GlassCard className="p-6 md:col-span-1 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-1">Daily XP Goal</h3>
              <p className="text-xs text-gray-500 mb-4">Earn XP by finishing concepts & quizzes</p>
              
              <div className="flex items-center justify-center py-2">
                <ProgressRing
                  value={xpPercent}
                  size={120}
                  strokeWidth={10}
                  label={`${currentDailyXp}`}
                  sublabel={`/ ${targetXp} XP`}
                  color="#8b5cf6"
                />
              </div>
            </div>
            
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span className="font-semibold text-white">{xpPercent}% Complete</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-accent-violet h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Stats Metrics Matrix */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo">
                  <GraduationCap size={20} weight="duotone" />
                </div>
                <span className="text-xs font-semibold text-gray-400">Certificates Earned</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{telemetry?.certCount ?? 0}</p>
                <p className="text-[10px] text-gray-500 mt-1">Verified skill credentials</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
                  <Folder size={20} weight="duotone" />
                </div>
                <span className="text-xs font-semibold text-gray-400">Projects Evaluated</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{telemetry?.projectCount ?? 0}</p>
                <p className="text-[10px] text-gray-500 mt-1">AI-assessed repositories</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber">
                  <BookOpen size={20} weight="duotone" />
                </div>
                <span className="text-xs font-semibold text-gray-400">Active Skill Paths</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{telemetry?.activeSkills ?? 0}</p>
                <p className="text-[10px] text-gray-500 mt-1">Roadmaps currently generated</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose">
                  <ListChecks size={20} weight="duotone" />
                </div>
                <span className="text-xs font-semibold text-gray-400">Ready Rating</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{telemetry?.interviewReadinessScore ?? 0}%</p>
                <p className="text-[10px] text-gray-500 mt-1">Avg readiness indicator</p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Active Learning Paths */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white font-display">Active Learning Paths</h3>
            <Link to="/explore" className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1">
              Explore catalog
              <ArrowRight size={14} />
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center">
              <GraduationCap size={44} className="text-gray-600 mb-2" />
              <p className="text-sm font-medium text-white mb-1">No active skills</p>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Browse our curated AI curricula or query a custom skill mapping to begin learning.
              </p>
              <GlassButton onClick={() => navigate('/explore')} variant="primary" size="sm">
                Generate First Roadmap
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmaps.map((enroll) => {
                const totalPhases = enroll.roadmap?.phases?.length ?? 0;
                const completedPhases = enroll.roadmap?.phases?.filter(
                  (p) => p.status === 'PASSED'
                ).length ?? 0;
                const progressPercent =
                  totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
                
                const skillName = enroll.roadmap?.skill?.name ?? 'Unknown Skill';
                const skillCategory = enroll.roadmap?.skill?.category ?? 'General';

                return (
                  <GlassCard key={enroll.id} className="p-5 flex flex-col justify-between" hover>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <GlassBadge variant="violet" size="sm" className="mb-1">
                            {skillCategory}
                          </GlassBadge>
                          <h4 className="font-semibold text-white text-base">
                            {skillName}
                          </h4>
                        </div>
                        <GlassBadge variant={enroll.status === 'COMPLETED' ? 'success' : 'info'} size="sm">
                          {enroll.status}
                        </GlassBadge>
                      </div>

                      {/* Progress Metrics */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Mastery Rating</span>
                          <span className="text-white font-semibold">{enroll.masteryScore ?? 0}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-violet h-full rounded-full transition-all duration-300"
                            style={{ width: `${enroll.masteryScore ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                        <span>Phases: {completedPhases} / {totalPhases}</span>
                        <span>Estimated duration: {enroll.roadmap?.estimatedWeeks ?? 0} Weeks</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                      <GlassButton
                        onClick={() => navigate(`/roadmap/${enroll.roadmapId}`)}
                        variant="secondary"
                        size="sm"
                        icon={<ArrowRight size={14} />}
                      >
                        Resume Path
                      </GlassButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
