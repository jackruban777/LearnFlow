import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlass, ArrowRight, CircleNotch, Sparkle } from '@phosphor-icons/react';
import { POPULAR_SKILLS, SKILL_CATEGORIES } from '@learnflow/shared';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';

const SKILL_ICONS: Record<string, string> = {
  // Frontend
  'JavaScript': '🟨', 'TypeScript': '🔷', 'React': '⚛️', 'Vue.js': '💚',
  'Next.js': '▲', 'HTML': '🌐', 'CSS': '🎨',
  // Backend & Languages
  'Node.js': '🟢', 'Python': '🐍', 'Java': '☕', 'Go': '🔵',
  'Rust': '🦀', 'C++': '⚡', 'C#': '💜', 'FastAPI': '🚀', 'Django': '🎯',
  // Mobile
  'Flutter': '💙', 'Swift': '🍎', 'Kotlin': '🟣',
  // DevOps
  'Docker': '🐳', 'Kubernetes': '⚙️', 'AWS': '☁️', 'Linux': '🐧',
  // Databases
  'SQL': '🗄️', 'MongoDB': '🍃', 'Redis': '🔴', 'PostgreSQL': '🐘', 'GraphQL': '◈',
  // AI / Data
  'Machine Learning': '🤖', 'Data Science': '📊',
  // Design
  'Figma': '🖌️',
};

const MOCK_LEARNER_COUNTS: Record<string, number> = {
  // Frontend
  'JavaScript': 98400, 'TypeScript': 31890, 'React': 48210, 'Vue.js': 19200,
  'Next.js': 22300, 'HTML': 112000, 'CSS': 87500,
  // Backend & Languages
  'Node.js': 29100, 'Python': 72305, 'Java': 64800, 'Go': 15200,
  'Rust': 9100, 'C++': 38700, 'C#': 27400, 'FastAPI': 11200, 'Django': 18900,
  // Mobile
  'Flutter': 14600, 'Swift': 12800, 'Kotlin': 11400,
  // DevOps
  'Docker': 18650, 'Kubernetes': 10300, 'AWS': 21750, 'Linux': 41200,
  // Databases
  'SQL': 34200, 'MongoDB': 16800, 'Redis': 9900, 'PostgreSQL': 13500, 'GraphQL': 8700,
  // AI / Data
  'Machine Learning': 25400, 'Data Science': 19600,
  // Design
  'Figma': 22100,
};

/** Maps every skill to one of the SKILL_CATEGORIES values */
const SKILL_CATEGORY_MAP: Record<string, string> = {
  // Frontend
  'JavaScript': 'Frontend', 'TypeScript': 'Frontend', 'React': 'Frontend',
  'Vue.js': 'Frontend', 'Next.js': 'Frontend', 'HTML': 'Frontend', 'CSS': 'Frontend',
  // Backend
  'Node.js': 'Backend', 'Python': 'Backend', 'FastAPI': 'Backend', 'Django': 'Backend',
  // Languages
  'Java': 'Languages', 'Go': 'Languages', 'Rust': 'Languages', 'C++': 'Languages', 'C#': 'Languages',
  // Mobile
  'Flutter': 'Mobile', 'Swift': 'Mobile', 'Kotlin': 'Mobile',
  // DevOps
  'Docker': 'DevOps', 'Kubernetes': 'DevOps', 'Linux': 'DevOps',
  // Cloud
  'AWS': 'Cloud',
  // Database
  'SQL': 'Database', 'MongoDB': 'Database', 'Redis': 'Database',
  'PostgreSQL': 'Database', 'GraphQL': 'Database',
  // AI/ML
  'Machine Learning': 'AI/ML',
  // Data Science
  'Data Science': 'Data Science',
  // Design
  'Figma': 'Design',
};

export function Explore() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [generatingSkill, setGeneratingSkill] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const filtered = POPULAR_SKILLS.filter((s) => {
    const matchSearch = s.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory ? SKILL_CATEGORY_MAP[s] === activeCategory : true;
    return matchSearch && matchCategory;
  });

  const handleSelectSkill = async (skill: string) => {
    setGeneratingSkill(skill);
    try {
      const res = await api.post('/roadmaps/generate', { skillName: skill });
      const id = res.data.data.id ?? 'demo';
      showToast('success', `${skill} Roadmap Ready!`, 'Your AI learning path has been created');
      navigate(`/roadmap/${id}`);
    } catch {
      showToast('error', 'Failed to generate', 'Please try again');
    } finally {
      setGeneratingSkill(null);
    }
  };

  return (
    <AppShell title="Explore Skills">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassInput
            placeholder="Search for any skill…"
            icon={<MagnifyingGlass size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${!activeCategory ? 'border-accent-violet bg-accent-violet/20 text-accent-violet' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            All
          </button>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? 'border-accent-violet bg-accent-violet/20 text-accent-violet' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((skill, i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard
                className="p-5 cursor-pointer relative overflow-hidden"
                hover
                onClick={() => handleSelectSkill(skill)}
              >
                {generatingSkill === skill && (
                  <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                    <CircleNotch size={24} className="animate-spin text-accent-violet" />
                  </div>
                )}
                <div className="text-3xl mb-3">{SKILL_ICONS[skill] ?? '📚'}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{skill}</h3>
                {MOCK_LEARNER_COUNTS[skill] && (
                  <p className="text-xs text-gray-500">{(MOCK_LEARNER_COUNTS[skill] / 1000).toFixed(1)}k learners</p>
                )}
                <div className="absolute top-3 right-3">
                  <GlassBadge variant="violet" size="sm">
                    <ArrowRight size={10} />
                  </GlassBadge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 space-y-4 flex flex-col items-center justify-center">
            <div className="text-4xl mb-1">🔍</div>
            <p>No skills found{activeCategory ? ` in "${activeCategory}"` : ''}{search ? ` for "${search}"` : ''}</p>
            {search && (
              <GlassButton
                onClick={() => handleSelectSkill(search)}
                className="mt-2"
                icon={<ArrowRight size={18} />}
              >
                Generate Roadmap for "{search}"
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
