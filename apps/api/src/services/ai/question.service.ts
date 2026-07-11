import { Question, Difficulty, QuestionType } from '@learnflow/shared';
import { prisma } from '../../lib/prisma.js';
import { mockDb } from '../../lib/mockDb.js';
import { isMockAiEnabled, getChatCompletion } from './openai.js';

interface AIQuestion {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  codeSnippet: string | null;
}

export async function getSeenQuestionIds(userId: string): Promise<string[]> {
  try {
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { questionIds: true }
    });
    const examAttempts = await prisma.examAttempt.findMany({
      where: { userId },
      select: { questionIds: true }
    });
    const ids = new Set<string>();
    quizAttempts.forEach((q: any) => q.questionIds.forEach((id: any) => ids.add(id)));
    examAttempts.forEach((e: any) => e.questionIds.forEach((id: any) => ids.add(id)));
    return Array.from(ids);
  } catch (err) {
    const ids = new Set<string>();
    mockDb.quizAttempts
      .filter((q: any) => q.userId === userId)
      .forEach((q: any) => q.questionIds.forEach((id: string) => ids.add(id)));
    mockDb.examAttempts
      .filter((e: any) => e.userId === userId)
      .forEach((e: any) => e.questionIds.forEach((id: string) => ids.add(id)));
    return Array.from(ids);
  }
}

