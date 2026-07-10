// ─────────────────────────────────────────────
// XP Awards
// ─────────────────────────────────────────────

export const XP_AWARDS = {
  conceptQuizPass: 50,
  conceptQuizExcellent: 75,
  phaseExamPass: 200,
  phaseExamPerfect: 350,
  projectSubmit: 100,
  projectPassed: 300,
  vivaCompleted: 150,
  certEarned: 500,
  dailyLogin: 25,
  streakMilestone7: 100,
  streakMilestone30: 500,
} as const;

// ─────────────────────────────────────────────
// Level Progression (50 levels, 1.35x scaling)
// ─────────────────────────────────────────────

export const LEVELS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: Math.floor(100 * Math.pow(1.35, i)),
}));

// ─────────────────────────────────────────────
// Plan Feature Limits  (-1 = unlimited)
// ─────────────────────────────────────────────

export const PLAN_LIMITS = {
  guest: {
    maxRoadmaps: 1,
    maxSkills: 0,
    quizAttemptsPerDay: 3,
    mentorMessagesPerDay: 0,
    roadmapGenerationsPerHour: 1,
  },
  FREE: {
    maxRoadmaps: 5,
    maxSkills: 3,
    quizAttemptsPerDay: -1,
    mentorMessagesPerDay: 10,
    roadmapGenerationsPerDay: 5,
  },
  PRO: {
    maxRoadmaps: -1,
    maxSkills: -1,
    quizAttemptsPerDay: -1,
    mentorMessagesPerDay: -1,
    roadmapGenerationsPerDay: -1,
  },
  TEAM: {
    maxRoadmaps: -1,
    maxSkills: -1,
    quizAttemptsPerDay: -1,
    mentorMessagesPerDay: -1,
    roadmapGenerationsPerDay: -1,
  },
} as const;

// ─────────────────────────────────────────────
// Mastery Score Weights (must sum to 1.0)
// ─────────────────────────────────────────────

export const MASTERY_WEIGHTS = {
  knowledge: 0.20,
  practical: 0.25,
  exam: 0.25,
  project: 0.20,
  viva: 0.10,
} as const;

// ─────────────────────────────────────────────
// Popular Skills & Categories
// ─────────────────────────────────────────────

export const POPULAR_SKILLS = [
  // Web Frontend
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Next.js', 'HTML', 'CSS',
  // Backend & Languages
  'Node.js', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'FastAPI', 'Django',
  // Mobile
  'Flutter', 'Swift', 'Kotlin',
  // DevOps & Cloud
  'Docker', 'Kubernetes', 'AWS', 'Linux',
  // Databases
  'SQL', 'MongoDB', 'Redis', 'PostgreSQL', 'GraphQL',
  // AI / Data
  'Machine Learning', 'Data Science',
  // Design
  'Figma',
] as const;

export const SKILL_CATEGORIES = [
  'Frontend', 'Backend', 'DevOps', 'Mobile', 'AI/ML',
  'Database', 'Security', 'Cloud', 'Languages', 'Design', 'Data Science',
] as const;

// ─────────────────────────────────────────────
// Streak & Quiz Thresholds
// ─────────────────────────────────────────────

export const QUIZ_PASS_THRESHOLD = 70;       // % score to pass
export const QUIZ_EXCELLENT_THRESHOLD = 90;  // % score for excellent
export const EXAM_PASS_THRESHOLD = 70;
export const EXAM_PERFECT_THRESHOLD = 95;
export const PROJECT_PASS_THRESHOLD = 65;
export const VIVA_PASS_THRESHOLD = 60;

export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365] as const;

export const MAX_EXAM_ATTEMPTS = 3;
export const EXAM_COOLDOWN_HOURS = 24;
export const MAX_STREAK_FREEZE = 3;
export const STREAK_FREEZE_COST_XP = 200;

// ─────────────────────────────────────────────
// Interview Readiness Score Bounds
// ─────────────────────────────────────────────

export const INTERVIEW_READINESS = {
  min: 0,
  max: 100,
  vivaPassDelta: 5,
  vivaExcellentDelta: 10,
  vivaFailDelta: -3,
  certEarnedDelta: 15,
  projectPassedDelta: 8,
} as const;

// ─────────────────────────────────────────────
// Pagination Defaults
// ─────────────────────────────────────────────

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;
