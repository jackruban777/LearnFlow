import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CircleNotch,
  Microphone,
  CheckCircle,
  XCircle,
  ChatText,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface VivaQuestion {
  question: string;
  expectedKeyPoints: string[];
  difficulty: string;
}

interface VivaStartResponse {
  id: string; // session ID
  currentQuestion: VivaQuestion;
  questionIndex: number;
  totalQuestions: number;
}

interface QuestionScoreBreakdown {
  questionIndex: number;
  score: number;
  feedback: string;
}

interface VivaAnswerResponse {
  overallScore: number | null;
  passed: boolean | null;
  feedback: string | null;
  questionScore: number;
  questionFeedback: string;
  nextQuestion: VivaQuestion | null;
  currentQuestionIndex: number;
  xpAwarded: number | null;
  interviewReadinessDelta: number | null;
}

export function Viva() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<VivaQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [answerInput, setAnswerInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Keep track of feedback from answered questions
  const [history, setHistory] = useState<Array<{ question: string; answer: string; score: number; feedback: string }>>([]);
  
  // Final report states
  const [report, setReport] = useState<{
    overallScore: number;
    passed: boolean;
    feedback: string;
    xpAwarded: number;
    readinessDelta: number;
  } | null>(null);

  useEffect(() => {
    async function startSession() {
      try {
        const res = await api.post(`/phases/${phaseId}/viva/start`);
        const session: VivaStartResponse = res.data.data;
        setSessionId(session.id);
        setCurrentQuestion(session.currentQuestion);
        setQuestionIndex(session.questionIndex);
        setTotalQuestions(session.totalQuestions);
      } catch (err) {
        showToast('error', 'Session Failed', 'Could not initialize oral examination session');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    startSession();
  }, [phaseId, showToast, navigate]);

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim()) {
      showToast('warning', 'Answer Empty', 'Please provide a response before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/phases/${phaseId}/viva/answer`, {
        vivaSessionId: sessionId,
        questionIndex,
        answer: answerInput,
      });

      const gradings: VivaAnswerResponse = res.data.data;

      // Add to session history
      if (currentQuestion) {
        setHistory((prev) => [
          ...prev,
          {
            question: currentQuestion.question,
            answer: answerInput,
            score: gradings.questionScore,
            feedback: gradings.questionFeedback,
          },
        ]);
      }

      setAnswerInput('');

      // Check if session completed (overallScore !== null)
      if (gradings.overallScore !== null) {
        setReport({
          overallScore: gradings.overallScore,
          passed: gradings.passed || false,
          feedback: gradings.feedback || 'Session evaluated.',
          xpAwarded: gradings.xpAwarded || 0,
          readinessDelta: gradings.interviewReadinessDelta || 0,
        });

        showToast(
          gradings.passed ? 'success' : 'error',
          gradings.passed ? 'Oral Viva Passed! 🗣️' : 'Oral Viva Failed',
          `Evaluated score: ${gradings.overallScore}%`
        );

        // Update local user state XP and interview readiness
        if (user) {
          const deltaXp = gradings.xpAwarded || 0;
          const newXp = user.xp + deltaXp;
          const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
          const newReadiness = Math.min(100, (user.interviewReadinessScore || 0) + (gradings.interviewReadinessDelta || 0));
          setUser({ ...user, xp: newXp, level: newLevel, interviewReadinessScore: newReadiness });
        }
      } else {
        // Go to next question
        setCurrentQuestion(gradings.nextQuestion);
        setQuestionIndex(gradings.currentQuestionIndex);
        showToast('info', 'Question Graded', `Scored ${gradings.questionScore}% on question ${questionIndex + 1}`);
      }
    } catch (err) {
      showToast('error', 'Grading Failed', 'Could not record verbal answer grading');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Oral Viva Exam">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  // Viva completed, show scorecard report
  if (report) {
    const isPassing = report.passed;

    return (
      <AppShell title="Viva Summary">
        <div className="max-w-3xl mx-auto space-y-8 select-text">
          
          {/* Main result badge */}
          <GlassCard className={`p-8 text-center relative overflow-hidden bg-glass-glow ${
            isPassing ? 'border-accent-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-accent-rose/30'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Oral Viva Score Card</span>
            <h2 className="text-5xl font-display font-extrabold text-white mt-3 mb-1">
              {report.overallScore}%
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
              {report.readinessDelta > 0 && (
                <GlassBadge variant="success" size="md" className="flex items-center gap-1">
                  <TrendUp size={12} />
                  +{report.readinessDelta} Readiness
                </GlassBadge>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mt-4 max-w-lg mx-auto leading-relaxed">
              {report.feedback}
            </p>
          </GlassCard>

          {/* Dialog breakdown review */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Session Transcript & Feedbacks</h3>
            
            {history.map((item, idx) => (
              <GlassCard key={idx} className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet shrink-0 text-xs font-bold">
                      Q
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.question}</p>
                    </div>
                  </div>
                  <GlassBadge variant={item.score >= 70 ? 'success' : 'error'} size="sm" className="shrink-0">
                    Score: {item.score}%
                  </GlassBadge>
                </div>

                <div className="pl-8.5 space-y-2.5 border-t border-white/5 pt-3">
                  <div className="text-xs">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider block mb-1">Your response:</span>
                    <p className="text-gray-300 italic">"{item.answer}"</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider block mb-1">AI Assessor Notes:</span>
                    <p className="text-gray-400">{item.feedback}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="flex justify-end">
            <GlassButton onClick={() => navigate(-1)} variant="primary" icon={<ArrowLeft size={16} />}>
              Back to Roadmap
            </GlassButton>
          </div>

        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="AI Oral Examination">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Abandone Viva
          </button>
          
          <span className="text-xs font-semibold text-gray-500 font-mono">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Top Progress bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-accent-violet h-full rounded-full transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Conversational Screen bubble */}
        <div className="space-y-4 select-text">
          {/* Interviewer node bubble */}
          <div className="flex gap-3 max-w-[90%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-accent-violet shrink-0">
              <Microphone size={16} weight="fill" className="animate-pulse" />
            </div>
            <GlassCard className="p-4 rounded-tl-none space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-accent-violet">AI Assessor</span>
                <Sparkle size={10} className="text-accent-violet animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed font-display">
                {currentQuestion?.question}
              </p>
              
              {currentQuestion?.expectedKeyPoints && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Expected Key Points:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentQuestion.expectedKeyPoints.map((kp, kIdx) => (
                      <GlassBadge key={kIdx} variant="default" size="sm" className="text-[9px]">
                        {kp}
                      </GlassBadge>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* User input response panel */}
          <div className="space-y-2 pl-11">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Provide Verbal-Style Explanation:</label>
            <textarea
              rows={5}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Explain details as you would in a verbal technical interview…"
              className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-violet focus:bg-black/45 text-sm"
              disabled={submitting}
            />
            <p className="text-[10px] text-gray-500 leading-normal">
              Be detailed. Match the expected key points to earn a higher grading score!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2">
          <GlassButton
            onClick={handleSubmitAnswer}
            variant="primary"
            isLoading={submitting}
            icon={<ChatText size={16} />}
            size="sm"
          >
            Submit Response
          </GlassButton>
        </div>

      </div>
    </AppShell>
  );
}
