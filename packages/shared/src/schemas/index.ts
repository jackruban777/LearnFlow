import { z } from 'zod';

// ─────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────

const blacklistedDomains = [
  'tempmail.com', 'mailinator.com', 'yopmail.com', 'dispostable.com', 
  'fake.com', 'test.com', 'example.com', 'mock.com', 'trashmail.com', 
  '10minutemail.com', 'getairmail.com', 'guerrillamail.com', 'sharklasers.com',
  'fakeinbox.com', 'mailnesia.com', 'maildrop.cc', 'disposable.com', 'temp.com',
  'dummy.com', 'abc.com', 'xyz.com', '123.com', 'mail.com', 'email.com', 'domain.com',
  'user.com',
];

const inappropriateWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'crap', 'dick', 'pussy', 'bastard', 'cunt', 'nigger', 'faggot', 'whore', 'slut',
];

const fakeLocalParts = new Set([
  'fake', 'test', 'dummy', 'temp', 'garbage', 'asdf', 'qwerty', 'mock', 'none',
  'testing', 'admin', 'administrator', 'inappropriate', 'junk', 'trash', 'user',
  'abc', '123', 'xyz', 'asd', 'qwe', 'zxc', 'hello', 'world', 'foobar', 'foo', 'bar',
  'sample', 'noreply', 'no-reply', 'donotreply', 'invalid', 'noname', 'anon',
  'anonymous', 'unknown', 'someone', 'nobody', 'anybody', 'bla', 'blah',
  'lalala', 'lol', 'omg', 'wtf', 'zzz', 'aaa', 'bbb', 'ccc', 'ddd', 'eee',
  'fff', 'ggg', 'hhh', 'iii', 'jjj', 'kkk', 'lll', 'mmm', 'nnn', 'ooo', 'ppp',
  'qqq', 'rrr', 'sss', 'ttt', 'uuu', 'vvv', 'www', 'xxx', 'yyy',
]);

const sequentialPatterns = [
  'abcde', 'bcdef', 'cdefg', 'defgh', 'efghi', 'fghij', 'ghijk', 'hijkl',
  'ijklm', 'jklmn', 'klmno', 'lmnop', 'mnopq', 'nopqr', 'opqrs', 'pqrst',
  'qrstu', 'rstuv', 'stuvw', 'tuvwx', 'uvwxy', 'vwxyz',
  'qwert', 'werty', 'ertyu', 'rtyui', 'tyuio', 'yuiop',
  'asdfg', 'sdfgh', 'dfghj', 'fghjk', 'ghjkl',
  'zxcvb', 'xcvbn', 'cvbnm',
  '12345', '23456', '34567', '45678', '56789', '67890',
];

/**
 * Comprehensive email validation that rejects:
 *  - Structurally invalid emails
 *  - Short / fake local parts (abc, 123, aaa, etc.)
 *  - Disposable / blacklisted domains
 *  - Domains without a valid TLD (min 2 alpha chars, no digits-only TLD)
 *  - Purely numeric local parts
 *  - Keyboard-pattern sequences (qwerty, asdf, 12345, …)
 *  - Repeated-character strings (aaaa, 1111, …)
 *  - Inappropriate words
 *  - Local parts that are too short (< 3 chars) or too long (> 64)
 */
