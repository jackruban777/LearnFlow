import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CircleNotch,
  BookOpen,
  Check,
  CheckCircle,
  GraduationCap,
  Play,
  ArrowRight,
  Bookmark,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';

interface ConceptDetail {
  id: string;
  phaseId: string;
  title: string;
  order: number;
  difficulty: string;
  estimatedMinutes: number;
  lessonContent: string | null;
  status: string;
  progress: {
    status: string;
    bestQuizScore: number | null;
    attemptCount: number;
  } | null;
}

interface RoadmapData {
  id: string;
  roadmap: {
    skill: {
      name: string;
    };
    phases: {
      id: string;
      title: string;
      order: number;
      concepts: {
        id: string;
        title: string;
        order: number;
        estimatedMinutes: number;
        status: string;
      }[];
    }[];
  };
}

// Simple custom Markdown rendering engine to output beautiful styled blocks
function renderMarkdown(content: string) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  lines.forEach((line, index) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-${index}`} className="relative my-4 rounded-xl overflow-hidden bg-black/40 border border-white/5 font-mono text-xs">
            <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-b border-white/5 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              <span>{codeBlockLang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeBlockContent.join('\n'))}
                className="hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-gray-300">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={index} className="text-2xl font-bold font-display text-white mt-6 mb-3">
          {trimmed.replace('# ', '')}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={index} className="text-xl font-bold font-display text-white mt-5 mb-2.5 border-b border-white/5 pb-1.5">
          {trimmed.replace('## ', '')}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={index} className="text-lg font-bold font-display text-white mt-4 mb-2">
          {trimmed.replace('### ', '')}
        </h3>
      );
      return;
    }

    // Callouts / Quotes
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={index} className="pl-4 border-l-4 border-accent-violet bg-white/5 py-3 pr-4 rounded-r-xl my-4 text-sm text-gray-300 italic">
          {trimmed.replace('> ', '')}
        </blockquote>
      );
      return;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <ul key={index} className="list-disc pl-6 text-sm text-gray-300 my-1.5">
          <li>{trimmed.substring(2)}</li>
        </ul>
      );
      return;
    }

    // Empty space
    if (!trimmed) {
      renderedElements.push(<div key={index} className="h-3" />);
      return;
    }

    // Standard paragraph with bold parsing
    const parts = trimmed.split('**');
    const parsedText = parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return <strong key={pIdx} className="font-semibold text-white">{part}</strong>;
      }
      return part;
    });

    renderedElements.push(
      <p key={index} className="text-sm text-gray-300 leading-relaxed mb-3">
        {parsedText}
      </p>
    );
  });

  return <div className="space-y-1">{renderedElements}</div>;
}

export function Concept() {
  const { id: roadmapId, conceptId } = useParams<{ id: string; conceptId: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [loadingConcept, setLoadingConcept] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [concept, setConcept] = useState<ConceptDetail | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);

  // Fetch roadmap navigation tree
  useEffect(() => {
    async function fetchRoadmapData() {
      try {
        const res = await api.get(`/roadmaps/${roadmapId}`);
        setRoadmapData(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to retrieve roadmap index');
      } finally {
        setLoadingRoadmap(false);
      }
    }
    fetchRoadmapData();
  }, [roadmapId, showToast]);

  // Fetch specific concept text
  useEffect(() => {
    async function fetchConceptDetail() {
      setLoadingConcept(true);
      try {
        const res = await api.get(`/concepts/${conceptId}`);
        setConcept(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to retrieve lesson text');
      } finally {
        setLoadingConcept(false);
      }
    }
    fetchConceptDetail();
  }, [conceptId, showToast]);

  const currentPhase = roadmapData?.roadmap.phases.find(p =>
    p.concepts.some(c => c.id === conceptId)
  );

  const conceptList = currentPhase?.concepts || [];
  const currentIndex = conceptList.findIndex(c => c.id === conceptId);
  const nextConcept = currentIndex < conceptList.length - 1 ? conceptList[currentIndex + 1] : null;

  const isCompleted = concept?.progress?.status === 'PASSED' || concept?.progress?.status === 'EXCELLENT';

  return (
    <AppShell title={roadmapData?.roadmap.skill.name || 'Lesson Panel'}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-6.5rem)] overflow-hidden">
        
        {/* Left Sidebar Table of Contents */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col glass-panel max-h-48 lg:max-h-none overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Bookmark size={18} className="text-accent-violet" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Lesson Pathway</span>
          </div>

          {loadingRoadmap ? (
            <div className="flex justify-center py-6">
              <CircleNotch size={20} className="animate-spin text-gray-500" />
            </div>
          ) : (
            <nav className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 px-2">
                {currentPhase?.title}
              </p>
              {conceptList.map((c) => {
                const isActive = c.id === conceptId;
                const isItemPassed = c.status === 'PASSED' || c.status === 'EXCELLENT';

                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/roadmap/${roadmapId}/concept/${c.id}`)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all ${
                      isActive
                        ? 'bg-accent-violet/20 border-accent-violet/30 text-white'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isItemPassed ? 'bg-accent-emerald border-accent-emerald text-white' : 'border-white/10'
                      }`}>
                        {isItemPassed && <Check size={10} weight="bold" />}
                      </div>
                      <span className="truncate">{c.title}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 shrink-0">{c.estimatedMinutes}m</span>
                  </button>
                );
              })}
            </nav>
          )}

          <div className="pt-4 border-t border-white/5 mt-auto">
            <GlassButton
              onClick={() => navigate(`/roadmap/${roadmapId}`)}
              variant="secondary"
              size="sm"
              icon={<ArrowLeft size={12} />}
              className="w-full text-xs"
            >
              Exit to Roadmap
            </GlassButton>
          </div>
        </aside>

        {/* Right Main Reading Content */}
        <section className="flex-1 flex flex-col glass-panel overflow-hidden">
          {loadingConcept ? (
            <div className="flex flex-1 items-center justify-center">
              <CircleNotch size={32} className="animate-spin text-accent-violet" />
            </div>
          ) : concept ? (
            <>
              {/* Top Meta Details bar */}
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Lesson {concept.order}</span>
                    <GlassBadge variant={isCompleted ? 'success' : 'default'} size="sm">
                      {concept.progress?.status ? concept.progress.status.replace('_', ' ') : 'NOT STARTED'}
                    </GlassBadge>
                  </div>
                  <h3 className="font-bold text-white text-base font-display">{concept.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                  <span>Reading: {concept.estimatedMinutes} Mins</span>
                </div>
              </div>

              {/* Main Scrolling Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth select-text">
                {concept.lessonContent ? (
                  renderMarkdown(concept.lessonContent)
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <p>No content provided for this concept.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer bar */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
                      <CheckCircle size={16} weight="fill" />
                      <span>Completed ✅</span>
                    </div>
                  ) : null}

                  <GlassButton
                    onClick={() => navigate(`/learn/quiz/${conceptId}`)}
                    variant="primary"
                    size="sm"
                    icon={<GraduationCap size={16} />}
                  >
                    Take Quiz
                  </GlassButton>
                </div>

                {nextConcept && (
                  <GlassButton
                    onClick={() => navigate(`/roadmap/${roadmapId}/concept/${nextConcept.id}`)}
                    variant="secondary"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                  >
                    Next: {nextConcept.title}
                  </GlassButton>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <p>Could not load lesson contents.</p>
            </div>
          )}
        </section>

      </div>
    </AppShell>
  );
}
