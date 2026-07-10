import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CircleNotch,
  CheckCircle,
  XCircle,
  Flag,
  BookOpen,
  Warning,
  ListChecks,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface Question {
  id: string;
  conceptId: string;
  text: string;
  type: string;
  difficulty: string;
  options: string[] | null;
  codeSnippet: string | null;
}

interface GradedItem {
  questionId: string;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

interface RecoveryStep {
  conceptTitle: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedMinutes: number;
}

interface RecoveryPlan {
  summary: string;
  weakAreas: string[];
  steps: RecoveryStep[];
  estimatedRecoveryDays: number;
  encouragement: string;
}

interface ExamResultReport {
  score: number;
  passed: boolean;
  xpAwarded: number;
  recoveryPlan: RecoveryPlan | null;
  breakdown: GradedItem[];
}

export function Exam() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<ExamResultReport | null>(null);

  // Timer countdown: 15 minutes (900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get(`/phases/${phaseId}/exam`);
        setQuestions(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to construct phase exam questions');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [phaseId, showToast]);

  // Timer effect
  useEffect(() => {
    if (loading || report) return;
    if (timeLeft <= 0) {
      showToast('warning', 'Time Expired', 'Submitting exam answers automatically…');
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, report]);

  const handleSelectOption = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlags((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitExam = async () => {
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      answer: selectedAnswers[q.id] || '',
    }));

    setSubmitting(true);
    try {
      const res = await api.post(`/phases/${phaseId}/exam/submit`, {
        answers: answersPayload,
      });

      setReport(res.data.data);

      showToast(
        res.data.data.passed ? 'success' : 'error',
        res.data.data.passed ? 'Exam Passed! 🎓' : 'Exam Failed',
        res.data.message || `Scored ${res.data.data.score}%`
      );

      // Award XP globally if passed
      if (res.data.data.passed && res.data.data.xpAwarded > 0 && user) {
        const newXp = user.xp + res.data.data.xpAwarded;
        const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
        setUser({ ...user, xp: newXp, level: newLevel });
      }
    } catch (err) {
      showToast('error', 'Submission Failed', 'Failed to evaluate exam grading');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppShell title="Exit Exam">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell title="Exit Exam">
        <div className="text-center py-16">
          <p className="text-gray-400">Could not compile questions for this phase.</p>
          <GlassButton onClick={() => navigate(-1)} variant="secondary" className="mt-4">
            Go Back
          </GlassButton>
        </div>
      </AppShell>
    );
  }

  // Quiz completed, show scorecard report
  if (report) {
    const isPassing = report.passed;

    return (
      <AppShell title="Exam Report">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Main score details banner */}
          <GlassCard className={`p-8 text-center relative overflow-hidden bg-glass-glow ${
            isPassing ? 'border-accent-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-accent-rose/30'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Exit Assessment Score</span>
            <h2 className="text-5xl font-display font-extrabold text-white mt-3 mb-1">
              {report.score}%
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <GlassBadge variant={isPassing ? 'success' : 'error'} size="md">
                {isPassing ? 'PASSED' : 'FAILED'}
              </GlassBadge>
              {isPassing && report.xpAwarded > 0 && (
                <GlassBadge variant="violet" size="md">
                  +{report.xpAwarded} XP
                </GlassBadge>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto">
              {isPassing 
                ? 'Fantastic score! You have unlocked the next stage of the skill mastery tree.'
                : 'You did not achieve the required 70% threshold. Let’s review your personalized Recovery Plan below.'}
            </p>
          </GlassCard>

          {/* Recovery Plan (Highly interactive UI block) */}
          {!isPassing && report.recoveryPlan && (
            <GlassCard className="p-6 border-accent-rose/25 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-accent-rose">
                <Warning size={22} weight="fill" />
                <h3 className="font-bold text-white font-display text-base">Personalized Recovery Plan</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {report.recoveryPlan.summary}
              </p>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Guided Steps:</h4>
                {report.recoveryPlan.steps.map((step, sIdx) => (
                  <div key={sIdx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{step.conceptTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.action}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <GlassBadge variant={step.priority === 'HIGH' ? 'error' : 'warning'} size="sm">
                        {step.priority}
                      </GlassBadge>
                      <span className="text-[10px] text-gray-500 font-medium">{step.estimatedMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-gray-500 italic">
                <span>Estimated days to review: {report.recoveryPlan.estimatedRecoveryDays}</span>
                <span className="text-accent-rose font-medium">{report.recoveryPlan.encouragement}</span>
              </div>
            </GlassCard>
          )}

          {/* Answer Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Exam Questions Review</h3>
            
            {report.breakdown.map((item, idx) => (
              <GlassCard
                key={item.questionId}
                className={`p-5 space-y-3 ${
                  item.isCorrect ? 'border-accent-emerald/15' : 'border-accent-rose/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">Q{idx + 1}</span>
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </div>
                  {item.isCorrect ? (
                    <CheckCircle size={20} weight="fill" className="text-accent-emerald shrink-0" />
                  ) : (
                    <XCircle size={20} weight="fill" className="text-accent-rose shrink-0" />
                  )}
                </div>

                <div className="text-xs space-y-1.5 border-t border-white/5 pt-3">
                  <p className="text-gray-400">
                    Your Answer:{' '}
                    <span className={`font-semibold ${item.isCorrect ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {item.userAnswer || '(No answer)'}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Correct Answer: <span className="font-semibold text-accent-emerald">{item.correctAnswer}</span>
                  </p>
                  <p className="text-gray-500 italic mt-2">
                    Explanation: {item.explanation}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            {!isPassing && (
              <GlassButton onClick={() => { setReport(null); setCurrentIndex(0); setSelectedAnswers({}); setTimeLeft(900); }} variant="secondary">
                Retake Exam
              </GlassButton>
            )}
            <GlassButton onClick={() => navigate(-1)} variant="primary" icon={<BookOpen size={16} />}>
              Return to Roadmap
            </GlassButton>
          </div>

        </div>
      </AppShell>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMcq = !!currentQuestion.options;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFlagged = !!flags[currentQuestion.id];

  return (
    <AppShell title="Exit Assessment">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation / Progress / Timer Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Exit Exam
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-500 font-mono">
              Q: {currentIndex + 1} / {questions.length}
            </span>
            <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              timeLeft < 120 ? 'bg-accent-rose/15 border-accent-rose text-accent-rose' : 'bg-white/5 border-white/10 text-white'
            }`}>
              Timer: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Timeline nodes helper */}
        <div className="flex gap-2 justify-between">
          {questions.map((q, idx) => {
            const hasAnswered = !!selectedAnswers[q.id];
            const active = idx === currentIndex;
            const flagged = flags[q.id];

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-1 h-2.5 rounded-full border transition-all ${
                  active
                    ? 'border-accent-violet bg-accent-violet/30 shadow-accent-glow'
                    : flagged
                    ? 'border-accent-amber bg-accent-amber/30'
                    : hasAnswered
                    ? 'border-accent-indigo bg-accent-indigo/25'
                    : 'border-white/5 bg-white/5'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Question Reader Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-6 md:p-8 space-y-6">
              
              <div className="flex justify-between items-start">
                <GlassBadge variant="violet" size="sm">
                  {currentQuestion.difficulty}
                </GlassBadge>
                
                <button
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] font-semibold transition-all ${
                    isFlagged
                      ? 'bg-accent-amber/15 border-accent-amber text-accent-amber'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                  }`}
                >
                  <Flag size={12} weight={isFlagged ? 'fill' : 'bold'} />
                  {isFlagged ? 'FLAGGED' : 'FLAG'}
                </button>
              </div>

              {/* Question text */}
              <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed font-display">
                {currentQuestion.text}
              </h3>

              {/* Code Snippet if applicable */}
              {currentQuestion.codeSnippet && (
                <div className="rounded-xl bg-black/35 border border-white/5 p-4 font-mono text-xs overflow-x-auto text-gray-300">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* Option Blocks */}
              {isMcq ? (
                <div className="space-y-3">
                  {currentQuestion.options!.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestion.id, option)}
                        className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'bg-accent-violet/15 border-accent-violet text-white shadow-accent-glow'
                            : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-accent-violet bg-accent-violet' : 'border-white/20'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Provide answer parameters accordingly.</p>
              )}

            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation controls */}
        <div className="flex justify-between items-center pt-2">
          <GlassButton
            onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))}
            disabled={currentIndex === 0}
            variant="secondary"
            size="sm"
          >
            Previous
          </GlassButton>

          {isLastQuestion ? (
            <GlassButton
              onClick={handleSubmitExam}
              variant="success"
              size="sm"
              isLoading={submitting}
              icon={<ListChecks size={16} />}
            >
              Finish Exam
            </GlassButton>
          ) : (
            <GlassButton
              onClick={() => setCurrentIndex((c) => c + 1)}
              variant="primary"
              size="sm"
            >
              Next Question
            </GlassButton>
          )}
        </div>

      </div>
    </AppShell>
  );
}