export const isEmailValidAndAppropriate = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  const trimmed = email.trim().toLowerCase();

  // ── 1. Strict structural check (TLD ≥ 2 alpha chars, no spaces/consecutive dots) ─
  const emailRegex = /^[a-z0-9](?:[a-z0-9!#$%&'*+/=?^_`{|}~.-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  const atIdx = trimmed.lastIndexOf('@');
  const localPart = trimmed.substring(0, atIdx);
  const domain = trimmed.substring(atIdx + 1);

  // ── 2. Local part length ──────────────────────────────────────────────────
  if (localPart.length < 3 || localPart.length > 64) return false;

  // ── 3. Purely numeric local part (e.g. 123@gmail.com, 9876@yahoo.com) ────
  if (/^\d+$/.test(localPart)) return false;

  // ── 4. Repeated-character pattern (aaa, 1111, aaaa1 …) ───────────────────
  //    Reject if a single char makes up ≥ 70% of the local part
  const charFreq: Record<string, number> = {};
  for (const c of localPart) charFreq[c] = (charFreq[c] ?? 0) + 1;
  const maxFreq = Math.max(...Object.values(charFreq));
  if (maxFreq / localPart.length >= 0.7) return false;

  // ── 5. Fake / reserved local parts ───────────────────────────────────────
  if (fakeLocalParts.has(localPart)) return false;
  if (
    localPart.startsWith('test') ||
    localPart.startsWith('fake') ||
    localPart.startsWith('dummy') ||
    localPart.startsWith('temp') ||
    localPart.startsWith('mock') ||
    localPart.startsWith('spam') ||
    localPart.startsWith('noreply') ||
    localPart.startsWith('no-reply')
  ) return false;

  // ── 6. Sequential / keyboard-pattern in local part ────────────────────────
  if (sequentialPatterns.some((pat) => localPart.includes(pat))) return false;

  // ── 7. Blacklisted / disposable domains ──────────────────────────────────
  if (blacklistedDomains.includes(domain)) return false;
  if (
    domain.startsWith('123') ||
    domain.startsWith('abc') ||
    domain.startsWith('xyz') ||
    domain.startsWith('temp') ||
    domain.startsWith('fake') ||
    domain.startsWith('test')
  ) return false;

  // ── 8. Proper TLD (alpha-only, 2–63 chars) ────────────────────────────────
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1]!;
  if (!/^[a-z]{2,63}$/.test(tld)) return false;

  // ── 9. Domain labels must not be purely numeric ───────────────────────────
  if (domainParts.some((part) => /^\d+$/.test(part))) return false;

  // ── 10. Inappropriate words anywhere in the email ─────────────────────────
  for (const word of inappropriateWords) {
    if (trimmed.includes(word)) return false;
  }

  return true;
};

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .toLowerCase()
  .trim()
  .min(6, 'Please enter a valid email address')
  .email('Please enter a valid email address')
  .refine(isEmailValidAndAppropriate, {
    message: 'Please enter a valid email address',
  });

export const RegisterSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .trim(),
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, 'OTP must be exactly 6 characters'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string({ required_error: 'Verification token is required' }).min(1),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

// ─────────────────────────────────────────────
// Roadmap Schemas
// ─────────────────────────────────────────────

export const GenerateRoadmapSchema = z.object({
  skillName: z
    .string({ required_error: 'Skill name is required' })
    .min(1, 'Skill name cannot be empty')
    .max(100, 'Skill name must be at most 100 characters')
    .trim(),
});

export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapSchema>;

export const UpdateRoadmapStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid roadmap status',
  }),
});

export type UpdateRoadmapStatusInput = z.infer<typeof UpdateRoadmapStatusSchema>;

// ─────────────────────────────────────────────
// Quiz / Exam Schemas
// ─────────────────────────────────────────────

const AnswerEntrySchema = z.object({
  questionId: z.string({ required_error: 'Question ID is required' }).min(1),
  answer: z.string({ required_error: 'Answer is required' }).min(1),
});

export const SubmitQuizSchema = z.object({
  conceptId: z.string({ required_error: 'Concept ID is required' }).min(1),
  answers: z
    .array(AnswerEntrySchema)
    .min(1, 'At least one answer is required')
    .max(20, 'Too many answers provided'),
});

export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;

export const SubmitExamSchema = z.object({
  phaseId: z.string({ required_error: 'Phase ID is required' }).min(1),
  answers: z
    .array(AnswerEntrySchema)
    .min(1, 'At least one answer is required')
    .max(50, 'Too many answers provided'),
});

export type SubmitExamInput = z.infer<typeof SubmitExamSchema>;

// ─────────────────────────────────────────────
// Project Submission Schema
// ─────────────────────────────────────────────

