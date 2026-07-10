import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lightning,
  Brain,
  Trophy,
  ChartLineUp,
  ArrowRight,
  CheckCircle,
  Star,
  GraduationCap,
} from '@phosphor-icons/react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { POPULAR_SKILLS } from '@learnflow/shared';

const FEATURES = [
  { icon: <Brain size={28} weight="duotone" />, title: 'AI-Generated Roadmaps', desc: 'Get a personalized, expert-curated learning path for any skill in seconds.' },
  { icon: <Lightning size={28} weight="duotone" />, title: 'Adaptive Quizzes & Viva', desc: 'Adaptive assessments that identify knowledge gaps and build real mastery.' },
  { icon: <Trophy size={28} weight="duotone" />, title: 'Gamified Progress', desc: 'Earn XP, maintain streaks, and climb leaderboards as you master skills.' },
  { icon: <ChartLineUp size={28} weight="duotone" />, title: 'Interview Readiness', desc: 'Track your interview readiness score as you complete phases and projects.' },
];

const SKILL_ICONS: Record<string, string> = {
  'React': '⚛️', 'Python': '🐍', 'Node.js': '🟢', 'TypeScript': '🔷', 'Machine Learning': '🤖',
  'Docker': '🐳', 'AWS': '☁️', 'GraphQL': '◈', 'Vue.js': '💚', 'Go': '🔵',
  'Rust': '🦀', 'Flutter': '💙', 'Swift': '🍎', 'Kotlin': '🟣', 'SQL': '🗄️',
  'MongoDB': '🍃', 'Redis': '🔴', 'Kubernetes': '⚙️', 'Next.js': '▲', 'FastAPI': '⚡',
};

export function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-page-gradient -z-10" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl animate-pulse-slow -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-indigo/10 rounded-full blur-3xl animate-pulse-slow -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-800/50 backdrop-blur-glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-violet flex items-center justify-center">
            <GraduationCap size={16} weight="fill" className="text-white" />
          </div>
          <span className="font-display font-bold text-white">LearnFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth/login">
            <GlassButton variant="secondary" size="sm">Sign In</GlassButton>
          </Link>
          <Link to="/auth/register">
            <GlassButton size="sm">Get Started Free</GlassButton>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-8 text-xs text-gray-300 border-accent-violet/20">
            <Star size={14} weight="fill" className="text-amber-400" />
            AI-Powered Skill Mastery Platform
          </motion.div>
          <motion.h1 variants={itemVariants} className="font-display font-bold text-5xl md:text-7xl text-white mb-6 leading-tight">
            Master Any Skill{' '}
            <span className="text-glow-violet bg-gradient-to-r from-accent-violet to-accent-indigo bg-clip-text text-transparent">
              with AI
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get personalized AI-generated roadmaps, adaptive quizzes, oral viva exams, and
            project evaluations — all in one platform designed to build real mastery.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <GlassButton size="lg" icon={<ArrowRight size={20} />}>
                Start Learning Free
              </GlassButton>
            </Link>
            <Link to="/explore">
              <GlassButton variant="secondary" size="lg">
                Browse Skills
              </GlassButton>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            {['No credit card required', 'Free forever plan', '30+ skills available'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Skills grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-display font-bold text-white text-center mb-10"
          >
            30+ Skills Ready to Master
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3"
          >
            {POPULAR_SKILLS.map((skill, i) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-3 text-center" hover>
                  <div className="text-2xl mb-1">{SKILL_ICONS[skill] ?? '📚'}</div>
                  <p className="text-[10px] text-gray-400 truncate">{skill}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-white text-center mb-14"
          >
            Everything you need to truly master a skill
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6" hover>
                  <div className="text-accent-violet mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <GlassCard className="p-12 bg-aurora-glow" glow>
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Ready to level up?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of learners mastering skills with AI-powered guidance.
            </p>
            <Link to="/auth/register">
              <GlassButton size="lg" icon={<ArrowRight size={20} />}>
                Create Your Free Account
              </GlassButton>
            </Link>
          </GlassCard>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        © 2025 LearnFlow. Built for learners who mean business.
      </footer>
    </div>
  );
}
