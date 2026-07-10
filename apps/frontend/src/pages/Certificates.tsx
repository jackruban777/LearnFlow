import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Medal, CircleNotch, Eye, Printer, GraduationCap, CalendarBlank } from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Certificate } from '../components/ui/Certificate';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface CompletedCourse {
  id: string;
  roadmapId: string;
  status: string;
  masteryScore: number;
  completedAt: string | null;
  roadmap: {
    id: string;
    skill: {
      name: string;
      category: string;
    };
  };
}

export function Certificates() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user } = useAuthStore();
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<CompletedCourse | null>(null);

  useEffect(() => {
    async function fetchCompleted() {
      try {
        const res = await api.get('/roadmaps/user');
        const data = res.data.data || [];
        const completed = data.filter((c: any) => c.status === 'COMPLETED');
        setCompletedCourses(completed);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Could not load your certificates.');
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  if (loading) {
    return (
      <AppShell title="Certificates">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="My Certificates">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {completedCourses.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
              <Medal size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Certificates Earned Yet</h3>
              <p className="text-sm text-gray-400 mt-1">Complete all phases and exit assessments of a roadmap to earn a certificate.</p>
            </div>
            <GlassButton onClick={() => navigate('/courses')} variant="primary" className="mt-2 mx-auto">
              View Course Progress
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedCourses.map((c, idx) => {
              const formattedDate = c.completedAt
                ? new Date(c.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard className="p-6 relative overflow-hidden bg-glass-glow flex flex-col justify-between h-56 border-accent-emerald/20 hover:border-accent-emerald/40 transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
                          <GraduationCap size={20} weight="fill" />
                        </div>
                        <span className="text-[10px] font-bold text-accent-emerald uppercase tracking-wider bg-accent-emerald/5 px-2 py-0.5 rounded border border-accent-emerald/10">
                          Verified
                        </span>
                      </div>
                      
                      <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-1">
                        {c.roadmap.skill.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{c.roadmap.skill.category} Track</p>
                      
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-4">
                        <CalendarBlank size={12} />
                        <span>Completed: {formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-4">
                      <GlassButton
                        onClick={() => setActiveCert(c)}
                        variant="primary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent-emerald to-emerald-600 border-accent-emerald/30 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                      >
                        <Eye size={14} />
                        View Cert
                      </GlassButton>
                      <GlassButton
                        onClick={() => {
                          setActiveCert(c);
                          // Defer printing slightly so the modal state is fully loaded
                          setTimeout(() => window.print(), 300);
                        }}
                        variant="secondary"
                        size="sm"
                        className="flex items-center justify-center p-2.5"
                        title="Print Certificate"
                      >
                        <Printer size={14} />
                      </GlassButton>
                    </div>

                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Certificate Modal render */}
        {activeCert && (
          <Certificate
            isOpen={!!activeCert}
            onClose={() => setActiveCert(null)}
            recipientName={user?.name ?? 'Learner'}
            skillName={activeCert.roadmap.skill.name}
            skillCategory={activeCert.roadmap.skill.category}
            completionDate={activeCert.completedAt || new Date().toISOString()}
            masteryScore={Math.round(activeCert.masteryScore)}
            enrollmentId={activeCert.id}
          />
        )}

      </div>
    </AppShell>
  );
}
