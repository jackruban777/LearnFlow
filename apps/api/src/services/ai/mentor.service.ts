import { isMockAiEnabled, getChatCompletion, ChatMessage } from './openai.js';
import { prisma } from '../../lib/prisma.js';
import { mockDb } from '../../lib/mockDb.js';

export async function mentorChat(
  userId: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  contextSkillId?: string
): Promise<string> {
  // 1. Fetch user information for context
  let userName = 'Learner';
  let userPlan = 'FREE';
  let skillName = '';

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      userName = user.name;
      userPlan = user.plan;
    } else {
      const mockUser = mockDb.findUserById(userId);
      if (mockUser) {
        userName = mockUser.name;
        userPlan = mockUser.plan;
      }
    }

    if (contextSkillId) {
      const skill = await prisma.skill.findUnique({ where: { id: contextSkillId } });
      if (skill) {
        skillName = skill.name;
      }
    }
  } catch (err) {
    console.warn('⚠️ DB error fetching user/skill context for mentorChat:', (err as Error).message);
    const mockUser = mockDb.findUserById(userId);
    if (mockUser) {
      userName = mockUser.name;
      userPlan = mockUser.plan;
    }
  }

  // Save the user's latest message to the DB (if not already saved)
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg && lastUserMsg.role === 'user') {
    try {
      await prisma.mentorMessage.create({
        data: {
          userId,
          role: 'USER',
          content: lastUserMsg.content,
          contextSkillId: contextSkillId || null
        }
      });
    } catch (err) {
      console.warn('⚠️ Database disconnected, saving user message to mockDb:', (err as Error).message);
      mockDb.mentorMessages.push({
        id: `msg-${Date.now()}-user`,
        userId,
        role: 'user',
        content: lastUserMsg.content,
        contextSkillId: contextSkillId || null,
        tokensUsed: null,
        createdAt: new Date()
      });
    }
  }

  let replyText = '';

  if (isMockAiEnabled) {
    console.log(`🤖 Generating mock mentor chat reply for: ${userName}`);
    replyText = generateMockReply(userName, lastUserMsg?.content || '', skillName);
  } else {
    try {
      console.log(`🔥 Invoking OpenAI for mentor chat: ${userName}`);
      const systemPrompt = `You are LearnFlow's expert AI Mentor.
Your goal is to guide the student named "${userName}" (Plan: ${userPlan}) through their skill mastery journey.
${skillName ? `Currently, they are focused on learning: ${skillName}.` : ''}
Provide helpful, code-rich, and engaging assistance. Keep explanations structured, clear, and motivational.`;

      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ];

      replyText = await getChatCompletion(apiMessages);
    } catch (error) {
      console.error('❌ OpenAI mentor chat failed, falling back to mock reply:', error);
      replyText = generateMockReply(userName, lastUserMsg?.content || '', skillName);
    }
  }

  // Save the AI's reply to the DB (with fallback to mockDb)
  try {
    await prisma.mentorMessage.create({
      data: {
        userId,
        role: 'ASSISTANT',
        content: replyText,
        contextSkillId: contextSkillId || null
      }
    });
  } catch (err) {
    console.warn('⚠️ Database disconnected, saving assistant message to mockDb:', (err as Error).message);
    mockDb.mentorMessages.push({
      id: `msg-${Date.now()}-ai`,
      userId,
      role: 'assistant',
      content: replyText,
      contextSkillId: contextSkillId || null,
      tokensUsed: null,
      createdAt: new Date()
    });
  }

  return replyText;
}