export async function generateQuestions(
  conceptId: string,
  limit: number = 4,
  startIndex: number = 0,
  excludeTexts: string[] = []
): Promise<Question[]> {
  let conceptTitle = 'General Concept';
  let conceptDesc = 'Core programming principles and best practices';
  let skillSlug = 'general';

  // Attempt to fetch concept details from Prisma DB
  try {
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        phase: {
          include: {
            roadmap: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (concept) {
      conceptTitle = concept.title;
      conceptDesc = concept.description || '';
      skillSlug = concept.phase?.roadmap?.skill?.slug || 'general';
    } else {
      // Look in mock database
      const mockConcept = mockDb.concepts.find((c: any) => c.id === conceptId);
      if (mockConcept) {
        conceptTitle = mockConcept.title;
        conceptDesc = mockConcept.description || '';
      }
    }
  } catch (err) {
    console.warn('⚠️ Database disconnected, using mockDb for concept info lookup:', (err as Error).message);
    const mockConcept = mockDb.concepts.find((c: any) => c.id === conceptId);
    if (mockConcept) {
      conceptTitle = mockConcept.title;
      conceptDesc = mockConcept.description || '';
    }
  }

  if (isMockAiEnabled) {
    console.log(`🤖 Generating mock questions for concept: ${conceptTitle} (${conceptId}), starting at: ${startIndex}`);
    return generateMockQuestions(conceptId, conceptTitle, conceptDesc, skillSlug, limit, startIndex);
  }

  try {
    console.log(`🔥 Invoking OpenAI to generate questions for concept: ${conceptTitle}`);
    const systemPrompt = `You are a professional technical interviewer and educator.
Generate exactly ${limit} unique multiple choice questions (MCQ, SCENARIO, or CODE_ANALYSIS) for the concept "${conceptTitle}".
Concept Description: ${conceptDesc}
${excludeTexts.length > 0 ? `Do NOT generate any questions that are similar to the following existing questions:
${excludeTexts.map((t: any, idx: number) => `${idx + 1}. ${t}`).join('\n')}` : ''}
You MUST respond with a JSON object strictly matching this schema:
{
  "questions": [
    {
      "text": string,
      "type": "MCQ" | "SCENARIO" | "CODE_ANALYSIS",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string,
      "codeSnippet": string | null
    }
  ]
}
Ensure options are highly realistic, and the correctAnswer is exactly one of the options. Return only the JSON object. Do not wrap in markdown tags.`;

    const responseText = await getChatCompletion([
      { role: 'system', content: systemPrompt }
    ], { response_format: { type: 'json_object' } });

    const data = JSON.parse(responseText.trim()) as {
      questions: AIQuestion[];
    };

    const formattedQuestions: Question[] = data.questions.map((q: AIQuestion, index: number) => {
      let options = q.options ? [...q.options] : [];
      const correctAns = q.correctAnswer || '';
      if (options.length > 0) {
        const correctIndex = options.findIndex((opt: string) => opt.trim().toLowerCase() === correctAns.trim().toLowerCase());
        if (correctIndex !== -1) {
          const actualCorrect = options[correctIndex]!;
          options.splice(correctIndex, 1);
          options.unshift(actualCorrect);
        } else {
          options.unshift(correctAns);
        }
      }
      return {
        id: `q-gen-${conceptId}-${Date.now()}-${startIndex + index}`,
        conceptId,
        phaseId: null,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        options,
        correctAnswer: correctAns,
        explanation: q.explanation,
        codeSnippet: q.codeSnippet,
        createdAt: new Date()
      };
    });

    return formattedQuestions;
  } catch (error) {
    console.error('❌ Failed to generate questions with OpenAI, falling back to mock generator:', error);
    return generateMockQuestions(conceptId, conceptTitle, conceptDesc, skillSlug, limit, startIndex);
  }
}

function generateMockQuestions(
  conceptId: string,
  title: string,
  desc: string,
  skillSlug: string,
  limit: number,
  startIndex: number = 0
): Question[] {
  const list: Question[] = [];
  
  // Categorize tech
  let tech = 'general';
  const lowerTitle = title.toLowerCase();
  const lowerDesc = desc.toLowerCase();
  if (lowerTitle.includes('react') || lowerDesc.includes('react') || lowerTitle.includes('usestate') || lowerTitle.includes('useeffect') || lowerTitle.includes('redux') || lowerTitle.includes('hook')) {
    tech = 'react';
  } else if (lowerTitle.includes('html') || lowerDesc.includes('html') || lowerTitle.includes('semantic') || lowerTitle.includes('doctype') || lowerTitle.includes('tag')) {
    tech = 'html';
  } else if (lowerTitle.includes('css') || lowerDesc.includes('css') || lowerTitle.includes('flexbox') || lowerTitle.includes('grid') || lowerTitle.includes('selector')) {
    tech = 'css';
  } else if (lowerTitle.includes('typescript') || lowerDesc.includes('typescript') || lowerTitle.includes('tsconfig') || lowerTitle.includes('type')) {
    tech = 'typescript';
  } else if (lowerTitle.includes('next.js') || lowerTitle.includes('nextjs') || lowerDesc.includes('next.js') || lowerTitle.includes('ssr') || lowerTitle.includes('isr')) {
    tech = 'next.js';
  } else if (lowerTitle.includes('docker') || lowerDesc.includes('docker') || lowerTitle.includes('container')) {
    tech = 'docker';
  } else if (lowerTitle.includes('kubernetes') || lowerTitle.includes('k8s') || lowerDesc.includes('kubernetes') || lowerTitle.includes('kubectl')) {
    tech = 'kubernetes';
  } else if (lowerTitle.includes('aws') || lowerDesc.includes('aws') || lowerTitle.includes('ec2') || lowerTitle.includes('s3') || lowerTitle.includes('vpc')) {
    tech = 'aws';
  } else if (lowerTitle.includes('javascript') || lowerDesc.includes('javascript') || lowerTitle.includes('es6') || lowerTitle.includes('closure')) {
    tech = 'javascript';
  } else if (lowerTitle.includes('python') || lowerDesc.includes('python')) {
    tech = 'python';
  }

  for (let i = 0; i < limit; i++) {
    const variantIndex = startIndex + i;
    const qType = (['MCQ', 'CODE_ANALYSIS', 'SCENARIO', 'PRACTICAL'] as QuestionType[])[variantIndex % 4]!;
    
    let qText = '';
    let options: string[] = [];
    let correctAnswer = '';
    let explanation = '';
    let codeSnippet: string | null = null;
    let difficulty: Difficulty = (variantIndex % 3 === 0 ? 'EASY' : variantIndex % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty;

    // Tech specific procedural generation
    if (tech === 'react') {
      if (qType === 'MCQ') {
        const questionsPool = [
          {
            q: `Which of the following best describes the core behavior of "${title}" in React components?`,
            opts: [
              `It encapsulates hooks state and triggers localized component re-renders when data updates.`,
              `It bypasses React's virtual DOM reconciliation and updates the real DOM nodes directly.`,
              `It acts as a backend session controller persisting data on external PostgreSQL nodes.`,
              `It makes the component compile into a pure HTML iframe container.`
            ],
            exp: `Correct! ${title} manages state for React components, triggering re-renders to align the UI with updated values.`
          },
          {
            q: `What rule must be followed when invoking "${title}" inside React?`,
            opts: [
              `It must only be called at the top level of a functional component, not inside loops or conditionals.`,
              `It must be declared inside a nested class constructor.`,
              `It must be wrapped in a setInterval callback to poll for changes.`,
              `It must be initialized inside the component's render return JSX block.`
            ],
            exp: `Hooks like ${title} must be called at the top level to guarantee that they execute in the same order on every render.`
          }
        ];
        const selected = questionsPool[Math.floor(variantIndex / 4) % questionsPool.length]!;
        qText = selected.q;
        options = [...selected.opts];
        correctAnswer = options[0]!;
        explanation = selected.exp;
      } else if (qType === 'CODE_ANALYSIS') {
        const counters = ['count', 'val', 'score', 'clicks'];
        const updaters = ['setCount', 'setVal', 'setScore', 'setClicks'];
        const selectedName = counters[variantIndex % counters.length]!;
        const selectedSet = updaters[variantIndex % updaters.length]!;
        
        qText = `Analyze the React snippet utilizing "${title}". What is the primary bug?`;
        codeSnippet = `function App() {\n  const [${selectedName}, ${selectedSet}] = useState(0);\n  const handleClick = () => {\n    ${selectedName} = ${selectedName} + 1;\n    ${selectedSet}(${selectedName});\n  };\n  return <button onClick={handleClick}>Click</button>;\n}`;
        options = [
          `Direct mutation of state variable "${selectedName}" before calling the setter "${selectedSet}".`,
          `Missing import of the React elements namespace.`,
          `The handleClick handler is defined using an arrow function instead of a generator.`,
          `The button element does not support state parameters.`
        ];
        correctAnswer = options[0]!;
        explanation = `State variables should never be directly mutated. Use the updater function ${selectedSet}(prev => prev + 1) instead of modifying "${selectedName}" directly.`;
      } else if (qType === 'SCENARIO') {
        qText = `Your team is implementing "${title}" in a dashboard. You experience high latency because state changes trigger unnecessary expensive child re-renders. What is the best optimization?`;
        options = [
          `Memoize child components using React.memo and pass callbacks wrapped in useCallback.`,
          `Declare all child components as external raw functions outside the React tree.`,
          `Move the component's state to local variables stored in localstorage.`,
          `Wrap the parent component inside a setImmediate polling loop.`
        ];
        correctAnswer = options[0]!;
        explanation = `Using React.memo and useCallback prevents unnecessary re-renders of child components whose props haven't changed.`;
      } else {
        qText = `How should you perform a functional state update with "${title}" if the new state depends on the previous state value?`;
        options = [
          `Pass a callback function to the state setter (e.g. prev => prev + 1).`,
          `Assign the new value directly using the assignment operator.`,
          `Trigger a window.location.reload() immediately after calling the setter.`,
          `Call state.getPreviousState() and add the delta.`
        ];
        correctAnswer = options[0]!;
        explanation = `Passing a callback to the setter ensures you work with the most current state value, avoiding race conditions in concurrent React.`;
      }
    } else if (tech === 'html') {
      if (qType === 'MCQ') {
        qText = `Under HTML5 semantic guidelines, what is the primary role of the "${title}" element?`;
        options = [
          `To clearly convey layout hierarchy and semantic meaning to browsers and accessibility tools.`,
          `To compile inline styles into compressed stylesheet formats.`,
          `To handle REST requests asynchronously via database middleware.`,
          `To define local security headers for external API gateways.`
        ];
        correctAnswer = options[0]!;
        explanation = `Semantic HTML tags help search engines and screen readers understand web page content structure.`;
      } else if (qType === 'CODE_ANALYSIS') {
        qText = `Analyze the HTML code below for "${title}". Which audit finding is correct?`;
        codeSnippet = `<div class="nav-bar">\n  <a href="#">Home</a>\n  <a href="#">About</a>\n</div>`;
        options = [
          `It is missing semantic HTML tags like <nav> which harms accessibility.`,
          `It contains invalid tags that cannot be compiled.`,
          `The anchor tags must be enclosed inside a <script> block.`,
          `The classes are incorrectly declared using class instead of className.`
        ];
        correctAnswer = options[0]!;
        explanation = `Using semantic tags like <nav> instead of generic <div> containers helps accessibility tools navigate layouts.`;
      } else if (qType === 'SCENARIO') {
        qText = `You are designing a web form for "${title}" that requires accessible fields for screen readers. What is the best strategy?`;
        options = [
          `Associate labels using explicit "for" and "id" attributes and use aria-describedby for hints.`,
          `Place text inside random spans alongside input boxes.`,
          `Use raw placeholder attributes as the sole label for inputs.`,
          `Implement voice recognition APIs directly in the index header.`
        ];
        correctAnswer = options[0]!;
        explanation = `Explicitly pairing labels with input elements guarantees screen reader software can identify fields.`;
      } else {
        qText = `Which tag is the most semantic block wrapper choice for rendering the main contents of "${title}" according to W3C guidelines?`;
        options = [
          `The <main> tag.`,
          `The <section-container> tag.`,
          `The <wrapper-main> tag.`,
          `The <body> tag inside an iframe.`
        ];
        correctAnswer = options[0]!;
        explanation = `<main> is a native HTML5 semantic tag representing the dominant content of the document body.`;
      }
    } else if (tech === 'css') {
      if (qType === 'MCQ') {
        qText = `In CSS rules styling "${title}", which rule applies when calculating selector specificity?`;
        options = [
          `ID selectors outweigh class selectors, which outweigh tag element selectors.`,
          `Tags have higher specificity than classes.`,
          `The first declared class in the stylesheet overrides all subsequent ones.`,
          `Styles applied via external links are always overridden by local stylesheets.`
        ];
        correctAnswer = options[0]!;
        explanation = `Specificity is calculated as: inline styles (1000) > IDs (100) > classes/attributes (10) > tags (1).`;
      } else if (qType === 'CODE_ANALYSIS') {
        qText = `Analyze this stylesheet snippet for "${title}". What is the output display?`;
        codeSnippet = `.container {\n  display: flex;\n  justify-content: center;\n  align-items: flex-end;\n}`;
        options = [
          `Flex items align horizontally centered and anchor at the bottom vertically.`,
          `Flex items stack in a vertical column and align top-left.`,
          `The container grid expands to the maximum screen width.`,
          `It throws an error because flex-end is not a valid CSS value.`
        ];
        correctAnswer = options[0]!;
        explanation = `justify-content: center centers items horizontally along the main flex axis, and align-items: flex-end aligns them at the bottom.`;
      } else if (qType === 'SCENARIO') {
        qText = `Your layout for "${title}" overflows mobile screens. Which strategy resolves this?`;
        options = [
          `Apply max-width: 100% and box-sizing: border-box, and use CSS media queries.`,
          `Scale up the container width to 200vw.`,
          `Force scrolling behavior by applying overflow: scroll to the html tag.`,
          `Remove all viewport configurations from the document head.`
        ];
        correctAnswer = options[0]!;
        explanation = `box-sizing: border-box includes margins/paddings in elements width, and media queries adjust style definitions across screen sizes.`;
      } else {
        qText = `What does the box-sizing property do when set to "border-box" for "${title}" styling?`;
        options = [
          `It includes padding and border in the element's total width and height.`,
          `It excludes padding and border from the width calculation.`,
          `It applies an automatic margin around the element.`,
          `It changes the layout engine from block display to flex container.`
        ];
        correctAnswer = options[0]!;
        explanation = `border-box makes sizing layout elements predictable by incorporating padding and border inside the declared dimensions.`;
      }
    } else if (tech === 'typescript') {
      if (qType === 'MCQ') {
        qText = `How does TypeScript ensure type safety for "${title}" during software development?`;
        options = [
          `It performs static type analysis during compilation and reports errors before outputting plain JavaScript.`,
          `It injects type verification checks into the runtime JavaScript binary.`,
          `It encrypts function variables using public-key parameters.`,
          `It compiles the TS files directly into native WASM binaries.`
        ];
        correctAnswer = options[0]!;
        explanation = `TypeScript is a static type checker. Type checking occurs strictly at compilation time, producing clean, standard JavaScript.`;
      } else if (qType === 'CODE_ANALYSIS') {
        qText = `Analyze the TypeScript code below for "${title}". What is the compiler outcome?`;
        codeSnippet = `type Status = "idle" | "active";\nlet currentStatus: Status = "pending";`;
        options = [
          `A compilation error occurs: Type '"pending"' is not assignable to type 'Status'.`,
          `The code compiles successfully with currentStatus set to "idle".`,
          `The JavaScript compiler converts "Status" into a runtime lookup class.`,
          `It compiles but throws an error at runtime.`
        ];
        correctAnswer = options[0]!;
        explanation = `Because "pending" is not one of the literal strings defined in the Status union, the compiler halts with an assignment error.`;
      } else if (qType === 'SCENARIO') {
        qText = `Your team is consuming an untyped legacy API library for "${title}". How do you integrate it cleanly?`;
        options = [
          `Write a custom declaration file (.d.ts) or declare module "legacy-library" to describe the interface.`,
          `Convert all your project TS files back to standard JavaScript.`,
          `Add "allowJs: false" in tsconfig.json to block legacy scripts.`,
          `Wrap the library in a try-catch block and cast variables as "never".`
        ];
        correctAnswer = options[0]!;
        explanation = `Declaration files (.d.ts) supply type information for JavaScript libraries, permitting type check tooling to work.`;
      } else {
        qText = `What is the primary difference between "interface" and "type" declarations in "${title}"?`;
        options = [
          `Interfaces support declaration merging, whereas types cannot be redeclared once defined.`,
          `Types compile directly to JavaScript classes, but interfaces do not.`,
          `Interfaces cannot declare optional properties.`,
          `Types can only describe primitive variables.`
        ];
        correctAnswer = options[0]!;
        explanation = `Multiple interface declarations with the same name merge their structures, making them extensible. Types use intersection tags instead.`;
      }
    } else if (tech === 'javascript') {
      if (qType === 'MCQ') {
        qText = `What is the primary mechanism of JavaScript closures in "${title}"?`;
        options = [
          `A function retains access to its lexical scope variables even when executed outside that scope.`,
          `It blocks external garbage collection from cleaning memory heap pools completely.`,
          `It compiles functions to run concurrently on separate OS threads.`,
          `It intercepts DOM clicks to prevent normal bubble propagation.`
        ];
        correctAnswer = options[0]!;
        explanation = `Closures are created every time a function is created, giving it access to parent scope scopes dynamically.`;
      } else if (qType === 'CODE_ANALYSIS') {
        qText = `Analyze this JavaScript scope execution for "${title}". What is printed?`;
        codeSnippet = `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 10);\n}`;
        options = [
          `It prints "3" three times due to var's function scoping.`,
          `It prints "0", "1", "2" in sequence.`,
          `It throws a ReferenceError: i is not defined.`,
          `It prints "undefined" three times.`
        ];
        correctAnswer = options[0]!;
        explanation = `Because "var" is function-scoped (not block-scoped), the single shared "i" variable increments to 3 before timers run.`;
      } else if (qType === 'SCENARIO') {
        qText = `You observe blocked UI responsiveness when running an intensive loop for "${title}". What is the best fix?`;
        options = [
          `Break the work into chunks using setTimeout/requestIdleCallback, or delegate it to a Web Worker.`,
          `Wrap the calculation loop inside an async function call.`,
          `Change variable declarations from const to let to optimize allocation.`,
          `Switch the loop construct from for-in to while.`
        ];
        correctAnswer = options[0]!;
        explanation = `Async functions still run on the single main thread. Web Workers spin off calculations onto secondary background threads, keeping UI responsive.`;
      } else {
        qText = `What is the role of the Event Loop in JavaScript's execution model for "${title}"?`;
        options = [
          `It polls the callback queue and moves items to the call stack when it is empty.`,
          `It monitors network connections to ensure they stay open.`,
          `It compiles script source code into optimized machine binary blocks.`,
          `It restarts the browser process if a script takes too long.`
        ];
        correctAnswer = options[0]!;
        explanation = `The event loop enables non-blocking I/O by executing callbacks when the main execution thread call stack is clear.`;
      }
    } else {
      // General procedural generator for other technologies (docker, kubernetes, aws, next.js, general)
      const qPool = [
        {
          q: `Which of the following is the most standard architectural best practice for "${title}"?`,
          opts: [
            `Ensuring high modularity, proper decoupling of concerns, and clear interface definitions.`,
            `Consolidating all logic and databases into a single monolithic source block.`,
            `Bypassing code compiler stages to run source files directly in production.`,
            `Disabling validation check routines to maximize execution speed.`
          ],
          exp: `Modularity and separation of concerns are fundamental best practices that enhance software reliability and maintenance for ${title}.`
        },
        {
          q: `When configuring parameters for "${title}", how should sensitive credentials and API keys be stored?`,
          opts: [
            `Injected securely using environment variables or encrypted secrets managers.`,
            `Hardcoded directly inside the shared source files.`,
            `Exposed publicly via client-side metadata files.`,
            `Written in plain text files placed in temporary OS directories.`
          ],
          exp: `Environment variables keep secrets isolated from the codebase, avoiding credential leaks.`
        },
        {
          q: `Analyze the snippet for "${title}". What error might arise?`,
          code: `// Configuration for ${title}\nconst CONFIG = {\n  host: process.env.HOST || "localhost",\n  port: process.env.PORT || 8080\n};`,
          opts: [
            `Missing fallback logic if the expected environment variables are undefined or misconfigured.`,
            `A syntax crash due to declaring constants inside configurations.`,
            `Compiler rejection of standard string declarations.`,
            `O(N^2) complexity runtime bottlenecks on startup.`
          ],
          exp: `Ensure your system has failover mechanisms if keys or ports are not provided by the environment.`
        },
        {
          q: `What is the primary benefit of deploying "${title}" inside containerized architectures?`,
          opts: [
            `It guarantees environment parity, isolating code dependencies across local dev and cloud servers.`,
            `It automatically translates JavaScript code into native machine assembly.`,
            `It eliminates the need for database storage configurations.`,
            `It reduces the memory footprints of applications to exactly zero.`
          ],
          exp: `Containers package the application code alongside all of its libraries and configurations, eliminating "works on my machine" issues.`
        }
      ];
      
      const selected = qPool[variantIndex % qPool.length]!;
      qText = selected.q;
      options = [...selected.opts];
      correctAnswer = options[0]!;
      explanation = selected.exp;
      if (selected.code) {
        codeSnippet = selected.code;
      }
    }

    list.push({
      id: `q-mock-${conceptId}-${variantIndex}`,
      conceptId,
      phaseId: null,
      text: qText,
      type: qType,
      difficulty,
      options,
      correctAnswer,
      explanation,
      codeSnippet,
      createdAt: new Date()
    });
  }

  return list;
}