export const SubmitProjectSchema = z.object({
  phaseId: z.string({ required_error: 'Phase ID is required' }).min(1),
  repoUrl: z
    .string({ required_error: 'Repository URL is required' })
    .url('Must be a valid URL')
    .refine(
      (url) =>
        url.startsWith('https://github.com/') ||
        url.startsWith('https://gitlab.com/') ||
        url.startsWith('https://bitbucket.org/'),
      { message: 'Repository must be a GitHub, GitLab, or Bitbucket URL' }
    ),
  description: z
    .string({ required_error: 'Description is required' })
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  screenshotUrls: z
    .array(z.string().url('Each screenshot must be a valid URL'))
    .max(3, 'Maximum of 3 screenshots allowed')
    .default([]),
  techStack: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one technology is required')
    .max(20, 'Too many technologies listed'),
});

export type SubmitProjectInput = z.infer<typeof SubmitProjectSchema>;

// ─────────────────────────────────────────────
// Viva Schema
// ─────────────────────────────────────────────

export const VivaAnswerSchema = z.object({
  vivaSessionId: z
    .string({ required_error: 'Viva session ID is required' })
    .min(1),
  questionIndex: z
    .number({ required_error: 'Question index is required' })
    .int('Question index must be an integer')
    .min(0, 'Question index must be non-negative'),
  answer: z
    .string({ required_error: 'Answer is required' })
    .min(10, 'Answer must be at least 10 characters')
    .max(5000, 'Answer must be at most 5000 characters'),
});

export type VivaAnswerInput = z.infer<typeof VivaAnswerSchema>;

// ─────────────────────────────────────────────
// Mentor Chat Schema
// ─────────────────────────────────────────────

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    required_error: 'Message role is required',
    invalid_type_error: "Role must be 'user' or 'assistant'",
  }),
  content: z
    .string({ required_error: 'Message content is required' })
    .min(1, 'Message content cannot be empty')
    .max(10000, 'Message content is too long'),
});

export const MentorChatSchema = z.object({
  messages: z
    .array(ChatMessageSchema)
    .min(1, 'At least one message is required')
    .max(50, 'Conversation history is too long'),
  contextSkillId: z.string().min(1).optional(),
});

export type MentorChatInput = z.infer<typeof MentorChatSchema>;

// ─────────────────────────────────────────────
// Notification Settings Schema
// ─────────────────────────────────────────────

export const UpdateNotificationSettingsSchema = z.object({
  streakReminders: z.boolean({
    required_error: 'streakReminders is required',
    invalid_type_error: 'streakReminders must be a boolean',
  }),
  phaseUnlocks: z.boolean({
    required_error: 'phaseUnlocks is required',
    invalid_type_error: 'phaseUnlocks must be a boolean',
  }),
  weeklyDigest: z.boolean({
    required_error: 'weeklyDigest is required',
    invalid_type_error: 'weeklyDigest must be a boolean',
  }),
  projectScored: z.boolean({
    required_error: 'projectScored is required',
    invalid_type_error: 'projectScored must be a boolean',
  }),
});

export type UpdateNotificationSettingsInput = z.infer<
  typeof UpdateNotificationSettingsSchema
>;

// ─────────────────────────────────────────────
// Profile Update Schema
// ─────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .trim()
    .optional(),
  avatarUrl: z.string().url('Must be a valid URL').nullable().optional(),
  dailyGoalTarget: z
    .number()
    .int()
    .min(1, 'Daily goal must be at least 1 XP')
    .max(1000, 'Daily goal must be at most 1000 XP')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─────────────────────────────────────────────
// Leaderboard Query Schema
// ─────────────────────────────────────────────

export const LeaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  period: z
    .enum(['all_time', 'weekly', 'monthly'])
    .optional()
    .default('all_time'),
});

export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;

// ─────────────────────────────────────────────
// Streak Freeze Schema
// ─────────────────────────────────────────────

export const UseStreakFreezeSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the streak freeze usage' }),
  }),
});

export type UseStreakFreezeInput = z.infer<typeof UseStreakFreezeSchema>;
