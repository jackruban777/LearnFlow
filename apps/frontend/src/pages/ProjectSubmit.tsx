import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CircleNotch,
  GithubLogo,
  CheckCircle,
  XCircle,
  PaperPlaneTilt,
  BookOpen,
  Warning,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface EvaluationScores {
  codeQuality: number;
  functionality: number;
  documentation: number;
  bestPractices: number;
  creativity: number;
}

interface ProjectEvaluation {
  overallScore: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  scores: EvaluationScores;
  xpAwarded: number;
}

export function ProjectSubmit() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user, setUser } = useAuthStore();

  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ProjectEvaluation | null>(null);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim().startsWith('https://github.com/')) {
      showToast('warning', 'Invalid URL', 'Please provide a valid GitHub repository link');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      showToast('warning', 'Details Required', 'Provide a detailed description of at least 15 characters');
      return;
    }

    setSubmitting(true);
    try {
      const techStack = techStackInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => !!t);

      const res = await api.post(`/phases/${phaseId}/project/submit`, {
        repoUrl,
        description,
        techStack,
      });

      const result: ProjectEvaluation = res.data.data;
      setEvaluation(result);

      showToast(
        result.passed ? 'success' : 'error',
        result.passed ? 'Project Passed! 🚀' : 'Project Evaluation Failed',
        res.data.message || `Scored ${result.overallScore}%`
      );

      // Add XP to user state if passing
      if (result.passed && result.xpAwarded > 0 && user) {
        const newXp = user.xp + result.xpAwarded;
        const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
        setUser({ ...user, xp: newXp, level: newLevel, totalProjects: (user.totalProjects || 0) + 1 });
      }
    } catch (err) {
      showToast('error', 'Evaluation Failed', 'Failed to submit repository for evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Project Evaluation">
      <div className="max-w-3xl mx-auto space-y-6 select-text">
        
        {/* Navigation header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Back to Roadmap</span>
        </div>

        {evaluation ? (
          /* Detailed Score Sheet panel */
          <div className="space-y-8">
            <GlassCard className={`p-8 text-center relative overflow-hidden bg-glass-glow ${
              evaluation.passed ? 'border-accent-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-accent-rose/30'
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Assessment Result</span>
              <h2 className="text-5xl font-display font-extrabold text-white mt-3 mb-1">
                {evaluation.overallScore}%
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <GlassBadge variant={evaluation.passed ? 'success' : 'error'} size="md">
                  {evaluation.passed ? 'PASSED' : 'FAILED'}
                </GlassBadge>
                {evaluation.passed && evaluation.xpAwarded > 0 && (
                  <GlassBadge variant="violet" size="md">
                    +{evaluation.xpAwarded} XP
                  </GlassBadge>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
                {evaluation.feedback}
              </p>
            </GlassCard>

            {/* Score matrix categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Telemetry Score Grid</h3>
                
                {[
                  { label: 'Code Quality', score: evaluation.scores.codeQuality, color: 'bg-accent-violet' },
                  { label: 'Functionality', score: evaluation.scores.functionality, color: 'bg-accent-indigo' },
                  { label: 'Documentation', score: evaluation.scores.documentation, color: 'bg-accent-emerald' },
                  { label: 'Best Practices', score: evaluation.scores.bestPractices, color: 'bg-accent-rose' },
                  { label: 'Creativity', score: evaluation.scores.creativity, color: 'bg-accent-amber' },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{s.label}</span>
                      <span className="font-semibold text-white">{s.score}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className={`${s.color} h-full rounded-full`} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </GlassCard>

              {/* Streaks & Improvements list */}
              <GlassCard className="p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Highlights</h3>
                  
                  {/* Strengths */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-accent-emerald font-semibold uppercase tracking-wider">Key Strengths:</span>
                    <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                      {evaluation.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <span className="text-[10px] text-accent-rose font-semibold uppercase tracking-wider">Needs Improvement:</span>
                    <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                      {evaluation.improvements.map((imp, iIdx) => (
                        <li key={iIdx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {!evaluation.passed && (
                  <div className="border-t border-white/5 pt-3 flex items-center gap-1.5 text-accent-rose text-[10px]">
                    <Warning size={14} />
                    <span>Scored below passing threshold. Rectify improvements and submit again.</span>
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="flex justify-end gap-3">
              {!evaluation.passed && (
                <GlassButton onClick={() => setEvaluation(null)} variant="secondary">
                  Try Again
                </GlassButton>
              )}
              <GlassButton onClick={() => navigate(-1)} variant="primary" icon={<BookOpen size={16} />}>
                Return to Roadmap
              </GlassButton>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <GlassCard className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GithubLogo size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white font-display">Repository Submission</h2>
              </div>
              <p className="text-xs text-gray-400 leading-normal">
                Submit your project codebase repository. Our backend performs AST structure inspection and AI rubric grading.
              </p>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              {/* Repo URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">GitHub Repository URL:</label>
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="glass-input text-xs"
                />
              </div>

              {/* Technologies */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Technologies Used (Comma-separated):</label>
                <input
                  type="text"
                  required
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="React, TypeScript, TailwindCSS, Express"
                  className="glass-input text-xs"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Project Description & Architecture:</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your implementation features, databases integrated, state management strategies, etc…"
                  className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-violet focus:bg-black/45 text-xs"
                />
              </div>

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={submitting}
                  icon={<PaperPlaneTilt size={16} />}
                >
                  Submit Code to Static AST Evaluator
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        )}

      </div>
    </AppShell>
  );
}
