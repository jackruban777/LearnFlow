import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CircleNotch,
  CheckCircle,
  XCircle,
  GraduationCap,
  Sparkle,
  BookOpen,
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

interface QuizResultReport {
  score: number;
  result: string;
  correctCount: number;
  totalQuestions: number;
  xpAwarded: number;
  breakdown: GradedItem[];
}

export function Quiz() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<QuizResultReport | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get(`/questions/concept/${conceptId}`);
        setQuestions(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to retrieve quiz questions');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [conceptId, showToast]);

  const handleSelectOption = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleTextAnswerChange = (qId: string, val: string) => {
    setTextAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitQuiz = async () => {
    // Collect answers
    const answersPayload = questions.map((q) => {
      const answer = q.options ? selectedAnswers[q.id] || '' : textAnswers[q.id] || '';
      return {
        questionId: q.id,
        answer,
      };
    });

    // Check that everything has been answered
    const unanswered = answersPayload.some((a) => !a.answer.trim());
    if (unanswered) {
      showToast('warning', 'Quiz Incomplete', 'Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/questions/quiz/submit', {
        conceptId,
        answers: answersPayload,
      });

      setReport(res.data.data);
      showToast(
        res.data.data.result === 'FAIL' ? 'error' : 'success',
        res.data.data.result === 'FAIL' ? 'Quiz Failed' : 'Quiz Passed! 🎉',
        res.data.message || `Scored ${res.data.data.score}%`
      );

      // Add XP to user state if passing
      if (res.data.data.xpAwarded > 0 && user) {
        const newXp = user.xp + res.data.data.xpAwarded;
        const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
        setUser({ ...user, xp: newXp, level: newLevel });
      }
    } catch (err) {
      showToast('error', 'Submission Failed', 'Failed to grade quiz answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Concept Quiz">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell title="Concept Quiz">
        <div className="text-center py-16">
          <p className="text-gray-400">No questions available for this concept.</p>
          <GlassButton onClick={() => navigate(-1)} variant="secondary" className="mt-4">
            Go Back
          </GlassButton>
        </div>
      </AppShell>
    );
  }

  // Quiz completed, show scorecard report
  if (report) {
    const isPassing = report.result !== 'FAIL';

    return (
      <AppShell title="Quiz Results">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Main score badge */}
          <GlassCard className={`p-8 text-center relative overflow-hidden bg-glass-glow ${
            isPassing ? 'border-accent-emerald/30' : 'border-accent-rose/30'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Final Score Card</span>
            <h2 className="text-5xl font-display font-extrabold text-white mt-3 mb-1">
              {report.score}%
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <GlassBadge variant={isPassing ? 'success' : 'error'} size="md">
                {report.result}
              </GlassBadge>
              {report.xpAwarded > 0 && (
                <GlassBadge variant="violet" size="md" className="animate-pulse">
                  +{report.xpAwarded} XP
                </GlassBadge>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto">
              {isPassing 
                ? 'Excellent work! You have proven your mastery of this concept.'
                : 'You scored below the 70% threshold. Review the material and try again!'}
            </p>
          </GlassCard>

          {/* Graded questions review breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Answer Key Review</h3>
            
            {report.breakdown.map((item, idx) => (
              <GlassCard
                key={item.questionId}
                className={`p-5 space-y-3 ${
                  item.isCorrect ? 'border-accent-emerald/10' : 'border-accent-rose/10'
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
                  {!item.isCorrect && (
                    <p className="text-gray-400">
                      Correct Answer:{' '}
                      <span className="font-semibold text-accent-emerald">{item.correctAnswer}</span>
                    </p>
                  )}
                  <p className="text-gray-500 italic mt-2">
                    Explanation: {item.explanation}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            {!isPassing && (
              <GlassButton onClick={() => { setReport(null); setCurrentIndex(0); setSelectedAnswers({}); }} variant="secondary">
                Retake Quiz
              </GlassButton>
            )}
            <GlassButton onClick={() => navigate(-1)} variant="primary" icon={<BookOpen size={16} />}>
              Return to Lesson
            </GlassButton>
          </div>

        </div>
      </AppShell>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMcq = !!currentQuestion.options;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <AppShell title="Concept Quiz">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation / Progress header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          
          <span className="text-xs font-semibold text-gray-500 font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-accent-violet h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-6 md:p-8 space-y-6">
              
              {/* Question Text */}
              <div className="space-y-2">
                <GlassBadge variant="violet" size="sm">
                  {currentQuestion.difficulty}
                </GlassBadge>
                <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed font-display">
                  {currentQuestion.text}
                </h3>
              </div>

              {/* Code Snippet if applicable */}
              {currentQuestion.codeSnippet && (
                <div className="rounded-xl bg-black/35 border border-white/5 p-4 font-mono text-xs overflow-x-auto text-gray-300">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* MCQs Option Blocks */}
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
                /* Text Input Block */
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400">Your Answer:</label>
                  <textarea
                    rows={4}
                    value={textAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your explanation or answer code here…"
                    className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-violet focus:bg-black/45 text-sm"
                  />
                </div>
              )}

            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation Action buttons */}
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
              onClick={handleSubmitQuiz}
              variant="success"
              size="sm"
              isLoading={submitting}
              icon={<GraduationCap size={16} />}
            >
              Submit Quiz
            </GlassButton>
          ) : (
            <GlassButton
              onClick={() => {
                const ans = isMcq ? selectedAnswers[currentQuestion.id] : textAnswers[currentQuestion.id];
                if (!ans || !ans.trim()) {
                  showToast('warning', 'Answer Required', 'Please answer this question to proceed');
                  return;
                }
                setCurrentIndex((c) => c + 1);
              }}
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
