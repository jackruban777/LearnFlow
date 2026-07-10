import { 
  User, Skill, Roadmap, Phase, Concept, ConceptProgress, Question,
  QuizAttempt, Certificate, MentorMessage, Notification, Project, 
  VivaSession, ProgressStatus, ProjectStatus, QuizResult
} from '@learnflow/shared';

// In-memory data store
class MockDatabase {
  users: User[] = [];
  skills: Skill[] = [
    {
      id: 'skill-react',
      name: 'React',
      slug: 'react',
      category: 'Frontend',
      description: 'A JavaScript library for building user interfaces',
      iconUrl: null,
      popularity: 1250,
      createdAt: new Date(),
    },
    {
      id: 'skill-python',
      name: 'Python',
      slug: 'python',
      category: 'AI/ML',
      description: 'A high-level general-purpose programming language',
      iconUrl: null,
      popularity: 1540,
      createdAt: new Date(),
    },
    {
      id: 'skill-nodejs',
      name: 'Node.js',
      slug: 'nodejs',
      category: 'Backend',
      description: 'A JavaScript runtime built on Chrome\'s V8 engine',
      iconUrl: null,
      popularity: 980,
      createdAt: new Date(),
    },
    {
      id: 'skill-typescript',
      name: 'TypeScript',
      slug: 'typescript',
      category: 'Frontend',
      description: 'A typed superset of JavaScript that compiles to plain JavaScript',
      iconUrl: null,
      popularity: 1100,
      createdAt: new Date(),
    }
  ];
  roadmaps: (Roadmap & { generatedFor: string; skillId: string })[] = [];
  phases: Phase[] = [];
  concepts: (Concept & { lessonContent?: string })[] = [];
  conceptProgress: ConceptProgress[] = [];
  questions: Question[] = [];
  quizAttempts: QuizAttempt[] = [];
  examAttempts: any[] = []; // In-memory ExamAttempts
  projects: Project[] = [];
  vivaSessions: VivaSession[] = [];
  certificates: Certificate[] = [];
  mentorMessages: MentorMessage[] = [];
  notifications: Notification[] = [];
  userRoadmaps: { id: string; userId: string; roadmapId: string; status: string; startedAt: Date; completedAt: Date | null; masteryScore: number | null; roadmap?: any }[] = [];
  passwordResetTokens: { id: string; userId: string; token: string; expiresAt: Date; usedAt: Date | null }[] = [];

  constructor() {
    // Generate some mock questions for general use
    this.generateDefaultQuestions();
  }

  private generateDefaultQuestions() {
    // We'll populate some default questions for quizzes and exams
    const mockConcepts = ['concept-1', 'concept-2', 'concept-3', 'concept-4'];
    mockConcepts.forEach((cId) => {
      for (let i = 1; i <= 4; i++) {
        this.questions.push({
          id: `q-${cId}-${i}`,
          conceptId: cId,
          phaseId: null,
          text: `Mock Question ${i} for Concept ${cId}: What is the correct definition of this concept?`,
          type: 'MCQ',
          difficulty: 'MEDIUM',
          options: [
            'Incorrect option A',
            'Correct option B',
            'Incorrect option C',
            'Incorrect option D'
          ],
          correctAnswer: 'Correct option B',
          explanation: 'Option B is correct because it aligns with standard best practices.',
          codeSnippet: i === 3 ? 'const a = 10;\nconsole.log(a);' : null,
          createdAt: new Date()
        });
      }
    });
  }

  // Helper methods to query/mutate mock data
  findUserById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }

  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(userData: Partial<User>) {
    const newUser: User = {
      id: userData.id || `u-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name || 'Anonymous User',
      email: userData.email || '',
      passwordHash: userData.passwordHash || null,
      avatarUrl: userData.avatarUrl || null,
      role: userData.role || 'LEARNER',
      plan: userData.plan || 'FREE',
      xp: userData.xp || 0,
      level: userData.level || 1,
      streak: userData.streak || 0,
      longestStreak: userData.longestStreak || 0,
      lastActiveDate: userData.lastActiveDate || null,
      streakFreezeCount: userData.streakFreezeCount || 0,
      interviewReadinessScore: userData.interviewReadinessScore || 0,
      dailyGoalTarget: userData.dailyGoalTarget || 50,
      dailyGoalProgress: userData.dailyGoalProgress || 0,
      totalCerts: userData.totalCerts || 0,
      totalProjects: userData.totalProjects || 0,
      emailVerified: userData.emailVerified || false,
      emailVerifyToken: userData.emailVerifyToken || null,
      passwordResetOtp: userData.passwordResetOtp || null,
      passwordResetExpiry: userData.passwordResetExpiry || null,
      notifStreak: userData.notifStreak ?? true,
      notifPhaseUnlock: userData.notifPhaseUnlock ?? true,
      notifWeeklyDigest: userData.notifWeeklyDigest ?? true,
      notifProjectScored: userData.notifProjectScored ?? true,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    this.users[userIndex] = { ...this.users[userIndex]!, ...updates, updatedAt: new Date() };
    return this.users[userIndex]!;
  }

  /**
   * Push an in-app notification into mockDb (and attempt to persist to Prisma).
   * Used by routes to trigger progress-based notifications.
   */
  pushNotification(notif: {
    userId: string;
    type: string;
    title: string;
    body: string;
  }) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: notif.userId,
      type: notif.type as any,
      title: notif.title,
      body: notif.body,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.push(newNotif);
    return newNotif;
  }
}

export const mockDb = new MockDatabase();