function generateMockReply(name: string, lastMessage: string, skillName: string): string {
  const query = lastMessage.toLowerCase().trim();

  // 1. GREETINGS & WHO ARE YOU
  if (query.match(/\b(hello|hi|hey|greetings|yo|sup)\b/)) {
    return `Hello ${name}! 👋 I'm your LearnFlow AI Mentor. I'm here to guide you through your learning path, answer questions about programming languages and technologies, explain complex concepts, debug code, or help you navigate the LearnFlow platform!

How can I help you today?`;
  }

  if (query.includes('who are you') || query.includes('what are you') || query.includes('your name') || query.includes('about yourself')) {
    return `I am the LearnFlow AI Mentor—your personal tutor and guide! 🤖 
My purpose is to help you master new skills, explain code, debug errors, and answer questions about both software technologies and how to get the most out of the LearnFlow platform. You can ask me anything from "How do I earn certificates?" to "Explain React hooks"!`;
  }

  // 2. LEARNFLOW APP QUESTIONS
  // XP, Levels, Streaks
  if (query.includes('xp') || query.includes('level') || query.includes('streak') || query.includes('point')) {
    return `### LearnFlow Gamification Guide 🎮
Staying motivated is key to mastering new skills! Here is how our gamification system works:

1. **XP (Experience Points)**: You earn XP by completing concepts, passing Phase Exams, submitting Practical Projects, and finishing AI Viva sessions.
2. **Leveling Up**: As you accumulate XP, your level increases. Higher levels unlock new avatar options and show off your expertise on the Leaderboard.
3. **Streaks**: Completing at least one concept lesson daily maintains your learning streak! If you miss a day, your streak resets unless you have a **Streak Freeze** active (configurable in Settings).`;
  }

  // Roadmaps & Phases
  if (query.includes('roadmap') || query.includes('phase') || query.includes('track') || query.includes('unlock')) {
    return `### LearnFlow Skill Tracks & Roadmaps 🗺️
Every skill on LearnFlow features a structured, phase-based learning path:

1. **Phases**: A roadmap is broken down into ordered **Phases**. You must complete the current phase to unlock the next one.
2. **Concepts Matrix**: Each Phase contains a list of core concepts. Clicking a concept opens a lesson and interactive learning resources.
3. **Unlocking next Phase**: Once you finish all concept lessons in a Phase, the **Phase Exit Desk** unlocks. You need to pass the Phase Exam, submit your Project repository, and complete the AI Viva oral session to pass the phase and unlock the next one!`;
  }

  // Assessments (Exams, Projects, Viva)
  if (query.includes('exam') || query.includes('project') || query.includes('viva') || query.includes('test') || query.includes('assessment')) {
    return `### LearnFlow Phase Exit Desk 🎓
To pass a phase and prove your mastery, you must complete three distinct assessments:

1. **Exit Examination**: A multiple-choice and scenario-based exam testing your theoretical knowledge of all concepts in the phase.
2. **Practical Project**: You are given a project prompt and repository structure. You write your code, push it to GitHub, and submit your repo link for AI evaluation.
3. **AI Viva Session**: An interactive oral exam! Using your microphone (or text), the AI Mentor asks you questions about your project implementation and concepts, analyzing your real-time explanations to score your readiness.`;
  }

  // Certificates
  if (query.includes('certificate') || query.includes('cert') || query.includes('pdf') || query.includes('print')) {
    return `### Earning Certificates on LearnFlow 📜
Once you successfully complete all phases of a roadmap (your Overall Mastery reaches 100%), the system marks the roadmap as **COMPLETED**.

* **Viewing**: A **"View My Certificate"** button will appear on the top banner of the completed Roadmap page.
* **Saving & Printing**: Clicking the button opens a beautiful landscape US Letter certificate modal. You can click **"Print / Save PDF"** to print it directly or save it as a high-quality PDF from your browser's print dialog!`;
  }

  // Leaderboard
  if (query.includes('leaderboard') || query.includes('rank') || query.includes('championship') || query.includes('compete')) {
    return `### Leaderboards & Championships 🏆
The **Leaderboard** showcases the top learners on the LearnFlow platform:
* **Ranking**: Users are ranked based on their total accumulated **XP**.
* **Levels**: Your current level is displayed next to your name.
* **Competition**: Practice daily to earn more XP and climb the ranks to become the top learner!`;
  }

  // 3. GENERAL TECHNOLOGY QUESTIONS
  // React
  if (query.includes('react') || query.includes('component') || query.includes('hook') || query.includes('useeffect') || query.includes('usestate')) {
    return `### React.js Overview ⚛️
React is a popular component-based JavaScript library for building user interfaces.

* **Components**: UIs are split into independent, reusable pieces (Functional Components).
* **State (\`useState\`)**: Local memory for components, trigger a re-render when modified:
  \`\`\`jsx
  const [count, setCount] = useState(0);
  \`\`\`
* **Effects (\`useEffect\`)**: Handles side effects (data fetching, subscriptions, manual DOM updates):
  \`\`\`jsx
  useEffect(() => {
    console.log("Component mounted");
    return () => console.log("Component will unmount");
  }, []);
  \`\`\``;
  }

  // Docker
  if (query.includes('docker') || query.includes('container') || query.includes('volume') || query.includes('compose')) {
    return `### Docker & Containers 🐳
Docker package applications into standard units called containers, bundling code, runtime, and tools together.

* **Image**: Read-only blueprint containing the OS, application code, and settings.
* **Container**: A live, runnable instance of an image.
* **Volumes**: Persistent storage directories shared between the host and containers.
* **Docker Compose**: Tool for defining and running multi-container Docker applications via a \`docker-compose.yml\` file (just like the database and Redis configuration in LearnFlow!).`;
  }

  // TypeScript
  if (query.includes('typescript') || query.includes('ts') || query.includes('interface') || query.includes('type') || query.includes('generic')) {
    return `### TypeScript 📘
TypeScript is a strongly typed programming language that builds on JavaScript, adding static type definition support.

* **Type Safety**: Catches syntax and type errors during compilation rather than runtime.
* **Interfaces & Types**: Define the structure of your objects:
  \`\`\`typescript
  interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'LEARNER';
  }
  \`\`\`
* **Generics**: Create reusable, type-independent components or functions:
  \`\`\`typescript
  function identity<T>(arg: T): T { return arg; }
  \`\`\``;
  }

  // Node.js & Express
  if (query.includes('node') || query.includes('express') || query.includes('middleware') || query.includes('api') || query.includes('backend')) {
    return `### Node.js & Express Backend 🟢
Node.js is a runtime that lets you run JavaScript on the server. Express is a minimalist web framework for building APIs.

* **Asynchronous / Non-blocking**: Uses a single-threaded event loop to handle thousands of concurrent connections efficiently.
* **Middleware**: Functions that run between receiving a request and sending a response:
  \`\`\`javascript
  app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.url}\`);
    next();
  });
  \`\`\`
* **Routing**: Maps URLs to handler functions (like \`/api/notifications\` or \`/api/roadmaps\`).`;
  }

  // SQL & Databases
  if (query.includes('sql') || query.includes('database') || query.includes('postgres') || query.includes('prisma') || query.includes('query')) {
    return `### Databases & SQL 🗄️
LearnFlow uses **PostgreSQL** hosted on **Supabase** as its primary database, and interacts with it using the **Prisma ORM**.

* **SQL (Structured Query Language)**: Used to manage relational tables.
* **Prisma ORM**: Maps database tables to TypeScript models, allowing type-safe queries without raw SQL:
  \`\`\`typescript
  // Find all roadmaps for a user
  const userRoadmaps = await prisma.userRoadmap.findMany({
    where: { userId }
  });
  \`\`\`
* **Indexes**: Enhance query lookup speeds on commonly queried fields (like \`email\` or \`createdAt\`).`;
  }

  // Python
  if (query.includes('python') || query.includes('django') || query.includes('flask') || query.includes('pandas') || query.includes('numpy')) {
    return `### Python Programming 🐍
Python is a high-level, interpreted language praised for its readability and massive ecosystem.

* **Data Science & ML**: Supported by libraries like NumPy, Pandas, Scikit-Learn, and PyTorch.
* **Web Frameworks**: Django (batteries-included) and Flask/FastAPI (minimalist).
* **List Comprehensions**: Elegant way to construct lists:
  \`\`\`python
  squares = [x**2 for x in range(10)]
  \`\`\``;
  }

  // Git
  if (query.includes('git') || query.includes('github') || query.includes('commit') || query.includes('branch') || query.includes('merge') || query.includes('push')) {
    return `### Git & Version Control 🌿
Git is a distributed version control system that tracks code changes. GitHub is a cloud platform hosting Git repositories.

* **Commit**: Snapshot of your changes.
* **Branch**: Isolated timeline for feature development.
* **Merge vs Rebase**:
  * **Merge**: Combines histories, creating a merge commit.
  * **Rebase**: Moves your commits to the tip of another branch, maintaining a flat linear history.
* **Commands**:
  * \`git checkout -b feature-name\` (create and switch branch)
  * \`git commit -am "Commit message"\` (commit changes)
  * \`git push origin branch-name\` (push to remote)`;
  }

  // CSS, Styling, Tailwind
  if (query.includes('css') || query.includes('style') || query.includes('tailwind') || query.includes('flexbox') || query.includes('grid')) {
    return `### Styling & CSS 🎨
LearnFlow combines **Vanilla CSS** (for variables and custom design tokens) with **Tailwind CSS** (for layout and utility classes).

* **Tailwind CSS**: A utility-first CSS framework. Classes like \`flex items-center justify-between\` allow styling directly in HTML/React.
* **CSS Custom Properties (Variables)**: Used to handle theme changes (light vs dark mode):
  \`\`\`css
  :root { --color-dark-950: #f0f4ff; }
  .dark { --color-dark-950: #06010f; }
  \`\`\``;
  }

  // 4. FALLBACK HELP / EXPLANATION / DEBUGGING (If no specific keyword matched)
  if (query.includes('help') || query.includes('explain') || query.includes('what is') || query.includes('how to')) {
    return `Great question, ${name}! Here is a quick breakdown of that topic:\n\n1. **Core Concept**: It serves as a foundational building block for ${skillName || 'your active roadmap'}.\n2. **Best Practice**: Always write clean, modular, and self-documenting code.\n3. **Example Code Pattern**:\n\`\`\`javascript\n// Typical implementation pattern\nfunction processData(input) {\n  if (!input) return { success: false, error: "Invalid input" };\n  return { success: true, payload: input, timestamp: new Date() };\n}\n\`\`\`\n\nDoes this clarify the concept, or would you like to discuss a specific technology or LearnFlow feature?`;
  }

  if (query.includes('debug') || query.includes('error') || query.includes('broken') || query.includes('fail') || query.includes('crash')) {
    return `Let's debug that, ${name}. 🔍 Common reasons for failures in ${skillName || 'web development'} include:\n* **Reference Errors**: Ensure variables or objects exist before accessing their properties.\n* **Database Connection Issues**: Make sure your DB server is running and your connection string in \`.env\` is correct.\n* **CORS Blockage**: Ensure your backend CORS configuration permits requests from your frontend URL.\n\nCould you paste the exact error message or code snippet? I'll help you debug it.`;
  }

  // 5. GENERAL FALLBACK
  return `Thanks for asking, ${name}! I'm here to support you in your study of ${skillName || 'new skills'}. 

I can help you with:
* **General Technologies**: React, Node.js, Express, Docker, TypeScript, SQL/databases, Python, Git, or styling/CSS.
* **LearnFlow App Features**: XP & levels, generating roadmaps, phase assessments (exams, projects, viva), earning certificates, and leaderboards.

Feel free to ask questions about any of the topics above!`;
}
