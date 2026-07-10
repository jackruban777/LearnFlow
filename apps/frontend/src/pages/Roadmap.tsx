import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle,
  Play,
  Exam as ExamIcon,
  CodeBlock,
  Microphone,
  ArrowLeft,
  CircleNotch,
  BookOpen,
  Medal,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { Certificate } from '../components/ui/Certificate';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

interface Concept {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  status: string;
}

interface Phase {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  examScore: number | null;
  examAttempts: number;
  projectStatus: string | null;
  projectScore: number | null;
  vivaScore: number | null;
  masteryScore: number;
  concepts: Concept[];
}

interface RoadmapData {
  id: string;
  status: string;
  masteryScore: number;
  roadmap: {
    skill: {
      name: string;
      category: string;
      description: string;
    };
    estimatedWeeks: number;
    phases: Phase[];
  };
}

interface CuratedResource {
  name: string;
  type: 'Documentation' | 'Interactive' | 'Video Course' | 'Practice';
  url: string;
  description: string;
}

const GET_SUGGESTIONS = (skillName: string): CuratedResource[] => {
  const name = skillName.toLowerCase();
  
  // Design / Creative / UI/UX
  if (
    name.includes('figma') ||
    name.includes('photoshop') ||
    name.includes('illustrator') ||
    name.includes('indesign') ||
    name.includes('premiere') ||
    name.includes('blender') ||
    name.includes('sketch') ||
    name.includes('canva') ||
    name.includes('ui/ux') ||
    name.includes('ui-ux') ||
    name.includes('design')
  ) {
    return [
      { name: 'Figma Learn Center', type: 'Interactive', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-Figma', description: 'Official Figma lessons, tutorials, and UI/UX design guides.' },
      { name: 'Adobe Help Center Tutorials', type: 'Documentation', url: 'https://helpx.adobe.com', description: 'Step-by-step guides for Photoshop, Illustrator, Premiere, and InDesign.' },
      { name: 'Behance & Dribbble Portfolio Inspiration', type: 'Practice', url: 'https://www.behance.net', description: 'Browse and analyze award-winning designs from creative professionals.' }
    ];
  }

  // Data Science & Analytics
  if (
    name.includes('pandas') ||
    name.includes('numpy') ||
    name.includes('tableau') ||
    name.includes('power bi') ||
    name.includes('powerbi') ||
    name.includes('excel') ||
    name.includes('data science') ||
    name.includes('data analysis') ||
    name.includes('matplotlib') ||
    name.includes('seaborn') ||
    name.includes('analytics')
  ) {
    return [
      { name: 'Kaggle Micro-Courses', type: 'Interactive', url: 'https://www.kaggle.com/learn', description: 'Hands-on interactive notebooks covering Pandas, Data Viz, and Machine Learning.' },
      { name: 'Pandas Official Tutorials', type: 'Documentation', url: 'https://pandas.pydata.org/docs/getting_started/index.html', description: 'Official starting guides for the Python data analysis library.' },
      { name: 'Mode SQL & Analytics Tutorial', type: 'Interactive', url: 'https://mode.com/resources/sql-tutorial/', description: 'Premium visual data analysis tutorials and business metrics guides.' }
    ];
  }

  // Cybersecurity
  if (
    name.includes('security') ||
    name.includes('hacking') ||
    name.includes('pentest') ||
    name.includes('penetration') ||
    name.includes('nmap') ||
    name.includes('kali') ||
    name.includes('burp') ||
    name.includes('owasp')
  ) {
    return [
      { name: 'TryHackMe Rooms', type: 'Interactive', url: 'https://tryhackme.com', description: 'Gamified, browser-based labs teaching network, system, and web security.' },
      { name: 'PortSwigger Web Security Academy', type: 'Interactive', url: 'https://portswigger.net/web-security', description: 'The absolute best interactive labs for web exploits (SQLi, XSS, CSRF).' },
      { name: 'OWASP Foundation Wiki', type: 'Documentation', url: 'https://owasp.org', description: 'Standard reference site documenting software vulnerabilities and security guidelines.' }
    ];
  }

  // Game Dev
  if (
    name.includes('unity') ||
    name.includes('unreal') ||
    name.includes('godot') ||
    name.includes('game dev') ||
    name.includes('game design') ||
    name.includes('game development')
  ) {
    return [
      { name: 'Unity Learn Portal', type: 'Interactive', url: 'https://learn.unity.com', description: 'Official guided game development paths with full assets and scripts.' },
      { name: 'Godot Engine Documentation', type: 'Documentation', url: 'https://docs.godotengine.org', description: 'Clear step-by-step introduction, scripting guides, and engine API specs.' },
      { name: 'Unreal Engine Learning', type: 'Video Course', url: 'https://dev.epicgames.com/community/learning', description: 'Official videos covering game logic, blueprints, materials, and lighting.' }
    ];
  }

  // Rust
  if (name === 'rust') {
    return [
      { name: 'The Rust Programming Language Book', type: 'Documentation', url: 'https://doc.rust-lang.org/book/', description: 'The official "Rust Book" teaching ownership, borrowing, and safety.' },
      { name: 'Rust by Example', type: 'Interactive', url: 'https://doc.rust-lang.org/rust-by-example/', description: 'Learn Rust syntax through runnable browser-based snippets.' },
      { name: 'Rustlings Repository Exercises', type: 'Practice', url: 'https://github.com/rust-lang/rustlings', description: 'Small compiler exercises to get comfortable reading and writing Rust.' }
    ];
  }

  // C++
  if (name === 'c++' || name.includes('cpp') || name.includes('c plus plus')) {
    return [
      { name: 'LearnCPP Tutorials', type: 'Documentation', url: 'https://www.learncpp.com', description: 'Clear, modern C++ tutorials from absolute beginner to advanced.' },
      { name: 'cppreference.com API Guide', type: 'Documentation', url: 'https://en.cppreference.com', description: 'Comprehensive standards reference for C++ containers, pointers, and STL.' },
      { name: 'freeCodeCamp C++ Complete Course', type: 'Video Course', url: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', description: '31-hour comprehensive video tutorial for C++ programming.' }
    ];
  }

  // Go / Golang
  if (name === 'go' || name === 'golang') {
    return [
      { name: 'A Tour of Go', type: 'Interactive', url: 'https://go.dev/tour/', description: 'Interactive browser-based introduction to syntax, slices, and goroutines.' },
      { name: 'Go by Example', type: 'Interactive', url: 'https://gobyexample.com', description: 'Hands-on introduction to Go programming using concise, annotated code examples.' },
      { name: 'Official Go Documentation', type: 'Documentation', url: 'https://go.dev/doc/', description: 'Standard packaging setup, guidelines, and core libraries.' }
    ];
  }

  // C#
  if (name === 'c#' || name === 'csharp') {
    return [
      { name: 'Microsoft C# Guides', type: 'Documentation', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/', description: 'Official documentation for C# programming on .NET.' },
      { name: 'C# Station Tutorials', type: 'Documentation', url: 'https://csharp-station.com', description: 'Well-organized tutorials covering basic structures and ADO.NET.' },
      { name: 'freeCodeCamp C# Course', type: 'Video Course', url: 'https://www.youtube.com/watch?v=GhQdlIFylQ8', description: 'Full beginner course on variables, arrays, and classes.' }
    ];
  }

  // Java
  if (name === 'java') {
    return [
      { name: 'Baeldung Java Guides', type: 'Documentation', url: 'https://www.baeldung.com', description: 'In-depth, practical Java and Spring framework tutorials.' },
      { name: 'Oracle Java Tutorials', type: 'Documentation', url: 'https://docs.oracle.com/javase/tutorial/', description: 'The official guides for learning core Java APIs and collections.' },
      { name: 'Java programming for Beginners (freeCodeCamp)', type: 'Video Course', url: 'https://www.youtube.com/watch?v=grEKMHGYyns', description: 'Comprehensive video course covering basic syntax to class definitions.' }
    ];
  }

  // React
  if (name.includes('react')) {
    return [
      { name: 'Official React Documentation', type: 'Documentation', url: 'https://react.dev', description: 'The official guides and API reference with interactive sandboxes.' },
      { name: 'Scrimba: Learn React for Free', type: 'Interactive', url: 'https://scrimba.com/learn/learnreact', description: 'Interactive screencast lessons where you can edit code directly.' },
      { name: 'freeCodeCamp React Course', type: 'Video Course', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', description: 'Comprehensive full course covering hooks, state, and components.' }
    ];
  }
  if (name.includes('python')) {
    return [
      { name: 'Official Python Documentation', type: 'Documentation', url: 'https://docs.python.org/3/', description: 'The definitive tutorial and library reference guides.' },
      { name: 'Real Python', type: 'Practice', url: 'https://realpython.com', description: 'High-quality, practical Python tutorials and step-by-step guides.' },
      { name: 'Python for Beginners (freeCodeCamp)', type: 'Video Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', description: 'Full course for complete beginners to programming.' }
    ];
  }
  if (name.includes('typescript')) {
    return [
      { name: 'TypeScript Handbook', type: 'Documentation', url: 'https://www.typescriptlang.org/docs/', description: 'The official guide to TypeScript language features and syntax.' },
      { name: 'Execute Program: TypeScript', type: 'Interactive', url: 'https://www.executeprogram.com/courses/typescript', description: 'Interactive code exercises with spaced repetition.' },
      { name: 'Total TypeScript (Matt Pocock)', type: 'Video Course', url: 'https://www.totaltypescript.com', description: 'The absolute best advanced tutorials and free workshops.' }
    ];
  }
  if (name.includes('node') || name.includes('express')) {
    return [
      { name: 'Node.js Learning Guides', type: 'Documentation', url: 'https://nodejs.org/en/learn', description: 'Official Node.js tutorials covering asynchronous design and servers.' },
      { name: 'The Odin Project: NodeJS', type: 'Interactive', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs', description: 'Project-based open-source full-stack path.' },
      { name: 'Node.js Tutorial (Mosh Hamedani)', type: 'Video Course', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', description: 'Excellent beginner crash course on core modules and npm.' }
    ];
  }
  if (name.includes('machine learning') || name.includes('ml') || name.includes('ai')) {
    return [
      { name: 'Coursera: Machine Learning Specialization', type: 'Video Course', url: 'https://www.coursera.org/specializations/machine-learning-introduction', description: 'The legendary course by Andrew Ng (DeepLearning.AI).' },
      { name: 'Kaggle Learn', type: 'Interactive', url: 'https://www.kaggle.com/learn', description: 'Hands-on micro-courses covering ML, pandas, and deep learning.' },
      { name: 'Fast.ai: Practical Deep Learning for Coders', type: 'Video Course', url: 'https://course.fast.ai', description: 'Top-tier top-down programming-first deep learning curriculum.' }
    ];
  }
  if (name.includes('docker') || name.includes('kubernetes')) {
    return [
      { name: 'Docker Curriculum', type: 'Interactive', url: 'https://docker-curriculum.com', description: 'A comprehensive hands-on tutorial for starting with containers.' },
      { name: 'Play with Kubernetes', type: 'Interactive', url: 'https://labs.play-with-k8s.com', description: 'Browser-based sandbox lab environments powered by Docker.' },
      { name: 'KodeKloud Tutorials', type: 'Video Course', url: 'https://kodekloud.com', description: 'Fantastic visual animations and interactive labs for DevOps.' }
    ];
  }
  if (name.includes('aws') || name.includes('cloud')) {
    return [
      { name: 'AWS Skill Builder', type: 'Interactive', url: 'https://skillbuilder.aws', description: 'Official free digital training courses designed by AWS experts.' },
      { name: 'A Cloud Guru / Pluralsight', type: 'Video Course', url: 'https://www.pluralsight.com/cloud-guru', description: 'The gold standard for cloud certifications and practice labs.' },
      { name: 'Stephane Maarek courses (Udemy)', type: 'Video Course', url: 'https://www.udemy.com/user/stephane-maarek/', description: 'Industry-favorite exam preparation courses for AWS.' }
    ];
  }
  if (name.includes('sql') || name.includes('database') || name.includes('postgres') || name.includes('mongo')) {
    return [
      { name: 'SQLBolt', type: 'Interactive', url: 'https://sqlbolt.com', description: 'Simple, interactive lessons with queries you run right in your browser.' },
      { name: 'PostgreSQL Tutorial', type: 'Documentation', url: 'https://www.postgresqltutorial.com', description: 'Clear, simple reference pages for learning Postgres syntax.' },
      { name: 'MongoDB University', type: 'Interactive', url: 'https://university.mongodb.com', description: 'Official interactive training and certification modules.' }
    ];
  }
  // Fallback for general skills
  return [
    { name: 'freeCodeCamp Catalog', type: 'Video Course', url: 'https://www.freecodecamp.org/learn', description: 'Thousands of hours of free interactive coding challenges and projects.' },
    { name: 'MDN Web Docs', type: 'Documentation', url: 'https://developer.mozilla.org', description: 'The ultimate documentation reference for all web technologies.' },
    { name: 'Roadmap.sh', type: 'Documentation', url: 'https://roadmap.sh', description: 'Community-curated developer learning paths and recommendations.' }
  ];
};

export function Roadmap() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await api.get(`/roadmaps/${id}`);
        setData(res.data.data);
      } catch (err) {
        showToast('error', 'Fetch Failed', 'Failed to retrieve roadmap steps');
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, [id, showToast]);

  if (loading) {
    return (
      <AppShell title="Roadmap">
        <div className="flex h-[60vh] items-center justify-center">
          <CircleNotch size={36} className="animate-spin text-accent-violet" />
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Error">
        <div className="text-center py-16">
          <p className="text-gray-400">Roadmap not found.</p>
          <GlassButton onClick={() => navigate('/dashboard')} variant="secondary" className="mt-4">
            Go to Dashboard
          </GlassButton>
        </div>
      </AppShell>
    );
  }

  const { roadmap, masteryScore } = data;
  const phases = roadmap.phases;

  return (
    <AppShell title={`${roadmap.skill.name} Roadmap`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Back to Dashboard</span>
        </div>

        {/* Skill Details Banner */}
        <GlassCard className="p-6 md:p-8 relative overflow-hidden bg-glass-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <GlassBadge variant="violet" size="sm">
                {roadmap.skill.category}
              </GlassBadge>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                {roadmap.skill.name}
              </h2>
              <p className="text-sm text-gray-400 max-w-2xl">
                {roadmap.skill.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span>Duration: {roadmap.estimatedWeeks} Weeks</span>
                <span>•</span>
                <span>Phases: {phases.length}</span>
              </div>
              {data.status === 'COMPLETED' && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowCertificate(true)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-accent-violet to-accent-indigo text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_28px_rgba(79,70,229,0.55)] hover:scale-105"
                >
                  <Medal size={16} weight="fill" />
                  View My Certificate
                </motion.button>
              )}
            </div>
            
            {/* Mastery Score Progress */}
            <div className="glass-panel p-4 flex flex-col items-center justify-center text-center shrink-0 w-36">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                Overall Mastery
              </span>
              <span className="text-3xl font-display font-extrabold text-glow-violet text-white">
                {Math.round(masteryScore)}%
              </span>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-accent-violet h-full rounded-full transition-all duration-500"
                  style={{ width: `${masteryScore}%` }}
                />
              </div>
              {data.status === 'COMPLETED' && (
                <GlassBadge variant="success" size="sm" className="mt-2">Completed</GlassBadge>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Certificate Modal */}
        <Certificate
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          recipientName={user?.name ?? 'Learner'}
          skillName={roadmap.skill.name}
          skillCategory={roadmap.skill.category}
          completionDate={new Date().toISOString()}
          masteryScore={Math.round(masteryScore)}
          enrollmentId={data.id}
        />

        {/* Curated Recommendations Card */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-accent-violet animate-pulse" />
            <h3 className="text-base font-semibold text-white font-display">Where to Learn: Curated Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GET_SUGGESTIONS(roadmap.skill.name).map((resource, i) => (
              <div key={i} className="glass-panel p-4 flex flex-col justify-between hover:bg-white/5 border-white/5 hover:border-accent-violet/20 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-violet">
                      {resource.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1.5">{resource.name}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{resource.description}</p>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-xs font-semibold text-white bg-accent-violet/15 hover:bg-accent-violet/30 border border-accent-violet/20 hover:border-accent-violet/40 px-3.5 py-2 rounded-xl transition-all w-full text-center"
                >
                  Visit Resource
                </a>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Phases vertical timeline */}
        <div className="relative border-l border-white/5 ml-4 md:ml-6 space-y-12 pb-12">
          {phases.map((phase, idx) => {
            // Unlocked condition: index === 0 or previous phase status is PASSED
            const isPreviousPassed = idx === 0 || phases[idx - 1].status === 'PASSED';
            const isUnlocked = isPreviousPassed;
            
            const isPhaseCompleted = phase.status === 'PASSED';
            
            // Check if all concepts inside the phase are complete to enable Phase Assessments
            const allConceptsFinished = phase.concepts.every(c => c.status === 'PASSED' || c.status === 'EXCELLENT');

            return (
              <div key={phase.id} className="relative pl-6 md:pl-10">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-3.5 md:-left-4.5 w-7 h-7 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-all ${
                    isPhaseCompleted
                      ? 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : isUnlocked
                      ? 'bg-accent-violet/20 border-accent-violet text-accent-violet shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'bg-dark-800 border-white/5 text-gray-600'
                  }`}
                >
                  {isPhaseCompleted ? (
                    <CheckCircle size={16} weight="fill" />
                  ) : isUnlocked ? (
                    <span className="text-xs font-bold font-display">{phase.order}</span>
                  ) : (
                    <Lock size={14} />
                  )}
                </div>

                {/* Phase Card */}
                <GlassCard
                  className={`p-6 ${!isUnlocked ? 'opacity-50 pointer-events-none' : ''} ${
                    isPhaseCompleted ? 'border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : ''
                  }`}
                  glow={isUnlocked && !isPhaseCompleted}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
                          Phase {phase.order}
                        </span>
                        <GlassBadge variant={isPhaseCompleted ? 'success' : isUnlocked ? 'violet' : 'locked'} size="sm">
                          {phase.status.replace('_', ' ')}
                        </GlassBadge>
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-xl">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* List of Concepts */}
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Concepts Matrix
                    </h4>
                    {phase.concepts.map((concept) => (
                      <div
                        key={concept.id}
                        onClick={() => navigate(`/roadmap/${id}/concept/${concept.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg border transition-all ${
                            concept.status === 'PASSED' || concept.status === 'EXCELLENT'
                              ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}>
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-accent-violet transition-colors">
                              {concept.title}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Estimated study: {concept.estimatedMinutes}m
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <GlassBadge variant={
                            concept.status === 'PASSED' || concept.status === 'EXCELLENT' ? 'success' : 'default'
                          } size="sm">
                            {concept.status.replace('_', ' ')}
                          </GlassBadge>
                          <Play size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Phase exit assessments */}
                  <div className="border-t border-white/5 mt-5 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Phase Exit Desk
                      </h4>
                      {!allConceptsFinished && (
                        <span className="text-[10px] text-accent-rose font-medium">
                          Complete all concepts above to unlock phase exam
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Phase Exam Button */}
                      <div className="glass-panel p-3.5 flex flex-col justify-between items-start">
                        <div className="flex items-center gap-2 text-white">
                          <ExamIcon size={18} className="text-accent-violet" />
                          <span className="text-xs font-semibold">Exit Examination</span>
                        </div>
                        {phase.examScore !== null && (
                          <span className="text-[11px] text-gray-400 mt-1">
                            Best score: <span className="text-white font-medium">{phase.examScore}%</span>
                          </span>
                        )}
                        <GlassButton
                          onClick={() => navigate(`/learn/exam/${phase.id}`)}
                          variant="secondary"
                          size="sm"
                          disabled={!allConceptsFinished}
                          className="mt-3 w-full"
                        >
                          {phase.examScore !== null ? 'Re-take' : 'Take Exam'}
                        </GlassButton>
                      </div>

                      {/* Project Submission Button */}
                      <div className="glass-panel p-3.5 flex flex-col justify-between items-start">
                        <div className="flex items-center gap-2 text-white">
                          <CodeBlock size={18} className="text-accent-indigo" />
                          <span className="text-xs font-semibold">Practical Project</span>
                        </div>
                        {phase.projectScore !== null && (
                          <span className="text-[11px] text-gray-400 mt-1">
                            Best score: <span className="text-white font-medium">{phase.projectScore}%</span>
                          </span>
                        )}
                        <GlassButton
                          onClick={() => navigate(`/learn/project/${phase.id}`)}
                          variant="secondary"
                          size="sm"
                          disabled={!allConceptsFinished}
                          className="mt-3 w-full"
                        >
                          {phase.projectStatus === 'SCORED' ? 'View Details' : 'Submit Repo'}
                        </GlassButton>
                      </div>

                      {/* Viva Oral Button */}
                      <div className="glass-panel p-3.5 flex flex-col justify-between items-start">
                        <div className="flex items-center gap-2 text-white">
                          <Microphone size={18} className="text-accent-emerald" />
                          <span className="text-xs font-semibold">AI Viva Session</span>
                        </div>
                        {phase.vivaScore !== null && (
                          <span className="text-[11px] text-gray-400 mt-1">
                            Viva Score: <span className="text-white font-medium">{phase.vivaScore}%</span>
                          </span>
                        )}
                        <GlassButton
                          onClick={() => navigate(`/learn/viva/${phase.id}`)}
                          variant="secondary"
                          size="sm"
                          disabled={!allConceptsFinished}
                          className="mt-3 w-full"
                        >
                          {phase.vivaScore !== null ? 'Start Viva' : 'Start Session'}
                        </GlassButton>
                      </div>
                    </div>
                  </div>

                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Course Completion Certificate */}
        <GlassCard className="p-6 md:p-8 text-center relative overflow-hidden bg-glass-glow border-accent-violet/20 mt-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/5 rounded-full blur-3xl -z-10" />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center mx-auto text-accent-violet shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Medal size={32} weight={data.status === 'COMPLETED' ? 'fill' : 'regular'} className="animate-float" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">
                Course Completion Certificate
              </h3>
              {data.status === 'COMPLETED' ? (
                <p className="text-sm text-gray-300">
                  Congratulations! You have successfully completed all phases of the <strong>{roadmap.skill.name}</strong> course. You can now generate and print your official certificate of completion.
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  Earn your official certificate of completion for <strong>{roadmap.skill.name}</strong>. Complete all phases, exams, projects, and viva sessions to unlock it.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <GlassButton
                onClick={() => setShowCertificate(true)}
                disabled={data.status !== 'COMPLETED'}
                variant={data.status === 'COMPLETED' ? 'primary' : 'secondary'}
                className={`flex items-center gap-2 px-8 py-3 font-semibold transition-all ${
                  data.status === 'COMPLETED'
                    ? 'bg-gradient-to-r from-accent-violet to-accent-indigo text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_28px_rgba(79,70,229,0.55)] hover:scale-105 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed border-white/5 bg-white/5 text-gray-500'
                }`}
              >
                {data.status === 'COMPLETED' ? (
                  <>
                    <Medal size={18} weight="fill" />
                    Generate Certificate
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Generate Certificate (Locked)
                  </>
                )}
              </GlassButton>
            </div>
            {data.status !== 'COMPLETED' && (
              <div className="text-xs text-gray-500 mt-2">
                Current progress: {Math.round(masteryScore)}%
              </div>
            )}
          </div>
        </GlassCard>

      </div>
    </AppShell>
  );
}
