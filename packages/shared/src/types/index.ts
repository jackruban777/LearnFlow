// ─────────────────────────────────────────────
// Enums / Union Types
// ─────────────────────────────────────────────

export type Role = 'LEARNER' | 'ADMIN' | 'MENTOR';

export type Plan = 'FREE' | 'PRO' | 'TEAM';

export type RoadmapStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export type ProgressStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'EXCELLENT'
  | 'FAILED';

export type QuestionType = 'MCQ' | 'SCENARIO' | 'CODE_ANALYSIS' | 'PRACTICAL';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuizResult = 'EXCELLENT' | 'PASS' | 'FAIL';

export type ProjectStatus = 'PENDING' | 'EVALUATING' | 'SCORED' | 'FAILED';

export type NotificationType =
  | 'STREAK_REMINDER'
  | 'PHASE_UNLOCKED'
  | 'QUIZ_RESULT'
  | 'PROJECT_SCORED'
  | 'CERTIFICATE_EARNED'
  | 'WEEKLY_DIGEST'
  | 'LEVEL_UP'
  | 'MENTOR_MESSAGE'
  | 'ROADMAP_READY'
  | 'VIVA_SCHEDULED'
  | 'STREAK_AT_RISK'
  | 'ACHIEVEMENT_UNLOCKED';

// ─────────────────────────────────────────────
// Domain Model Interfaces
// ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  avatarUrl: string | null;
  role: Role;
  plan: Plan;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  streakFreezeCount: number;
  interviewReadinessScore: number;
  dailyGoalTarget: number;
  dailyGoalProgress: number;
  totalCerts: number;
  totalProjects: number;
  emailVerified: boolean;
  emailVerifyToken: string | null;
  passwordResetOtp: string | null;
  passwordResetExpiry: Date | null;
  notifStreak: boolean;
  notifPhaseUnlock: boolean;
  notifWeeklyDigest: boolean;
  notifProjectScored: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Roadmap {
  id: string;
  userId: string;
  skillName: string;
  status: RoadmapStatus;
  totalPhases: number;
  completedPhases: number;
  masteryScore: number;
  generatedAt: Date;
  updatedAt: Date;
}

export interface Phase {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  status: ProgressStatus;
  examScore: number | null;
  examAttempts: number;
  projectStatus: ProjectStatus | null;
  projectScore: number | null;
  vivaScore: number | null;
  masteryScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Concept {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: ProgressStatus;
  quizScore: number | null;
  quizAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  conceptId: string | null;
  phaseId: string | null;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  codeSnippet: string | null;
  createdAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  conceptId: string | null;
  phaseId: string | null;
  score: number;
  totalQuestions: number;
  correctCount: number;
  result: QuizResult;
  xpAwarded: number;
  timeTakenSeconds: number;
  answersJson: Record<string, string>;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  roadmapId: string;
  skillName: string;
  masteryScore: number;
  issuedAt: Date;
  certificateUrl: string | null;
  verificationCode: string;
}

export interface MentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  contextSkillId: string | null;
  tokensUsed: number | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Dashboard / Leaderboard
// ─────────────────────────────────────────────

export interface DashboardStats {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezeCount: number;
  totalCerts: number;
  totalProjects: number;
  activeSkills: number;
  interviewReadinessScore: number;
  dailyGoalProgress: number;
  dailyGoalTarget: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  certCount: number;
  weeklyXp: number;
}

// ─────────────────────────────────────────────
// AI Generation Result Interfaces
// ─────────────────────────────────────────────

export interface RoadmapConceptData {
  title: string;
  description: string;
  content: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  order: number;
}

export interface RoadmapPhaseData {
  title: string;
  description: string;
  order: number;
  concepts: RoadmapConceptData[];
}

export interface RoadmapGenerationResult {
  skillName: string;
  totalPhases: number;
  phases: RoadmapPhaseData[];
  overview: string;
  prerequisites: string[];
  targetAudience: string;
  estimatedWeeks: number;
}

export interface QuestionGenerationResult {
  questions: {
    text: string;
    type: QuestionType;
    difficulty: Difficulty;
    options: string[] | null;
    correctAnswer: string;
    explanation: string;
    codeSnippet: string | null;
  }[];
}

export interface ProjectEvaluationResult {
  overallScore: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  scores: {
    codeQuality: number;
    functionality: number;
    documentation: number;
    bestPractices: number;
    creativity: number;
  };
  xpAwarded: number;
}

export interface VivaQuestion {
  question: string;
  expectedKeyPoints: string[];
  difficulty: Difficulty;
}

export interface VivaResult {
  overallScore: number;
  passed: boolean;
  feedback: string;
  questionScores: {
    questionIndex: number;
    score: number;
    feedback: string;
  }[];
  xpAwarded: number;
  interviewReadinessDelta: number;
}

export interface RecoveryPlanStep {
  conceptTitle: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedMinutes: number;
}

export interface RecoveryPlan {
  summary: string;
  weakAreas: string[];
  steps: RecoveryPlanStep[];
  estimatedRecoveryDays: number;
  encouragement: string;
}

// ─────────────────────────────────────────────
// Generic API Response Wrappers
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─────────────────────────────────────────────
// Additional Domain Models
// ─────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  iconUrl: string | null;
  popularity: number;
  createdAt: Date;
}

export interface ConceptProgress {
  id: string;
  userId: string;
  conceptId: string;
  status: ProgressStatus;
  lastAttemptAt: Date | null;
  bestQuizScore: number | null;
  attemptCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  phaseId: string;
  repoUrl: string;
  description: string | null;
  techStack: string[];
  screenshotUrls: string[];
  status: ProjectStatus;
  evaluation: unknown | null;
  totalScore: number | null;
  passed: boolean | null;
  submittedAt: Date;
  evaluatedAt: Date | null;
}

export interface VivaSession {
  id: string;
  userId: string;
  phaseId: string;
  turns: any;
  totalScore: number | null;
  passed: boolean | null;
  startedAt: Date;
  completedAt: Date | null;
}
