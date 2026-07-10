import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightning, Brain, Target, Rocket, CheckCircle, ArrowRight, MagnifyingGlass } from '@phosphor-icons/react';
import { POPULAR_SKILLS } from '@learnflow/shared';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassInput } from '../components/ui/GlassInput';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';
import { useAuthStore } from '../stores/auth.store';

const STEPS = [
  { id: 1, title: 'Your Goal', subtitle: 'What skill do you want to master first?', icon: <Target size={28} weight="duotone" /> },
  { id: 2, title: 'Your Level', subtitle: 'How would you describe your current experience?', icon: <Brain size={28} weight="duotone" /> },
  { id: 3, title: 'Daily Commitment', subtitle: 'How many minutes can you study daily?', icon: <Lightning size={28} weight="duotone" /> },
  { id: 4, title: 'Generating Roadmap', subtitle: 'Building your personalized learning path…', icon: <Rocket size={28} weight="duotone" /> },
];

const LEVELS = ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced'];
const GOALS = [15, 30, 45, 60, 90];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [dailyGoal, setDailyGoal] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const handleGenerate = async () => {
    setStep(3);
    setIsGenerating(true);
    try {
      const res = await api.post('/roadmaps/generate', { skillName: selectedSkill });
      const roadmapId = res.data.data.id;
      await new Promise((r) => setTimeout(r, 1500)); // visual delay
      
      if (isAuthenticated) {
        showToast('success', 'Roadmap Ready! 🎉', `Your ${selectedSkill} learning path is ready`);
        navigate(`/roadmap/${roadmapId}`);
      } else {
        localStorage.setItem('pending_roadmap_id', roadmapId);
        showToast('info', 'Roadmap Generated! 🚀', 'Create an account to view your personalized path');
        navigate('/auth/register');
      }
    } catch {
      showToast('error', 'Generation failed', 'Using a demo roadmap instead');
      await new Promise((r) => setTimeout(r, 1500));
      navigate('/dashboard');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-page-gradient -z-10" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-accent-violet' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 glass-panel rounded-2xl mb-4 text-accent-violet">
                {STEPS[step].icon}
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-1">{STEPS[step].title}</h2>
              <p className="text-gray-400">{STEPS[step].subtitle}</p>
            </div>

            {/* Step 0: Pick skill */}
            {step === 0 && (
              <GlassCard className="p-6 space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setIsSearchingCustom(false);
                      }}
                      className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                        selectedSkill === skill && !isSearchingCustom
                          ? 'border-accent-violet bg-accent-violet/20 text-accent-violet'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  
                  {/* Search Custom Button */}
                  <button
                    onClick={() => {
                      setIsSearchingCustom(true);
                      setSelectedSkill(customSkill);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      isSearchingCustom
                        ? 'border-accent-indigo bg-accent-indigo/20 text-accent-indigo'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <MagnifyingGlass size={14} />
                    Custom
                  </button>
                </div>

                {isSearchingCustom && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassInput
                      placeholder="Type any skill (e.g. C++, Java, Photoshop)..."
                      value={customSkill}
                      onChange={(e) => {
                        setCustomSkill(e.target.value);
                        setSelectedSkill(e.target.value);
                      }}
                    />
                  </motion.div>
                )}

                <GlassButton
                  className="w-full mt-2"
                  disabled={!selectedSkill.trim()}
                  onClick={() => setStep(1)}
                  icon={<ArrowRight size={18} />}
                >
                  Continue
                </GlassButton>
              </GlassCard>
            )}

            {/* Step 1: Pick level */}
            {step === 1 && (
              <GlassCard className="p-6 space-y-3">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full p-4 rounded-xl text-left text-sm font-medium border transition-all ${
                      selectedLevel === level
                        ? 'border-accent-violet bg-accent-violet/20 text-accent-violet'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {selectedLevel === level && <CheckCircle className="inline mr-2" size={16} weight="fill" />}
                    {level}
                  </button>
                ))}
                <GlassButton
                  className="w-full mt-2"
                  disabled={!selectedLevel}
                  onClick={() => setStep(2)}
                  icon={<ArrowRight size={18} />}
                >
                  Continue
                </GlassButton>
              </GlassCard>
            )}

            {/* Step 2: Pick daily goal */}
            {step === 2 && (
              <GlassCard className="p-6">
                <div className="flex gap-3 justify-center flex-wrap mb-6">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setDailyGoal(g)}
                      className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        dailyGoal === g
                          ? 'border-accent-violet bg-accent-violet/20 text-accent-violet'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {g} min
                    </button>
                  ))}
                </div>
                <div className="text-center mb-5">
                  <GlassBadge variant="violet">Selected skill: {selectedSkill}</GlassBadge>
                </div>
                <GlassButton className="w-full" onClick={handleGenerate} icon={<Rocket size={18} />}>
                  Generate My Roadmap
                </GlassButton>
              </GlassCard>
            )}

            {/* Step 3: Generating */}
            {step === 3 && (
              <GlassCard className="p-10 text-center" glow>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-2 border-white/10 border-t-accent-violet mx-auto mb-6"
                />
                <p className="text-white font-semibold mb-2">Generating your {selectedSkill} roadmap…</p>
                <p className="text-gray-500 text-sm">AI is crafting phases, concepts, and quizzes for you</p>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
