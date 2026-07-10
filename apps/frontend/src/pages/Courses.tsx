import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Sparkle, CircleNotch, Sliders, ArrowRight } from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface RoadmapBrief {
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
  };
}

export function Courses() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [courses, setCourses] = useState<RoadmapBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<RoadmapBrief | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchCourses = async (selectId?: string) => {
    try {
      const res = await api.get('/roadmaps/user');
      const data = res.data.data || [];
      const ongoing = data.filter((c: any) => c.status !== 'COMPLETED');
      setCourses(ongoing);
      if (ongoing.length > 0) {
        if (selectId) {
          const found = ongoing.find((c: any) => c.id === selectId);
          setSelectedCourse(found || ongoing[0]);
        } else if (!selectedCourse) {
          setSelectedCourse(ongoing[0]);
        } else {
          // Keep current selection but refresh details
          const found = ongoing.find((c: any) => c.id === selectedCourse.id);
          setSelectedCourse(found || ongoing[0]);
        }
      } else {
        setSelectedCourse(null);
      }
    } catch (err) {
      showToast('error', 'Fetch Failed', 'Could not load your enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleUpdateProgress = async (percentage: number) => {
    if (!selectedCourse) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/progress/skill/${selectedCourse.roadmapId}`, {
        masteryScore: percentage,
      });
      showToast('success', 'Progress Updated', `Course mastery adjusted to ${percentage}%`);
      await fetchCourses(selectedCourse.id);
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not adjust course progress.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="My Courses">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="My Courses">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {courses.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Enrolled Courses</h3>
              <p className="text-sm text-gray-400 mt-1">Generate your first learning roadmap to start studying.</p>
            </div>
            <GlassButton onClick={() => navigate('/explore')} variant="primary" className="mt-2 mx-auto">
              Explore Skill Tracks
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sidebar List */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Active Roadmaps</h3>
              <div className="space-y-2">
                {courses.map((c) => {
                  const isSelected = selectedCourse?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-accent-violet/15 border-accent-violet/40 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {c.roadmap.skill.name}
                        </h4>
                        <GlassBadge variant={c.status === 'COMPLETED' ? 'success' : 'violet'} size="sm">
                          {c.status}
                        </GlassBadge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3">
                        <span>Mastery: {Math.round(c.masteryScore)}%</span>
                        <span>{c.roadmap.estimatedWeeks} wks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Progress Details */}
            <div className="md:col-span-2">
              <AnimatePresence mode="wait">
                {selectedCourse && (
                  <motion.div
                    key={selectedCourse.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard className="p-6 md:p-8 space-y-6">
                      
                      {/* Course Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                        <div className="space-y-1">
                          <span className="text-[10px] text-accent-violet font-bold uppercase tracking-widest">
                            {selectedCourse.roadmap.skill.category}
                          </span>
                          <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                            {selectedCourse.roadmap.skill.name}
                          </h2>
                        </div>
                        <GlassButton
                          onClick={() => navigate(`/roadmap/${selectedCourse.roadmapId}`)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 self-start sm:self-auto"
                        >
                          Open Roadmap
                          <ArrowRight size={14} />
                        </GlassButton>
                      </div>

                      {/* Progress Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 flex flex-col justify-center border-white/5">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                            Overall Progress
                          </span>
                          <span className="text-3xl font-display font-extrabold text-glow-violet text-white">
                            {Math.round(selectedCourse.masteryScore)}%
                          </span>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                              className="bg-accent-violet h-full rounded-full transition-all duration-500"
                              style={{ width: `${selectedCourse.masteryScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="glass-panel p-4 flex flex-col justify-center items-start border-white/5">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                            Status
                          </span>
                          <GlassBadge variant={selectedCourse.status === 'COMPLETED' ? 'success' : 'violet'} className="mt-1">
                            {selectedCourse.status}
                          </GlassBadge>
                        </div>
                      </div>

                      {/* Manual Progress Editor */}
                      <div className="border-t border-white/5 pt-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sliders size={18} className="text-accent-violet" />
                          <h3 className="text-sm font-bold text-white">Adjust Course Progress</h3>
                        </div>
                        <p className="text-xs text-gray-400">
                          Manually override the completion status of this course. Setting it to **100%** will automatically pass all exams/projects/vivas and issue a completion certificate.
                        </p>

                        <div className="grid grid-cols-4 gap-2.5 pt-2">
                          {[25, 50, 75, 100].map((percent) => {
                            const isActive = Math.round(selectedCourse.masteryScore) === percent;
                            return (
                              <button
                                key={percent}
                                disabled={updating}
                                onClick={() => handleUpdateProgress(percent)}
                                className={`py-3.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-semibold ${
                                  isActive
                                    ? 'bg-accent-violet/20 border-accent-violet text-white shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
                                }`}
                              >
                                {updating && percent === 100 && selectedCourse.masteryScore !== 100 ? (
                                  <CircleNotch size={14} className="animate-spin text-accent-violet" />
                                ) : percent === 100 ? (
                                  <Trophy size={14} weight={isActive ? 'fill' : 'regular'} />
                                ) : (
                                  <Sparkle size={14} />
                                )}
                                <span className="text-xs">{percent}%</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
