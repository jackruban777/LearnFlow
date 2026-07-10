import { RoadmapGenerationResult, Difficulty } from '@learnflow/shared';

// Helper to cast string to Difficulty
const easy = 'EASY' as Difficulty;
const med = 'MEDIUM' as Difficulty;
const hard = 'HARD' as Difficulty;

export const MOCK_ROADMAPS: Record<string, Omit<RoadmapGenerationResult, 'skillName'>> = {
  // --- FRONTEND ---
  'html': {
    totalPhases: 3,
    overview: 'Learn HTML (HyperText Markup Language), the standard markup language for documents designed to be displayed in a web browser. Master semantic markup, forms, and accessibility.',
    prerequisites: ['Basic computer literacy', 'Text editor setup'],
    targetAudience: 'Beginner web developers and designers.',
    estimatedWeeks: 2,
    phases: [
      {
        title: 'Phase 1: Basic Structure & Syntax',
        description: 'Learn HTML elements, tags, document structures, and text formatting tags.',
        order: 1,
        concepts: [
          { title: 'HTML Document Anatomy', description: 'Understand DOCTYPE, html, head, and body tags.', content: '# HTML Document Anatomy\n\nEvery HTML5 document starts with a Document Type Declaration and structured wrapper elements.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>My First Web Page</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'Text Formatting & Headings', description: 'Organize text using h1-h6, paragraph, and span tags.', content: '# Headings & Paragraphs\n\nUse headings to define the layout structure of your content:\n\n\`\`\`html\n<h1>Main Title</h1>\n<h2>Sub-section</h2>\n<p>This is a paragraph with <strong>bold</strong> and <em>italicized</em> text.</p>\n\`\`\`', difficulty: easy, estimatedMinutes: 20, order: 2 },
          { title: 'Links & Anchor Elements', description: 'Create hyperlinks using the anchor tag.', content: '# Links\n\nAnchor tags link pages together:\n\n\`\`\`html\n<a href="https://google.com" target="_blank">Search Google</a>\n\`\`\`', difficulty: easy, estimatedMinutes: 20, order: 3 },
          { title: 'Images and Alt Attributes', description: 'Insert images and write proper descriptive alt text.', content: '# Images\n\nEmbed visual content non-destructively:\n\n\`\`\`html\n<img src="logo.png" alt="Company Logo" width="200">\n\`\`\`', difficulty: easy, estimatedMinutes: 25, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Semantic HTML & Forms',
        description: 'Structure webpages semantically and gather user input using HTML forms.',
        order: 2,
        concepts: [
          { title: 'Semantic Web Page Layouts', description: 'Use header, nav, main, article, section, and footer elements.', content: '# Semantic HTML\n\nSemantic markup tells browsers and screen readers what the content represents, improving SEO and accessibility:\n\n\`\`\`html\n<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>Article Title</h2>\n  </article>\n</main>\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 1 },
          { title: 'Form Inputs and Validation', description: 'Build forms with text fields, checkboxes, radios, and validation.', content: '# HTML Forms\n\nCapture user inputs and configure actions:\n\n\`\`\`html\n<form action="/submit" method="POST">\n    <label for="username">Name:</label>\n    <input type="text" id="username" required>\n    <button type="submit">Send</button>\n</form>\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 2 },
          { title: 'Tables & Lists Structures', description: 'Organize data using ul, ol, li, and table schemas.', content: '# Lists & Tables\n\n\`\`\`html\n<ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n</ul>\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Embedded Media (Audio/Video)', description: 'Add native audio and video elements to your layout.', content: '# Media Elements\n\n\`\`\`html\n<video controls>\n    <source src="movie.mp4" type="video/mp4">\n</video>\n\`\`\`', difficulty: med, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Accessibility & Meta Configurations',
        description: 'Configure head tags for SEO/social sharing, and conform to accessibility standards.',
        order: 3,
        concepts: [
          { title: 'SEO Meta Tags & OpenGraph', description: 'Configure viewport, description, and preview tags.', content: '# SEO Meta Tags\n\n\`\`\`html\n<meta name="description" content="Learn web development from scratch.">\n<meta property="og:image" content="preview.jpg">\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 1 },
          { title: 'ARIA Roles & Screen Readers', description: 'Make elements accessible using ARIA tags.', content: '# ARIA Attributes\n\n\`\`\`html\n<button aria-label="Close menu">X</button>\n\`\`\`', difficulty: hard, estimatedMinutes: 50, order: 2 },
          { title: 'HTML5 APIs (Geolocation/Storage)', description: 'Basic introduction to browser-side APIs.', content: '# Web Storage\n\nHTML5 introduced sessionStorage and localStorage storage mechanisms.', difficulty: hard, estimatedMinutes: 55, order: 3 },
          { title: 'Capstone Website Markup Project', description: 'Design a semantic, fully accessible landing page skeleton.', content: '# Capstone Landing Page Skeleton\n\nCreate a clean template featuring:\n1. OpenGraph preview headers.\n2. Semantic body layout.\n3. Complete newsletter submission form.', difficulty: hard, estimatedMinutes: 120, order: 4 }
        ]
      }
    ]
  },
  'css': {
    totalPhases: 3,
    overview: 'Learn Cascading Style Sheets (CSS), the stylesheet language used for describing the presentation of a document written in a markup language. Master layouts, grids, flexbox, and animations.',
    prerequisites: ['Basic HTML knowledge'],
    targetAudience: 'Frontend web designers and developers.',
    estimatedWeeks: 3,
    phases: [
      {
        title: 'Phase 1: Selectors & Box Model',
        description: 'Style html nodes, manage margins, paddings, borders, and colors.',
        order: 1,
        concepts: [
          { title: 'Selectors & Rule Hierarchy', description: 'Understand ID, class, element selectors, and specificity.', content: '# CSS Selectors\n\n\`\`\`css\n/* Specificity: ID (#) > Class (.) > Tag */\n#main-header {\n  color: red;\n}\n.text-bold {\n  font-weight: bold;\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'The Box Model Dimensions', description: 'Manage margin, border, padding, and content dimensions.', content: '# CSS Box Model\n\n\`\`\`css\n.card {\n  width: 300px;\n  padding: 16px;   /* Inside border */\n  border: 1px solid black;\n  margin: 24px;    /* Outside border */\n  box-sizing: border-box; /* Includes padding in width */\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: 'Colors, Backgrounds & Typography', description: 'Styling colors, background images, and fonts.', content: '# Styling Text\n\n\`\`\`css\nbody {\n  font-family: \'Inter\', sans-serif;\n  background-color: #f4f4f4;\n  color: #333;\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Display Rules (Block/Inline)', description: 'Learn inline, block, inline-block, and none.', content: '# Display Rule\n\n\`\`\`css\nspan {\n  display: inline-block;\n  margin: 5px;\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Layouts (Flexbox & Grid)',
        description: 'Create responsive page structures using modern layout engines.',
        order: 2,
        concepts: [
          { title: 'Flexbox Containers and items', description: 'Align elements vertically and horizontally using Flexbox.', content: '# Flexbox Layouts\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: space-between; /* Horizontal alignment */\n  align-items: center;            /* Vertical alignment */\n}\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'CSS Grid Layout Columns', description: 'Design complex 2D layouts using CSS Grid.', content: '# CSS Grid\n\n\`\`\`css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 2 },
          { title: 'Responsive Design & Media Queries', description: 'Adapt UI layouts to fit mobile screens.', content: '# Responsive Media Queries\n\n\`\`\`css\n@media (max-width: 768px) {\n  .grid-container {\n    grid-template-columns: 1fr;\n  }\n}\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 3 },
          { title: 'Absolute & Relative Positioning', description: 'Master layout overlaps using absolute, fixed, and sticky pins.', content: '# CSS Positioning\n\n\`\`\`css\n.parent {\n  position: relative;\n}\n.child {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Transitions, Variables & Themes',
        description: 'Style fluid changes, animate keyframes, and structure reusable CSS variables.',
        order: 3,
        concepts: [
          { title: 'Custom CSS Variables', description: 'Implement design systems using properties variables.', content: '# CSS Variables\n\n\`\`\`css\n:root {\n  --primary-color: #6366f1;\n}\nbutton {\n  background-color: var(--primary-color);\n}\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 1 },
          { title: 'CSS Transitions and Hover States', description: 'Animate visual changes smoothly.', content: '# Transitions\n\n\`\`\`css\nbutton {\n  transition: background-color 0.2s ease-in-out;\n}\nbutton:hover {\n  background-color: #4f46e5;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 30, order: 2 },
          { title: 'Keyframe Animations', description: 'Trigger complex loop animations using keyframes.', content: '# Keyframe Animation\n\n\`\`\`css\n@keyframes spin {\n  100% { transform: rotate(360deg); }\n}\n.spinner {\n  animation: spin 1s linear infinite;\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 50, order: 3 },
          { title: 'Capstone Interactive Grid Project', description: 'Design a responsive, animated dashboard grid layout.', content: '# Capstone CSS Project\n\nAssemble a dashboard featuring:\n1. 3-column responsive grid layout.\n2. Soft hovering styles.\n3. Light/Dark theme configuration utilizing CSS custom properties.', difficulty: hard, estimatedMinutes: 120, order: 4 }
        ]
      }
    ]
  },
  'javascript': {
    totalPhases: 3,
    overview: 'Learn JavaScript, the programming language of the Web. Master modern ES6+ features, asynchronous programming, DOM scripting, and testing.',
    prerequisites: ['Basic HTML/CSS knowledge'],
    targetAudience: 'Aspiring web developers and frontend engineers.',
    estimatedWeeks: 6,
    phases: [
      {
        title: 'Phase 1: Basic Logic & Array Functions',
        description: 'Understand variables, types, loops, logic controls, and native array methods.',
        order: 1,
        concepts: [
          { title: 'Variables, Types and Let/Const', description: 'Understand dynamic typing and scopes.', content: '# JavaScript Variables\n\n\`\`\`javascript\nlet score = 100;\nconst name = "Alice";\n// name = "Bob"; // Throws TypeError\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'Array Iteration (Map/Filter/Reduce)', description: 'Perform functional transformations on arrays.', content: '# Array Map & Filter\n\n\`\`\`javascript\nconst numbers = [1, 2, 3, 4];\nconst doubledEvens = numbers\n  .filter(n => n % 2 === 0)\n  .map(n => n * 2);\nconsole.log(doubledEvens); // [8]\n\`\`\`', difficulty: easy, estimatedMinutes: 50, order: 2 },
          { title: 'Function Closures & Scope', description: 'Understand variables access contexts and lexical closures.', content: '# Function Closures\n\n\`\`\`javascript\nfunction createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst count = createCounter();\nconsole.log(count()); // 1\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 3 },
          { title: 'Basic DOM Manipulations', description: 'Query DOM nodes and handle click events.', content: '# DOM Manipulation\n\n\`\`\`javascript\nconst btn = document.querySelector(\'#my-btn\');\nbtn.addEventListener(\'click\', () => {\n  document.body.style.backgroundColor = \'blue\';\n});\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Asynchronous Event Flows',
        description: 'Master async execution, promises, network queries, and errors.',
        order: 2,
        concepts: [
          { title: 'Callback Queue & Event Loop', description: 'Explain concurrency, call stack, and microtask queues.', content: '# Event Loop\n\nJavaScript is single-threaded. Concurrency is managed via the call stack and event loop.', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Promises & Fetch Requests', description: 'Query remote REST APIs using Promises and fetch.', content: '# Promises & fetch\n\n\`\`\`javascript\nfetch(\'https://api.github.com/users/octocat\')\n  .then(res => res.json())\n  .then(user => console.log(user.login))\n  .catch(err => console.error(err));\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Async / Await syntax', description: 'Write cleaner asynchronous flows using async/await keywords.', content: '# Async Await\n\n\`\`\`javascript\nasync function getUser() {\n  try {\n    const res = await fetch(\'url\');\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error("Fetch failed", err);\n  }\n}\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 3 },
          { title: 'Error propagation & Try/Catch', description: 'Structure error safety around network code.', content: '# Exception Handling\n\n\`\`\`javascript\ntry {\n  throw new Error("API Timeout");\n} catch (e) {\n  console.warn(e.message);\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 4 }
        ]
      },
      {
        title: 'Phase 3: JavaScript Modules & Testing',
        description: 'Export modular classes, manage package modules, and run unit tests.',
        order: 3,
        concepts: [
          { title: 'ES Modules (ESM) vs CommonJS', description: 'Understand import/export syntax vs require.', content: '# ES Modules\n\n\`\`\`javascript\n// math.js\nexport const add = (a, b) => a + b;\n\n// main.js\nimport { add } from \'./math.js\';\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 1 },
          { title: 'Object Prototypes & OOP Classes', description: 'Build reusable structures with prototype chain inheritance.', content: '# JavaScript Classes\n\n\`\`\`javascript\nclass User {\n  constructor(name) {\n    this.name = name;\n  }\n  greet() {\n    return `Hi ${this.name}`;\n  }\n}\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Unit Testing using Jest', description: 'Assert function execution outcomes automatically.', content: '# Testing with Jest\n\n\`\`\`javascript\ntest(\'adds 1 + 2\', () => {\n  expect(add(1, 2)).toBe(3);\n});\n\`\`\`', difficulty: hard, estimatedMinutes: 60, order: 3 },
          { title: 'Capstone Interactive Quiz Game Project', description: 'Write an asynchronous trivia game application from scratch.', content: '# Capstone Quiz Game Project\n\nBuild an application that:\n1. Queries external API trivia questions.\n2. Features dynamic DOM rendering.\n3. Keeps score and calculates answer statistics.', difficulty: hard, estimatedMinutes: 150, order: 4 }
        ]
      }
    ]
  },
  'typescript': {
    totalPhases: 3,
    overview: 'Learn TypeScript, a strongly typed programming language that builds on JavaScript. Master compiler setups, interfaces, generics, utility types, and strict configurations.',
    prerequisites: ['Basic JavaScript knowledge'],
    targetAudience: 'Frontend and backend software engineers.',
    estimatedWeeks: 4,
    phases: [
      {
        title: 'Phase 1: Compiler Setup & Core Types',
        description: 'Initialize tsconfig, use static typing parameters, and define object interfaces.',
        order: 1,
        concepts: [
          { title: 'TS Compiler (tsc) Configurations', description: 'Set up strict configurations in tsconfig.json.', content: '# TSConfig\n\n\`\`\`json\n{\n  "compilerOptions": {\n    "target": "es2022",\n    "module": "commonjs",\n    "strict": true,\n    "esModuleInterop": true\n  }\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'Explicit Primitive Type Annotations', description: 'Declare number, string, boolean, arrays, and tuple structures.', content: '# TS Type Annotations\n\n\`\`\`typescript\nlet active: boolean = true;\nlet scores: number[] = [10, 20];\nlet tuple: [string, number] = ["Alice", 100];\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Interfaces & Custom Types', description: 'Enforce structural objects blueprints using interfaces.', content: '# Interfaces vs Types\n\n\`\`\`typescript\ninterface User {\n    id: number;\n    name: string;\n    role?: string; // Optional property\n}\nconst alice: User = { id: 1, name: "Alice" };\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 3 },
          { title: 'Union and Intersection types', description: 'Combine types dynamically using logical OR/AND symbols.', content: '# Union Types\n\n\`\`\`typescript\ntype Status = "loading" | "success" | "error";\ntype AdminUser = User & { adminKey: string };\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Generics & Utility Helpers',
        description: 'Build flexible code utilities using generic signatures and utility helpers.',
        order: 2,
        concepts: [
          { title: 'Generic Functions & Interfaces', description: 'Declare type variables in functions and structures.', content: '# TS Generics\n\n\`\`\`typescript\nfunction getFirstElement<T>(arr: T[]): T {\n    return arr[0];\n}\nconst str = getFirstElement<string>(["a", "b"]);\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Utility Types (Partial, Omit, Pick)', description: 'Derive custom types from existing schemas.', content: '# Utility Types\n\n\`\`\`typescript\ninterface Task { id: number; text: string; done: boolean; }\ntype NewTask = Omit<Task, \'id\'>; // id is excluded\ntype UpdatedTask = Partial<Task>;  // all fields optional\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Type Guards & Assertions', description: 'Run runtime audits using typeof, instanceof, and key assertions.', content: '# Type Guards\n\n\`\`\`typescript\nfunction check(val: string | number) {\n    if (typeof val === "string") {\n        console.log(val.toUpperCase());\n    }\n}\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 3 },
          { title: 'Enums vs Const Assertions', description: 'Organize configuration states safely.', content: '# Const Assertions\n\n\`\`\`typescript\nconst COLORS = {\n    RED: "#ff0000",\n    BLUE: "#0000ff"\n} as const;\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Classes & Advanced Configurations',
        description: 'Incorporate design patterns, build abstract classes, and run strict compilers.',
        order: 3,
        concepts: [
          { title: 'Abstract Classes and Access Modifiers', description: 'Utilize public, private, protected keywords.', content: '# Access Modifiers\n\n\`\`\`typescript\nabstract class Vehicle {\n    protected model: string;\n    constructor(model: string) { this.model = model; }\n}\nclass Car extends Vehicle {\n    getModel() { return this.model; } // Accessible since it inherits\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 50, order: 1 },
          { title: 'Declaration Files (.d.ts)', description: 'Declare configurations for un-typed legacy dependencies.', content: '# Declaration Files\n\nWrite declaration files to declare types for Javascript libraries:\n\n\`\`\`typescript\ndeclare module "legacy-lib" {\n    export function performAction(): void;\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 60, order: 2 },
          { title: 'TypeScript Decorators Syntax', description: 'Inject annotations on top of classes and method signatures.', content: '# Decorators\n\nDecorators modify behaviors of classes and methods.', difficulty: hard, estimatedMinutes: 55, order: 3 },
          { title: 'Type-Safe HTTP Client Capstone', description: 'Compile an API client wrapper with generic response mappings.', content: '# Capstone TS API Wrapper\n\nCompile a wrapper module that:\n1. Pulls REST endpoints.\n2. Maps data to strict TypeScript types.\n3. Automatically verifies fields integrity at compilation.', difficulty: hard, estimatedMinutes: 140, order: 4 }
        ]
      }
    ]
  },
  'react': {
    totalPhases: 3,
    overview: 'Learn React, the most popular frontend JavaScript library for building user interfaces. Master components, state, hooks, contexts, routing, and state management.',
    prerequisites: ['Basic HTML/CSS/JavaScript knowledge'],
    targetAudience: 'Frontend web developers looking to build modern Single Page Applications (SPAs).',
    estimatedWeeks: 6,
    phases: [
      {
        title: 'Phase 1: UI Components & Basic State',
        description: 'Understand JSX, building components, passing props, and managing basic component state.',
        order: 1,
        concepts: [
          { title: 'JSX & Component Blueprints', description: 'Write HTML tags directly inside JavaScript scripts.', content: '# React Components\n\n\`\`\`jsx\nimport React from \'react\';\n\nfunction Card({ title, content }) {\n  return (\n    <div className="card">\n      <h3>{title}</h3>\n      <p>{content}</p>\n    </div>\n  );\n}\nexport default Card;\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'useState Hook for Local State', description: 'Trigger UI updates on user interactions.', content: '# useState Hook\n\n\`\`\`jsx\nimport React, { useState } from \'react\';\n\nfunction Clicker() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: 'Rendering Collections & Keys', description: 'Loop lists using array map and configure unique keys.', content: '# Rendering Lists\n\n\`\`\`jsx\nconst items = [\'A\', \'B\'];\nreturn (\n  <ul>\n    {items.map((item, idx) => (\n      <li key={idx}>{item}</li>\n    ))}\n  </ul>\n);\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Conditional Rendering Methods', description: 'Show or hide elements based on active boolean parameters.', content: '# Conditional Rendering\n\n\`\`\`jsx\nreturn (\n  <div>\n    {loading ? <p>Loading...</p> : <p>Finished!</p>}\n  </div>\n);\n\`\`\`', difficulty: easy, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Side Effects, Contexts & Performance',
        description: 'Query APIs asynchronously, configure global store providers, and optimize renders.',
        order: 2,
        concepts: [
          { title: 'useEffect Hook for APIs queries', description: 'Execute side effects and clean up event logs.', content: '# useEffect Hook\n\n\`\`\`jsx\nimport React, { useState, useEffect } from \'react\';\n\nfunction Profile() {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    fetch(\'/api/user\')\n      .then(res => res.json())\n      .then(data => setUser(data));\n  }, []); // Empty array runs effect once\n  return <div>{user?.name}</div>;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Context API Global States', description: 'Avoid prop drilling by injecting contexts.', content: '# Context API\n\n\`\`\`jsx\nimport React, { createContext, useContext } from \'react\';\nconst ThemeContext = createContext(\'dark\');\n\nfunction Box() {\n  const theme = useContext(ThemeContext);\n  return <div className={`theme-${theme}`}>Content</div>;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Performance: memo & useCallback', description: 'Prevent unwanted child re-renders.', content: '# React Memoization\n\n\`\`\`jsx\nimport React, { memo, useCallback } from \'react\';\nconst Child = memo(({ onAction }) => <button onClick={onAction}>Do</button>);\n\`\`\`', difficulty: hard, estimatedMinutes: 70, order: 3 },
          { title: 'Custom React Hooks', description: 'Consolidate component states logic into reusable functions.', content: '# Custom Hooks\n\n\`\`\`jsx\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  useEffect(() => {\n    const handle = () => setWidth(window.innerWidth);\n    window.addEventListener(\'resize\', handle);\n    return () => window.removeEventListener(\'resize\', handle);\n  }, []);\n  return width;\n}\n\`\`\`', difficulty: med, estimatedMinutes: 55, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Routing, Redux & Deployments',
        description: 'Navigate routes, integrate redux stores, and build production packages.',
        order: 3,
        concepts: [
          { title: 'React Router Declarations', description: 'Define page paths, routers, links, and URL parameters.', content: '# React Router\n\n\`\`\`jsx\nimport { BrowserRouter, Routes, Route, Link } from \'react-router-dom\';\n// Setup routing\n<BrowserRouter>\n  <Routes>\n    <Route path="/" element={<Home />} />\n  </Routes>\n</BrowserRouter>\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Redux Store (Toolkit) Integrations', description: 'Store global states inside Redux Slices.', content: '# Redux Toolkit\n\nRTK simplifies state management:\n\n\`\`\`javascript\nimport { createSlice } from \'@reduxjs/toolkit\';\nconst counterSlice = createSlice({\n  name: \'counter\',\n  initialState: { value: 0 },\n  reducers: {\n    increment: state => { state.value++; }\n  }\n});\n\`\`\`', difficulty: hard, estimatedMinutes: 80, order: 2 },
          { title: 'React App Compilation builds', description: 'Bundle packages for Vercel/Vite hosts.', content: '# Production Builds\n\n\`\`\`bash\nnpm run build # Produces optimized /dist folder\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 3 },
          { title: 'Capstone React Dashboard Project', description: 'Design a responsive client panel fetching REST APIs.', content: '# Capstone Dashboard Project\n\nAssemble a dashboard featuring:\n1. Routing for Home/Profile/Details panels.\n2. Global Theme contexts.\n3. Dynamic charts mapping values from external API calls.', difficulty: hard, estimatedMinutes: 180, order: 4 }
        ]
      }
    ]
  },
  'next.js': {
    totalPhases: 3,
    overview: 'Learn Next.js, the React framework for production. Master the App Router, Server Components, Server Actions, Server-Side Rendering (SSR), and deployment.',
    prerequisites: ['Basic React and TypeScript knowledge'],
    targetAudience: 'React developers building fast, SEO-friendly web applications.',
    estimatedWeeks: 5,
    phases: [
      {
        title: 'Phase 1: App Router & Server Components',
        description: 'Understand file-system routing, Server vs Client Components, and layout nesting.',
        order: 1,
        concepts: [
          { title: 'App Router File Layouts', description: 'Define routes using folders and layout.tsx/page.tsx files.', content: '# File Routing\n\nNext.js uses directories inside the `app/` folder for routing:\n- `app/page.tsx` represents `/`\n- `app/about/page.tsx` represents `/about`\n- `app/layout.tsx` defines the shared shell wrapper.', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'React Server Components (RSC)', description: 'Understand why server-by-default is faster.', content: '# React Server Components\n\nServer Components fetch data directly from databases/APIs without client bundles:\n\n\`\`\`tsx\n// By default, components in Next.js App Router are Server Components\nexport default async function Page() {\n  const res = await fetch(\'https://api.example.com/items\');\n  const items = await res.data.json();\n  return (\n    <ul>\n      {items.map(item => <li key={item.id}>{item.name}</li>)}\n    </ul>\n  );\n}\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 2 },
          { title: 'Client Components & use client directive', description: 'Add hooks and state using the use client marker.', content: '# Client Components\n\n\`\`\`tsx\n\'use client\'; // Mark component as client-side\n\nimport { useState } from \'react\';\nexport default function ClickCounter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Dynamic Routes & Params', description: 'Extract routing tokens like [id] dynamically.', content: '# Dynamic Routing\n\nCreate a folder named `[id]` to capture URL parameters:\n\n\`\`\`tsx\n// app/posts/[id]/page.tsx\nexport default function PostPage({ params }: { params: { id: string } }) {\n  return <div>Post ID: {params.id}</div>;\n}\n\`\`\`', difficulty: easy, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Data Fetching & Server Actions',
        description: 'Fetch data dynamically on request or statically, and submit mutations securely.',
        order: 2,
        concepts: [
          { title: 'SSR vs SSG vs ISR rendering', description: 'Control rendering strategies using caching parameters.', content: '# Next.js Rendering Strategies\n\n- **SSR (Server-Side Rendering)**: Fetch fresh data on every request.\n- **SSG (Static Site Generation)**: Generate pages at build time.\n- **ISR (Incremental Static Regeneration)**: Update static pages in the background.', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Server Actions Mutation syntax', description: 'Submit forms directly to server endpoints without REST controllers.', content: '# Server Actions\n\nServer Actions allow you to run database code directly on form submissions:\n\n\`\`\`tsx\n// Server Action declared inside form page or separate file\nasync function createPost(formData: FormData) {\n  \'use server\';\n  const title = formData.get(\'title\');\n  // save to DB (e.g. prisma.post.create(...))\n}\n\nexport default function Form() {\n  return (\n    <form action={createPost}>\n      <input type="text" name="title" />\n      <button type="submit">Create</button>\n    </form>\n  );\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 70, order: 2 },
          { title: 'Route Handlers (REST endpoints)', description: 'Expose APIs using GET, POST, DELETE files.', content: '# API Route Handlers\n\n\`\`\`typescript\n// app/api/items/route.ts\nimport { NextResponse } from \'next/server\';\n\nexport async function GET() {\n  return NextResponse.json({ message: "Hello from Next.js!" });\n}\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 3 },
          { title: 'Middleware Config & Edge Routing', description: 'Redirect paths and verify session tokens at the Edge.', content: '# Middleware\n\n\`\`\`typescript\n// middleware.ts\nimport { NextResponse } from \'next/server\';\nimport type { NextRequest } from \'next/server\';\n\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get(\'session\');\n  if (!token) return NextResponse.redirect(new URL(\'/login\', request.url));\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Optimization & Deployments',
        description: 'Optimize images, fonts, meta headers, and deploy to Vercel host.',
        order: 3,
        concepts: [
          { title: 'Next Image & Font Optimizers', description: 'Use Image and Font modules to prevent layout shifts.', content: '# Optimizations\n\n\`\`\`tsx\nimport Image from \'next/image\';\nimport { Inter } from \'next/font/google\';\n\nconst inter = Inter({ subsets: [\'latin\'] });\n<Image src="/logo.jpg" alt="Logo" width={50} height={50} placeholder="blur" />\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 1 },
          { title: 'SEO Metadata Configuration', description: 'Configure Page descriptions and OpenGraph headers statically or dynamically.', content: '# SEO Metadata\n\n\`\`\`typescript\nexport const metadata = {\n  title: \'My Next.js Web App\',\n  description: \'High-performance frontend.\',\n};\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Static Exports & Vercel builds', description: 'Compile statically or deploy incremental endpoints to Vercel.', content: '# Building & Deploying\n\n\`\`\`bash\nnpm run build # Compiles server resources and client pages\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 3 },
          { title: 'Capstone Next.js Blog/E-Commerce App', description: 'Build an optimized e-commerce product feed from scratch.', content: '# Capstone Next.js E-Commerce App\n\nBuild an application with:\n1. Dynamic App routes for items with ISR.\n2. Server Actions handling shopping cart entries.\n3. Meta description and image headers optimized for SEO.', difficulty: hard, estimatedMinutes: 180, order: 4 }
        ]
      }
    ]
  },

  // --- DATA SCIENCE / DATABASES / CLOUD ---
  'docker': {
    totalPhases: 3,
    overview: 'Learn Docker, the open-source platform that automates the deployment of applications inside lightweight, portable containers. Master commands, images, networks, and Docker Compose.',
    prerequisites: ['Basic command line familiarity'],
    targetAudience: 'Software engineers, DevOps engineers, and system administrators.',
    estimatedWeeks: 3,
    phases: [
      {
        title: 'Phase 1: Containers Basics & Commands',
        description: 'Install Docker, run container environments, and inspect logs.',
        order: 1,
        concepts: [
          { title: 'Images vs Containers', description: 'Understand local images and container instances.', content: '# Docker Architecture\n\nAn **Image** is a read-only template containing your code. A **Container** is a runnable instance of an image.', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'Running Containers via CLI', description: 'Run ports forwarding and execute background commands.', content: '# Docker CLI Commands\n\n\`\`\`bash\n# Run a web server container in the background, forwarding port 80\ndocker run -d -p 8080:80 --name my-web nginx\n\n# List running containers\ndocker ps\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: 'Container Logs & Inspection', description: 'Inspect container errors and view print files.', content: '# Logs & Debugging\n\n\`\`\`bash\ndocker logs my-web\ndocker inspect my-web\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Executing Commands in Containers', description: 'Spawn shell prompts inside containers using exec.', content: '# Exec Command\n\n\`\`\`bash\ndocker exec -it my-web bash\n\`\`\`', difficulty: easy, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Custom Images & Networks',
        description: 'Write Dockerfiles, build custom images, and configure container networks.',
        order: 2,
        concepts: [
          { title: 'Writing Dockerfiles', description: 'Use FROM, WORKDIR, COPY, RUN, and CMD commands.', content: '# Creating Dockerfiles\n\n\`\`\`dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 4000\nCMD ["node", "index.js"]\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Building and Tagging Images', description: 'Compile docker files and save custom tags.', content: '# Building Images\n\n\`\`\`bash\ndocker build -t my-app:1.0.0 .\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Persistent Volumes', description: 'Expose local folders to containers to prevent data loss.', content: '# Volumes\n\n\`\`\`bash\ndocker run -v /local/data:/container/data postgres\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 3 },
          { title: 'Docker Bridge Networks', description: 'Create internal networks to let containers speak to each other.', content: '# Container Networking\n\n\`\`\`bash\ndocker network create my-network\ndocker run --network=my-network --name db postgres\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Docker Compose & Registry',
        description: 'Compose multi-container services, and deploy image packs to registries.',
        order: 3,
        concepts: [
          { title: 'Docker Compose Configs', description: 'Write docker-compose.yml files linking databases and APIs.', content: '# Docker Compose\n\n\`\`\`yaml\nversion: \'3.8\'\nservices:\n  web:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      - redis\n  redis:\n    image: redis:alpine\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Compose commands', description: 'Start and stop compose services.', content: '# Docker Compose Commands\n\n\`\`\`bash\ndocker-compose up -d --build\ndocker-compose down\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Pushing to Docker Hub Registry', description: 'Log in and push images to registries.', content: '# Image Registries\n\n\`\`\`bash\ndocker login\ndocker tag my-app:1.0.0 username/my-app:1.0.0\ndocker push username/my-app:1.0.0\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 3 },
          { title: 'Dockerized microservice stack Capstone', description: 'Build and containerize a React/Express/Postgres application stack.', content: '# Capstone Docker Project\n\nCompose a local project containing:\n1. Dockerfile configuration for client panel.\n2. Dockerfile configuration for REST API.\n3. Linkage setup using Docker compose including a PostgreSQL DB database.', difficulty: hard, estimatedMinutes: 150, order: 4 }
        ]
      }
    ]
  },
  'kubernetes': {
    totalPhases: 3,
    overview: 'Learn Kubernetes (K8s), the container orchestration system. Master pods, deployments, services, namespaces, configuration maps, and cluster scaling.',
    prerequisites: ['Docker Container foundations'],
    targetAudience: 'DevOps engineers, backend developers, and system architects.',
    estimatedWeeks: 5,
    phases: [
      {
        title: 'Phase 1: Pods & Deployments',
        description: 'Understand the control plane, define pod configurations, and manage replica sets.',
        order: 1,
        concepts: [
          { title: 'K8s Cluster Architecture', description: 'Understand Control Plane nodes, API server, Kubelet, and worker nodes.', content: '# K8s Architecture\n\nKubernetes orchestrates container scaling:\n- **Control Plane**: Manages state (etcd, API server).\n- **Nodes**: Run containerized applications (kubelet, kube-proxy).', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'YAML Pod Declarations', description: 'Write configurations to deploy container pods.', content: '# Pod Manifests\n\n\`\`\`yaml\napiVersion: v1\nkind: Pod\nmetadata:\n  name: my-app\n  labels:\n    app: web\nspec:\n  containers:\n  - name: web\n    image: nginx:alpine\n    ports:\n    - containerPort: 80\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: 'Deployments and ReplicaSets', description: 'Scale applications automatically using deployments.', content: '# Deployments\n\n\`\`\`yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-deploy\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:alpine\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 3 },
          { title: 'Kubectl commands', description: 'Deploy and audit items using kubectl apply/get.', content: '# Kubectl Command CLI\n\n\`\`\`bash\nkubectl apply -f deployment.yaml\nkubectl get pods\nkubectl logs <pod-name>\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Services & Ingress Configs',
        description: 'Expose port routes, link internal pods, and balance ingress traffic.',
        order: 2,
        concepts: [
          { title: 'ClusterIP vs NodePort Services', description: 'Connect pods internally or expose them on host ports.', content: '# Services\n\n\`\`\`yaml\napiVersion: v1\nkind: Service\nmetadata:\n  name: web-service\nspec:\n  type: NodePort\n  selector:\n    app: web\n  ports:\n  - port: 80\n    targetPort: 80\n    nodePort: 30080\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Ingress Controller Setup', description: 'Route domains and web paths directly to services.', content: '# Ingress Controller\n\nIngress acts as a load-balancing reverse proxy routing domains to services.', difficulty: hard, estimatedMinutes: 70, order: 2 },
          { title: 'ConfigMaps & Secrets', description: 'Store env keys and credentials securely outside containers.', content: '# Secrets & Config\n\n\`\`\`yaml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  API_URL: "https://api.domain.com"\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 3 },
          { title: 'Health Probes (Liveness/Readiness)', description: 'Configure health checks to restart failing containers.', content: '# Health Probes\n\n\`\`\`yaml\nlivenessProbe:\n  httpGet:\n    path: /health\n    port: 8080\n  initialDelaySeconds: 15\n\`\`\`', difficulty: med, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Persistent Volumes & Autoscaling',
        description: 'Provision cloud disk mounts, scale replicas, and inspect cluster metrics.',
        order: 3,
        concepts: [
          { title: 'PersistentVolume & Claim Claims', description: 'Bind block storage disks to container nodes.', content: '# PV & PVC\n\nMount storage to pods:\n\n- **PersistentVolume (PV)**: Cluster-level storage disk.\n- **PersistentVolumeClaim (PVC)**: Request by pod to mount storage.', difficulty: hard, estimatedMinutes: 60, order: 1 },
          { title: 'Horizontal Pod Autoscaler (HPA)', description: 'Automatically scale replicas based on CPU usage.', content: '# Autoscaling\n\n\`\`\`bash\nkubectl autoscale deployment web-deploy --cpu-percent=80 --min=3 --max=10\n\`\`\`', difficulty: hard, estimatedMinutes: 55, order: 2 },
          { title: 'Helm Charts deployment', description: 'Package and deploy services using Helm charts.', content: '# Helm Package Manager\n\n\`\`\`bash\nhelm repo add bitnami https://charts.bitnami.com/bitnami\nhelm install my-db bitnami/postgresql\n\`\`\`', difficulty: med, estimatedMinutes: 40, order: 3 },
          { title: 'Deploying High-Availability REST Cluster Capstone', description: 'Design a self-healing REST api service stack.', content: '# Capstone Cluster Design\n\nAssemble and execute cluster deployments featuring:\n1. 3-replica backend API deployment.\n2. Service exposing the API via a ClusterIP.\n3. ConfigMap storing db variables.\n4. Liveness check monitoring endpoints.', difficulty: hard, estimatedMinutes: 160, order: 4 }
        ]
      }
    ]
  },
  'aws': {
    totalPhases: 3,
    overview: 'Learn Amazon Web Services (AWS), the world\'s most comprehensive and broadly adopted cloud platform. Master EC2, S3, RDS, Lambda, IAM, and VPC configs.',
    prerequisites: ['Basic systems networking familiarity'],
    targetAudience: 'Cloud engineers, solutions architects, and systems developers.',
    estimatedWeeks: 6,
    phases: [
      {
        title: 'Phase 1: Basic Compute & Storage',
        description: 'Deploy cloud virtual machines (EC2) and store files in S3 buckets.',
        order: 1,
        concepts: [
          { title: 'AWS Global Infrastructure Overview', description: 'Understand Regions, Availability Zones, and Edge locations.', content: '# AWS Infrastructure\n\n- **Regions**: Physical geographic areas holding datacenters.\n- **Availability Zones (AZs)**: Isolated datacenters within a region.', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'EC2 Virtual Machine Installs', description: 'Launch Linux instances, configure keypairs, and assign security groups.', content: '# Amazon EC2\n\nEC2 provides resizable virtual machine compute instances.\n- Configure **Security Groups** acting as virtual firewalls to control port access (e.g. enable port 80/22).', difficulty: easy, estimatedMinutes: 50, order: 2 },
          { title: 'S3 Simple Storage Buckets', description: 'Upload static assets, configure bucket policies, and build static websites.', content: '# Amazon S3\n\nS3 stores object files (unstructured data):\n- **Buckets**: Global unique folders.\n- **Storage Classes**: Standard, IA (Infrequent Access), and Glacier.', difficulty: easy, estimatedMinutes: 40, order: 3 },
          { title: 'RDS Database Provisioning', description: 'Spin up managed PostgreSQL or MySQL database instances.', content: '# Amazon RDS\n\nRDS automates SQL backups, patching, and replication.', difficulty: med, estimatedMinutes: 45, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Identity Access & VPC Networks',
        description: 'Secure resources using IAM roles, and configure private cloud networks.',
        order: 2,
        concepts: [
          { title: 'IAM Users, Groups & Policies', description: 'Manage security access keys using policy configurations.', content: '# AWS IAM\n\nIAM governs cloud permissions:\n- **Users**: Individuals requesting console/CLI access.\n- **Roles**: Temporary permissions assigned to AWS services (like allowing EC2 to write to S3).', difficulty: med, estimatedMinutes: 55, order: 1 },
          { title: 'Virtual Private Cloud (VPC) Subnets', description: 'Design network layout subnet tables, NAT gateways, and internet gateways.', content: '# Amazon VPC\n\nVPC isolates your cloud network:\n- **Public Subnet**: Direct internet routing via Internet Gateway (IGW).\n- **Private Subnet**: No external routing; accesses updates via NAT Gateway.', difficulty: hard, estimatedMinutes: 75, order: 2 },
          { title: 'Elastic Load Balancer (ELB)', description: 'Route incoming traffic across multiple EC2 targets.', content: '# Application Load Balancer\n\nALB distributes web traffic across auto-scaling groups based on routing rules.', difficulty: med, estimatedMinutes: 45, order: 3 },
          { title: 'Auto Scaling Groups (ASG)', description: 'Deploy dynamic rules to spawn instances based on CPU usage.', content: '# Auto Scaling\n\nASG automatically starts or terminates instances to handle workload changes.', difficulty: med, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Serverless & Automation Infrastructure',
        description: 'Deploy code on trigger functions (Lambda) and write automated infrastructure scripts.',
        order: 3,
        concepts: [
          { title: 'Serverless Functions (AWS Lambda)', description: 'Deploy event-triggered Javascript or Python code.', content: '# AWS Lambda\n\nExecute code serverlessly without provisioning underlying VMs:\n\n\`\`\`python\ndef lambda_handler(event, context):\n    return {\n        \'statusCode\': 200,\n        \'body\': \'Hello from serverless Lambda!\'\n    }\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'API Gateway router integration', description: 'Map HTTP paths to Lambda triggers.', content: '# API Gateway\n\nAPI Gateway handles traffic routing, authentication, and rate limiting for Lambda functions.', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Infrastructure as Code (CloudFormation / Terraform)', description: 'Write script config files to spawn full stacks.', content: '# Infrastructure as Code\n\n\`\`\`yaml\nResources:\n  MyBucket:\n    Type: AWS::S3::Bucket\n    Properties:\n      BucketName: unique-learnflow-bucket\n\`\`\`', difficulty: hard, estimatedMinutes: 65, order: 3 },
          { title: 'HA Web Stack AWS Deployment Capstone', description: 'Design a load-balanced, secure network stack.', content: '# Capstone Cloud Solution\n\nMap a web deployment containing:\n1. VPC featuring Public and Private subnets.\n2. Load balancer distributing requests to EC2 instances.\n3. Managed RDS databases tucked securely inside a private subnet.\n4. Dynamic CloudFormation script configuration.', difficulty: hard, estimatedMinutes: 160, order: 4 }
        ]
      }
    ]
  },
  'git': {
    totalPhases: 3,
    overview: 'Learn Git, the industry-standard distributed version control system. Master commits, branching, merging, rebasing, stash management, and resolving conflicts.',
    prerequisites: ['Basic terminal usage'],
    targetAudience: 'Software developers, writers, and technical collaborators.',
    estimatedWeeks: 2,
    phases: [
      {
        title: 'Phase 1: Basic Version Control',
        description: 'Initialize repositories, write commits, and track local file changes.',
        order: 1,
        concepts: [
          { title: 'Git Repository Initialization', description: 'Create local repositories using git init.', content: '# Git Init & Status\n\n\`\`\`bash\n# Initialize local repo\ngit init\n\n# Inspect modified files\ngit status\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'Staging Area & Commits', description: 'Add files to stage and save commits.', content: '# Commits\n\n\`\`\`bash\ngit add index.html\ngit commit -m "Initialize project page"\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Reviewing Repository History (git log)', description: 'Review commit histories and difference markers.', content: '# Git Logs\n\n\`\`\`bash\ngit log --oneline\ngit diff\n\`\`\`', difficulty: easy, estimatedMinutes: 25, order: 3 },
          { title: 'Discarding local modifications', description: 'Revert uncommitted file changes safely.', content: '# Restoring Files\n\n\`\`\`bash\ngit restore index.html\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Branching & Collaboration',
        description: 'Create development branches, merge updates, and resolve overlap conflicts.',
        order: 2,
        concepts: [
          { title: 'Creating and Switching Branches', description: 'Organize features isolated on branches.', content: '# Branching\n\n\`\`\`bash\ngit branch feature-login\ngit checkout feature-login\n# Or shorthand:\ngit checkout -b feature-login\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'Merging Branches', description: 'Merge updates back into the main branch.', content: '# Merging\n\n\`\`\`bash\ngit checkout main\ngit merge feature-login\n\`\`\`', difficulty: easy, estimatedMinutes: 40, order: 2 },
          { title: 'Resolving Merge Conflicts', description: 'Read conflict marker blocks and edit files to resolve.', content: '# Resolving Conflicts\n\nWhen two branches edit the same line of a file:\n\n\`\`\`text\n<<<<<<< HEAD\nconsole.log("main branch edit");\n=======\nconsole.log("feature branch edit");\n>>>>>>> feature-login\n\`\`\`\n\nEdit the file to pick a version, then add and commit.', difficulty: med, estimatedMinutes: 60, order: 3 },
          { title: 'Linking Remote Repositories', description: 'Configure push/pull URLs to backup repositories.', content: '# Remotes\n\n\`\`\`bash\ngit remote add origin https://github.com/user/repo.git\ngit push -u origin main\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Advanced Git Operations',
        description: 'Rebase commits, stash changes, rewrite log histories, and coordinate teams.',
        order: 3,
        concepts: [
          { title: 'Rebasing Commits', description: 'Linearize your commit history using git rebase.', content: '# Rebasing\n\nRebase applies commits on top of another base branch, creating a clean linear history:\n\n\`\`\`bash\ngit checkout feature-login\ngit rebase main\n\`\`\`', difficulty: hard, estimatedMinutes: 60, order: 1 },
          { title: 'Stashing Uncommitted Work', description: 'Save uncommitted progress temporarily.', content: '# Git Stash\n\n\`\`\`bash\ngit stash\ngit checkout hotfix-branch\n# ... do fix ...\ngit checkout feature-branch\ngit stash pop\n\`\`\`', difficulty: med, estimatedMinutes: 35, order: 2 },
          { title: 'Interactive Rewrites (squash/amend)', description: 'Rewrite commit messages and squash small logs.', content: '# Amending Commits\n\n\`\`\`bash\ngit commit --amend -m "Updated message"\ngit rebase -i HEAD~3 # Interactive rebasing\n\`\`\`', difficulty: hard, estimatedMinutes: 50, order: 3 },
          { title: 'Team Git Flow Capstone Project', description: 'Participate in a mock feature development flow.', content: '# Capstone Git Project\n\nSimulate team operations:\n1. Spawn feature branch.\n2. Save 3 commits, squash into 1.\n3. Merge main updates, resolving a mock conflict.\n4. Push back to backup origins.', difficulty: hard, estimatedMinutes: 120, order: 4 }
        ]
      }
    ]
  },
  'devops': {
    totalPhases: 3,
    overview: 'Learn DevOps engineering. Master continuous integration (CI), continuous delivery (CD), infrastructure automation, container orchestration, and monitoring.',
    prerequisites: ['Basic Linux command line', 'Familiarity with at least one programming language'],
    targetAudience: 'Software developers, systems administrators, and aspiring site reliability engineers.',
    estimatedWeeks: 12,
    phases: [
      {
        title: 'Phase 1: Linux Administration & Shell Scripting',
        description: 'Understand server maintenance, write bash scripts, and configure basic network firewalls.',
        order: 1,
        concepts: [
          { title: 'Linux Administration & Command Line', description: 'Perform file system operations and analyze processes.', content: '# Linux Administration\n\n\`\`\`bash\n# Check server memory consumption\nfree -m\n# View system processes\ntop\n# View disk utilization\ndf -h\n\`\`\`', difficulty: easy, estimatedMinutes: 45, order: 1 },
          { title: 'Bash Scripting Automation', description: 'Write automated loops and file backup routines.', content: '# Bash Shell Scripting\n\n\`\`\`bash\n#!/bin/bash\nfor file in /var/log/*.log; do\n    echo "Backing up $file"\n    tar -czf "${file}.tar.gz" "$file"\ndone\n\`\`\`', difficulty: easy, estimatedMinutes: 60, order: 2 },
          { title: 'SSH & Key Authentication', description: 'Generate public/private SSH key pairs to access servers securely.', content: '# SSH Connections\n\n\`\`\`bash\nssh-keygen -t rsa -b 4096\nssh-copy-id username@remote-server-ip\nssh username@remote-server-ip\n\`\`\`', difficulty: easy, estimatedMinutes: 35, order: 3 },
          { title: 'Systemd & Daemon Configuration', description: 'Expose local services as system daemons.', content: '# Daemon Service Config\n\n\`\`\`text\n# /etc/systemd/system/myapp.service\n[Service]\nExecStart=/usr/bin/node /app/index.js\nRestart=always\n\`\`\`', difficulty: med, estimatedMinutes: 45, order: 4 }
        ]
      },
      {
        title: 'Phase 2: CI/CD Pipelines & Infrastructure as Code',
        description: 'Automate build workflows and manage servers declaratively.',
        order: 2,
        concepts: [
          { title: 'CI/CD Pipelines (GitHub Actions / GitLab CI)', description: 'Write automated test/build/deploy pipelines.', content: '# GitHub Actions Workflow\n\n\`\`\`yaml\nname: Node.js CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - name: Use Node.js\n      uses: actions/setup-node@v4\n    - run: npm install\n    - run: npm test\n\`\`\`', difficulty: med, estimatedMinutes: 75, order: 1 },
          { title: 'Infrastructure as Code (IaC) with Terraform', description: 'Provision databases and compute instances via code configuration.', content: '# Terraform IaC\n\n\`\`\`hcl\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n}\n\`\`\`', difficulty: hard, estimatedMinutes: 90, order: 2 },
          { title: 'Configuration Management with Ansible', description: 'Configure packages and copy settings files across multiple servers.', content: '# Ansible Playbooks\n\n\`\`\`yaml\n- hosts: webservers\n  tasks:\n    - name: install nginx\n      apt: name=nginx state=latest\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 3 },
          { title: 'Docker Registry & Containers Hosting', description: 'Publish images to Docker Hub and host containers locally.', content: '# Hosting Containers\n\n\`\`\`bash\ndocker run -d -p 80:80 nginx:alpine\n\`\`\`', difficulty: easy, estimatedMinutes: 30, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Kubernetes Orchestration & System Monitoring',
        description: 'Configure pod clusters, trace metrics, and manage logs.',
        order: 3,
        concepts: [
          { title: 'Kubernetes Pods & Deployments', description: 'Deploy self-healing, load-balanced clusters.', content: '# Kubernetes Deployment\n\nDeploy replicas to handle traffic spikes.', difficulty: hard, estimatedMinutes: 90, order: 1 },
          { title: 'Metrics Monitoring with Prometheus & Grafana', description: 'Trace CPU, memory, and database latencies.', content: '# Prometheus Monitoring\n\nPrometheus scrapes endpoints (e.g. `/metrics`) and records time series databases. Grafana formats dashboards to inspect this data.', difficulty: hard, estimatedMinutes: 80, order: 2 },
          { title: 'Centralized Logging (ELK/EFK Stack)', description: 'Consolidate error logs into Elasticsearch/Kibana tables.', content: '# Logging\n\nFluentd or Logstash captures standard output logs from all containers and pushes them to Elasticsearch, enabling real-time index searches.', difficulty: hard, estimatedMinutes: 75, order: 3 },
          { title: 'Automated CI/CD Deployment Cluster Capstone', description: 'Build a fully automated delivery pipelines pipeline.', content: '# Capstone DevOps Pipeline\n\nDesign a workflow that:\n1. Triggers on code push.\n2. Runs unit tests.\n3. Compiles a Docker image, tagging and pushing it to a Registry.\n4. Executes kubectl rollout commands to deploy to a cluster.', difficulty: hard, estimatedMinutes: 180, order: 4 }
        ]
      }
    ]
  },

  // --- CREATIVE / HOBBY / OTHER ---
  'guitar': {
    totalPhases: 3,
    overview: 'Learn to play the guitar from absolute scratch. Master tuning, basic chords, strumming rhythms, reading tabs, and basic musical scales.',
    prerequisites: ['An acoustic or electric guitar', 'No musical experience required'],
    targetAudience: 'Aspiring musicians and hobbyists.',
    estimatedWeeks: 8,
    phases: [
      {
        title: 'Phase 1: Basic Mechanics & First Chords',
        description: 'Learn parts of the guitar, correct postures, tuning, and basic open chords.',
        order: 1,
        concepts: [
          { title: 'Guitar Anatomy & Tuning', description: 'Understand frets, strings (E A D G B E), and tuning with clip-on tuners.', content: '# Guitar Tuning & Strings\n\nStrings from thickest to thinnest are:\n1. **E** (6th string)\n2. **A** (5th string)\n3. **D** (4th string)\n4. **G** (3rd string)\n5. **B** (2nd string)\n6. **E** (1st string - thinnest)\n\nUse standard tuning apps or clip-on chromatic tuners before each practice session!', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'The E Minor and A Minor Chords', description: 'Learn your first two-finger open position chords.', content: '# Em and Am Chords\n\nThese chords use open strings and only require 2 or 3 fingers on the fretboard:\n\n### E Minor (Em):\n- Middle finger: 2nd fret of A string\n- Ring finger: 2nd fret of D string\n- Strum all 6 strings.\n\n### A Minor (Am):\n- Middle finger: 2nd fret of D string\n- Ring finger: 2nd fret of G string\n- Index finger: 1st fret of B string\n- Strum 5 strings (mute 6th string).', difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: 'Strumming Rhythm (4/4 time)', description: 'Master downstrokes and upstrokes matching simple beats.', content: '# Strumming Rhythms\n\nPractice matching a metronome set to 60 BPM:\n- Down, Down, Down, Down (Quarter notes)\n- Down, Up, Down, Up (Eighth notes)\n\nKeep your wrist relaxed and fluid!', difficulty: easy, estimatedMinutes: 40, order: 3 },
          { title: 'C Major & G Major Chords', description: 'Add 3-finger open chords to play your first songs.', content: '# C and G Major Chords\n\n### G Major:\n- Index: 2nd fret of A string\n- Middle: 3rd fret of Low E string\n- Ring: 3rd fret of B string\n- Pinky: 3rd fret of High E string\n\n### C Major:\n- Ring: 3rd fret of A string\n- Middle: 2nd fret of D string\n- Index: 1st fret of B string', difficulty: easy, estimatedMinutes: 45, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Chord Transitions & Guitar Tabs',
        description: 'Smoothly switch between major/minor chords, read tabs, and strum syncopated patterns.',
        order: 2,
        concepts: [
          { title: 'Reading Guitar Tablature (Tabs)', description: 'Translate lines and numbers on sheet pages directly to frets.', content: '# Reading Tabs\n\nGuitar tabs feature 6 lines representing the strings (High E at the top, Low E at the bottom):\n\n\`\`\`text\ne|-----0-----------------|\nB|-------1---------------|\nG|---------2-------------|\nD|-----------2-----------|\nA|---0-------------------|\nE|-----------------------|\n\`\`\`\n\nThe numbers represent the fret you should press. A `0` indicates an open string.', difficulty: easy, estimatedMinutes: 45, order: 1 },
          { title: 'Chord Switching & Pivot Fingers', description: 'Drills to switch between C, G, Em, Am without stopping the rhythm.', content: '# Transition Drills\n\n1. Hold a G chord for 4 beats, strumming once.\n2. Take your hand off completely.\n3. Position your fingers on the C chord.\n4. Repeat 10 times to build muscle memory.', difficulty: easy, estimatedMinutes: 60, order: 2 },
          { title: 'The D Major and F Major (Mini) Chords', description: 'Introduce the D shape and the half-barre F chord.', content: '# D Major and F Chords\n\n### D Major:\n- Index: 2nd fret of G string\n- Ring: 3rd fret of B string\n- Middle: 2nd fret of High E string\n\n### F Major (Mini):\n- Index: 1st fret of both E and B strings (mini-barre)\n- Middle: 2nd fret of G string\n- Ring: 3rd fret of D string', difficulty: med, estimatedMinutes: 50, order: 3 },
          { title: 'Syncopated Strumming (The Campfire Beat)', description: 'Strum: Down, Down-Up, Up-Down-Up rhythm.', content: '# The Campfire Pattern\n\nA widely applicable rhythm for pop and folk songs:\n- **D, D-U, U-D-U**\n- Note: The upstroke on beat 3 has no preceding downstroke, creating a syncopated skip.', difficulty: med, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Barre Chords & Scales Basics',
        description: 'Master full barre chords shapes, learn the pentatonic scale, and practice solos.',
        order: 3,
        concepts: [
          { title: 'Full F-Shape Barre Chords', description: 'Build thumb/index strength to barre all strings with your index finger.', content: '# F Barre Chord\n\n- Index: Barres all strings on the 1st fret.\n- Ring: 3rd fret of A string.\n- Pinky: 3rd fret of D string.\n- Middle: 2nd fret of G string.\n\nKeep your index finger close to the metal fret wire to prevent buzzing!', difficulty: hard, estimatedMinutes: 90, order: 1 },
          { title: 'Minor Pentatonic Scale (Pattern 1)', description: 'The absolute best scale blueprint for guitar solos.', content: '# Minor Pentatonic Scale\n\nPlay this pattern on the 5th fret (A Minor Pentatonic):\n\n\`\`\`text\ne|---------------------------5-8-|\nB|-----------------------5-8-----|\nG|-------------------5-7---------|\nD|---------------5-7-------------|\nA|-----------5-7-----------------|\nE|---5-8-------------------------|\n\`\`\`', difficulty: med, estimatedMinutes: 60, order: 2 },
          { title: 'Fingerpicking Basics (Travis Picking)', description: 'Pluck individual strings using your thumb, index, and middle fingers.', content: '# Fingerstyle Basics\n\n- Thumb: Plays baseline strings (6, 5, or 4).\n- Index: Plays G string.\n- Middle: Plays B string.\n- Ring: Plays High E string.\n\nPractice plucking sequentially without using a pick.', difficulty: med, estimatedMinutes: 70, order: 3 },
          { title: 'Acoustic Cover Capstone Performance', description: 'Perform a 3-chord song cover with syncopated strumming.', content: '# Capstone Song Performance\n\nRecord/Perform a full song using:\n1. Correct tuning.\n2. Consistent rhythm (using the Campfire beat).\n3. Clean transitions between G, C, Em, and D.', difficulty: hard, estimatedMinutes: 150, order: 4 }
        ]
      }
    ]
  },
  'baking': {
    totalPhases: 3,
    overview: 'Learn the principles of baking. Master ingredients measurements, temperature control, dough proofing, yeast activation, and baking techniques.',
    prerequisites: ['A kitchen oven', 'Measuring scale and mixing bowls'],
    targetAudience: 'Home cooks, pastry enthusiasts, and baking hobbyists.',
    estimatedWeeks: 6,
    phases: [
      {
        title: 'Phase 1: Science of Baking & Cookies',
        description: 'Understand dry/wet ratios, oven dynamics, and bake classic cookies.',
        order: 1,
        concepts: [
          { title: 'Measuring by Weight vs Volume', description: 'Understand why scales are always superior to cups in baking.', content: '# Weighing Ingredients\n\nFlour can pack differently in cups, causing dry or dense bakes. Always measure by weight (Grams) for consistent results:\n- **1 cup of all-purpose flour** = roughly 120 grams.\n- Always zero (tare) your digital scale with the bowl on top before adding ingredients.', difficulty: easy, estimatedMinutes: 30, order: 1 },
          { title: 'Leavening Agents: Baking Soda vs Powder', description: 'Understand chemical reactions in doughs.', content: '# Leavening Agents\n\n- **Baking Soda**: Pure sodium bicarbonate. Requires an acidic ingredient (lemon, buttermilk, brown sugar) to activate and release carbon dioxide.\n- **Baking Powder**: Contains sodium bicarbonate AND an acidifying agent. Only requires moisture and heat to activate.', difficulty: easy, estimatedMinutes: 40, order: 2 },
          { title: 'Gluten Structure & Flour Types', description: 'Learn the differences between Cake, All-Purpose, and Bread flours.', content: '# Flour Gluten Content\n\nGluten provides elasticity and chewiness:\n\n| Flour Type | Protein Content | Best Use Cases |\n| :--- | :--- | :--- |\n| **Cake Flour** | 7-9% | Light, fluffy cakes |\n| **All-Purpose** | 10-12% | Cookies, quick breads, pastries |\n| **Bread Flour** | 12-14% | Chewy breads, pizza doughs |', difficulty: easy, estimatedMinutes: 30, order: 3 },
          { title: 'Baking Chocolate Chip Cookies', description: 'Master creaming butter, folding ingredients, and checking bake times.', content: '# Chocolate Chip Cookies\n\n1. **Creaming**: Beat softened butter with white and brown sugars until light and fluffy (incorporates air).\n2. **Folding**: Gently combine dry ingredients into wet ingredients just until mixed (prevents gluten over-development).', difficulty: easy, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Yeast Breads & Proofing',
        description: 'Learn to activate yeast, knead doughs, and manage rise temperatures.',
        order: 2,
        concepts: [
          { title: 'Activating Active Dry Yeast', description: 'Dissolve yeast in warm water (105-110°F) with a pinch of sugar.', content: '# Activating Yeast\n\nYeast is a living organism:\n- Water too cold (<95°F) keeps yeast dormant.\n- Water too hot (>120°F) kills yeast.\n- Sugar feeds yeast, releasing carbon dioxide bubbles.', difficulty: easy, estimatedMinutes: 35, order: 1 },
          { title: 'Kneading Techniques & Windowpane Test', description: 'Develop gluten networks through folding and stretching.', content: '# Kneading Dough\n\nKnead dough on a lightly floured surface for 8-10 minutes.\n\n### The Windowpane Test\nStretch a small piece of dough. If it stretches paper-thin without tearing, letting light pass through, the gluten is sufficiently developed!', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'The Proofing (Rising) Phase', description: 'Allow dough to rise in a warm, draft-free place until doubled in size.', content: '# Proofing Dough\n\n- **First Rise**: Yeast consumes sugars, building volume.\n- **Second Rise (Shaped)**: Shape dough into loaves or rolls, let rise again before baking to prevent dense interiors.', difficulty: med, estimatedMinutes: 40, order: 3 },
          { title: 'Baking a Crusty White Loaf', description: 'Configure oven steam, score the top, and bake to golden brown.', content: '# Crusty Bread Bake\n\n- **Scoring**: Slash the top of the loaf with a sharp blade (lamé) to allow steam to escape cleanly without cracking the crust.\n- **Steam**: Place a tray of hot water in the bottom of the oven during the first 10 minutes to keep the crust soft, allowing maximum rise.', difficulty: med, estimatedMinutes: 60, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Pastry Dough & Piping Bag Techniques',
        description: 'Master laminated doughs, make cream puffs, and frost cakes.',
        order: 3,
        concepts: [
          { title: 'Lamination & Flaky Pie Crusts', description: 'Cut cold butter into flour to create thin, flaky layers.', content: '# Laminated Doughs\n\n- Butter must remain **COLD**. When cold butter hits a hot oven, the water in the butter evaporates into steam, pushing the flour layers apart to create flakes.', difficulty: hard, estimatedMinutes: 75, order: 1 },
          { title: 'Choux Pastry (Cream Puffs)', description: 'Cook flour/water paste, beat in eggs, and pipe puffs.', content: '# Choux Pastry (Pâte à Choux)\n\nChoux pastry rises solely from steam moisture. Cook flour, water, and butter on the stove, beat in eggs until a shiny ribbon forms, then pipe onto trays.', difficulty: hard, estimatedMinutes: 80, order: 2 },
          { title: 'Frostings & Piping Bag Control', description: 'Prepare buttercream, fill bags, and pipe borders or stars.', content: '# Buttercream & Piping\n\n- Whip butter and powdered sugar until smooth.\n- Cut a piping bag, insert a star tip, fill, twist the top to create pressure, and pipe consistent borders.', difficulty: med, estimatedMinutes: 50, order: 3 },
          { title: 'Classic Fruit Tart Capstone Bake', description: 'Bake a sweet pastry shell, fill with pastry cream, and glaze fruits.', content: '# Capstone Fruit Tart Guidelines\n\nBake a tart featuring:\n1. Crisp, crumbly shortbread shell.\n2. Smooth vanilla pastry cream (creme patissiere).\n3. Artfully arranged fresh fruits glazed with apricot jam.', difficulty: hard, estimatedMinutes: 150, order: 4 }
        ]
      }
    ]
  },
  'french': {
    totalPhases: 3,
    overview: 'Learn French pronunciation, key vocabulary, verbs conjugation, and grammar structures to speak and understand basic conversational French.',
    prerequisites: ['No prior language knowledge required'],
    targetAudience: 'Travelers, language students, and hobbyists.',
    estimatedWeeks: 10,
    phases: [
      {
        title: 'Phase 1: Alphabet & Essential Greetings',
        description: 'Master French letter sounds, greet others, and introduce yourself.',
        order: 1,
        concepts: [
          { title: 'French Alphabet & Nasal Vowels', description: 'Learn letter pronunciations and nasal vowel sounds (an, en, in, on).', content: '# Pronunciation Basics\n\nFrench features silent final consonants and liaisons:\n- **Liaison**: Pronouncing the silent end consonant of a word when the next word starts with a vowel (e.g. *les amis* = le-zami).', difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: 'Basic Greetings & Salutations', description: 'Say Bonjour, Salut, Comment ça va, and Au revoir.', content: '# Greetings\n\n- *Bonjour* (Hello / Good day)\n- *Salut* (Hi / Bye - informal)\n- *S\'il vous plaît* (Please - formal)\n- *Merci* (Thank you)', difficulty: easy, estimatedMinutes: 30, order: 2 },
          { title: 'Introducing Yourself & Nouns Gender', description: 'State your name and understand Masculine vs Feminine nouns.', content: '# Introducing Yourself\n\n\`Je m\'appelle...\` (My name is...)\n\nEvery French noun has a gender (le/la, un/une):\n- *Le livre* (The book - masculine)\n- *La table* (The table - feminine)', difficulty: easy, estimatedMinutes: 45, order: 3 },
          { title: 'Numbers 1 to 50 & Calendar', description: 'Count, say days of the week, months, and state your age.', content: '# Numbers & Dates\n\nCount to ten:\n*un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix.*', difficulty: easy, estimatedMinutes: 35, order: 4 }
        ]
      },
      {
        title: 'Phase 2: Core Verbs & Simple Sentences',
        description: 'Conjugate high-frequency verbs in the present tense and construct basic sentences.',
        order: 2,
        concepts: [
          { title: 'The Auxiliary Verbs: Être & Avoir', description: 'Conjugate To Be (être) and To Have (avoir) in the present tense.', content: '# Être & Avoir\n\nThese verbs are highly irregular and used constantly:\n\n### Être (To Be):\n- Je suis, Tu es, Il/Elle est\n- Nous sommes, Vous êtes, Ils/Elles sont\n\n### Avoir (To Have):\n- J\'ai, Tu as, Il/Elle a\n- Nous avons, Vous avez, Ils/Elles ont', difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: 'Regular -ER Verbs Conjugation', description: 'Conjugate common verbs like parler (to speak) and manger (to eat).', content: '# -ER Verbs\n\nDrop the "-er" and add endings: -e, -es, -e, -ons, -ez, -ent:\n- *Je parle* (I speak)\n- *Nous parlons* (We speak)', difficulty: med, estimatedMinutes: 50, order: 2 },
          { title: 'Negation Rules (ne... pas)', description: 'Make sentences negative by wrapping the verb.', content: '# French Negation\n\nPlace *ne* before the verb and *pas* after the verb:\n- *Je parle français* -> *Je ne parle pas français* (I do not speak French).', difficulty: easy, estimatedMinutes: 35, order: 3 },
          { title: 'Asking Questions (Est-ce que...)', description: 'Learn standard ways to formulate questions in conversation.', content: '# Questions\n\nUse *Est-ce que* at the beginning of a sentence to turn it into a question:\n- *Vous parlez français* -> *Est-ce que vous parlez français?* (Do you speak French?)', difficulty: med, estimatedMinutes: 45, order: 4 }
        ]
      },
      {
        title: 'Phase 3: Travel Vocabulary & Present Perfect',
        description: 'Ask for directions, order at restaurants, and talk about the past.',
        order: 3,
        concepts: [
          { title: 'Ordering in a French Cafe', description: 'Order food, ask for the bill, and learn menu vocabulary.', content: '# Ordering Food\n\n- *Je voudrais un café, s\'il vous plaît.* (I would like a coffee, please.)\n- *L\'addition, s\'il vous plaît.* (The bill, please.)', difficulty: med, estimatedMinutes: 50, order: 1 },
          { title: 'Asking for Directions & Transport', description: 'Ask "Où est..." and locate trains or streets.', content: '# Finding Directions\n\n- *Où est la gare?* (Where is the train station?)\n- *À gauche* (To the left) / *À droite* (To the right)', difficulty: med, estimatedMinutes: 45, order: 2 },
          { title: 'Present Perfect Tense (Passé Composé)', description: 'Describe past events using auxiliary verbs and past participles.', content: '# Passé Composé\n\nExpress past actions:\n- *J\'ai mangé* (I ate)\n- *Je suis allé(e)* (I went)', difficulty: hard, estimatedMinutes: 80, order: 3 },
          { title: 'French Cafe Conversation Capstone', description: 'Conduct a simulated dialogue ordering food and paying.', content: '# Capstone Conversation Dialogue\n\nPerform a dialogue script including:\n1. Greeting the server.\n2. Ordering a main dish and drink.\n3. Requesting and paying the bill.', difficulty: hard, estimatedMinutes: 120, order: 4 }
        ]
      }
    ]
  },

  // --- JAVA ---
  'java': {
    totalPhases: 9,
    overview: 'Master Java — one of the world\'s most widely used, statically-typed, object-oriented programming languages. This roadmap covers everything from JVM internals and core syntax, through advanced OOP, concurrency, and design patterns, to enterprise-grade Spring Boot application development.',
    prerequisites: ['Basic computer literacy', 'Logical thinking', 'Text editor or IDE installed (IntelliJ IDEA recommended)'],
    targetAudience: 'Absolute beginners, students, and professionals targeting backend, Android, or enterprise Java development.',
    estimatedWeeks: 20,
    phases: [
      {
        title: 'Phase 1: JVM Architecture & Development Environment',
        description: 'Understand how Java works under the hood, set up your toolchain, and run your first program.',
        order: 1,
        concepts: [
          {
            title: 'JVM, JRE & JDK Explained',
            description: 'Understand the difference between the Java Virtual Machine, Runtime Environment, and Development Kit.',
            content: `# JVM, JRE & JDK

Java's platform independence comes from a three-layer architecture:

| Component | Role |
|-----------|------|
| **JDK** (Java Development Kit) | Full toolset: compiler (\`javac\`), debugger, libraries |
| **JRE** (Java Runtime Environment) | Runtime only: JVM + standard class libraries |
| **JVM** (Java Virtual Machine) | Executes bytecode on any OS |

## How Java Code Runs
\`\`\`
Source (.java) → javac → Bytecode (.class) → JVM → Machine Code
\`\`\`

## Install JDK (LTS recommended)
\`\`\`bash
# macOS via brew
brew install openjdk@21

# Windows via winget
winget install Microsoft.OpenJDK.21

# Verify
java -version
javac -version
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 40,
            order: 1
          },
          {
            title: 'IntelliJ IDEA Setup & Project Structure',
            description: 'Install and configure IntelliJ IDEA, understand Maven/Gradle project layouts.',
            content: `# Setting Up IntelliJ IDEA

1. Download **IntelliJ IDEA Community** from jetbrains.com
2. Create a new project: **File → New → Project → Java**
3. Select JDK 21, name your project \`HelloWorld\`

## Standard Maven Project Structure
\`\`\`
my-project/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/example/
│   │           └── Main.java
│   └── test/
│       └── java/
└── pom.xml
\`\`\`

## Hello World
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
\`\`\`
Compile & run: \`javac Main.java && java Main\``,
            difficulty: easy,
            estimatedMinutes: 45,
            order: 2
          },
          {
            title: 'Java Memory Model: Stack & Heap',
            description: 'Learn how Java manages memory with the stack for method calls and the heap for objects.',
            content: `# Java Memory Model

## Stack Memory
- Stores **local variables** and **method call frames**
- LIFO (Last-In, First-Out) structure
- Automatically freed when method returns

## Heap Memory
- Stores all **objects** and **class instances**
- Managed by the **Garbage Collector (GC)**

\`\`\`java
public class MemoryDemo {
    public static void main(String[] args) {
        int x = 10;           // Stack: primitive
        String name = "Java"; // Stack: reference → Heap: String object
        Person p = new Person("Alice"); // Stack: ref → Heap: Person object
    }
}
\`\`\`

## Garbage Collection
Java automatically reclaims heap memory for objects with no references. No manual \`free()\` needed.`,
            difficulty: easy,
            estimatedMinutes: 35,
            order: 3
          },
          {
            title: 'Compiling & Running from the CLI',
            description: 'Use javac and java commands to compile and execute programs without an IDE.',
            content: `# Java CLI Workflow

\`\`\`bash
# Compile a single file
javac src/Main.java -d out/

# Run the compiled class
java -cp out Main

# Compile with classpath dependencies
javac -cp lib/gson.jar src/Main.java -d out/
java -cp out:lib/gson.jar Main
\`\`\`

## JAR Files (Java Archives)
\`\`\`bash
# Package classes into a JAR
jar cf app.jar -C out/ .

# Run a JAR
java -jar app.jar
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 30,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 2: Java Syntax & Control Flow',
        description: 'Master Java\'s type system, operators, conditional branches, and looping constructs.',
        order: 2,
        concepts: [
          {
            title: 'Primitive Types, Variables & Literals',
            description: 'Understand Java\'s 8 primitive types, type casting, and variable declarations.',
            content: `# Java Primitive Types

| Type | Size | Range | Example |
|------|------|-------|---------|
| \`byte\` | 8-bit | -128 to 127 | \`byte b = 100;\` |
| \`short\` | 16-bit | -32,768 to 32,767 | \`short s = 1000;\` |
| \`int\` | 32-bit | ±2.1 billion | \`int n = 42;\` |
| \`long\` | 64-bit | ±9.2 × 10¹⁸ | \`long l = 99L;\` |
| \`float\` | 32-bit | ~7 decimal digits | \`float f = 3.14f;\` |
| \`double\` | 64-bit | ~15 decimal digits | \`double d = 3.14;\` |
| \`char\` | 16-bit | Unicode character | \`char c = 'A';\` |
| \`boolean\` | 1-bit | true / false | \`boolean ok = true;\` |

## Type Casting
\`\`\`java
int x = 100;
double d = x;          // Widening (automatic)
int y = (int) 9.99;    // Narrowing (explicit cast) → 9
\`\`\`

## String (Reference Type)
\`\`\`java
String name = "Alice";
String greeting = "Hello, " + name + "!";
System.out.println(greeting.length()); // 12
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 50,
            order: 1
          },
          {
            title: 'Operators & Expressions',
            description: 'Use arithmetic, relational, logical, bitwise, and ternary operators.',
            content: `# Java Operators

## Arithmetic
\`\`\`java
int a = 10, b = 3;
System.out.println(a + b);  // 13
System.out.println(a % b);  // 1 (modulo / remainder)
System.out.println(a / b);  // 3 (integer division)
\`\`\`

## Relational & Logical
\`\`\`java
boolean result = (a > 5) && (b < 10); // AND
boolean check  = (a == 0) || (b != 0); // OR
boolean flip   = !true;                // NOT → false
\`\`\`

## Ternary Operator
\`\`\`java
String label = (a > b) ? "A wins" : "B wins";
\`\`\`

## String Equality ⚠️
\`\`\`java
String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);       // false (reference)
System.out.println(s1.equals(s2));  // true  (value)
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 40,
            order: 2
          },
          {
            title: 'Control Flow: if, switch, loops',
            description: 'Write conditional branches and iterate with for, while, do-while, and enhanced for loops.',
            content: `# Control Flow in Java

## if / else if / else
\`\`\`java
int score = 75;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 75) {
    System.out.println("B");
} else {
    System.out.println("C");
}
\`\`\`

## Switch Expression (Java 14+)
\`\`\`java
String day = "MONDAY";
String type = switch (day) {
    case "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" -> "Weekday";
    case "SATURDAY", "SUNDAY" -> "Weekend";
    default -> "Unknown";
};
\`\`\`

## Loops
\`\`\`java
// Traditional for
for (int i = 0; i < 5; i++) System.out.println(i);

// Enhanced for (for-each)
int[] nums = {1, 2, 3, 4, 5};
for (int n : nums) System.out.println(n);

// while
int count = 0;
while (count < 3) { System.out.println(count++); }
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 55,
            order: 3
          },
          {
            title: 'Arrays & Basic Methods',
            description: 'Declare single and multi-dimensional arrays, and write reusable static methods.',
            content: `# Arrays & Methods

## Arrays
\`\`\`java
// Single-dimensional
int[] scores = {95, 87, 72, 66};
System.out.println(scores.length);   // 4
System.out.println(scores[0]);       // 95

// Multi-dimensional (2D)
int[][] matrix = {{1, 2}, {3, 4}};
System.out.println(matrix[1][0]);    // 3

// java.util.Arrays utilities
import java.util.Arrays;
Arrays.sort(scores);
System.out.println(Arrays.toString(scores)); // [66, 72, 87, 95]
\`\`\`

## Static Methods
\`\`\`java
public class Calculator {
    public static int add(int a, int b) { return a + b; }
    public static double divide(double a, double b) {
        if (b == 0) throw new ArithmeticException("Division by zero");
        return a / b;
    }

    public static void main(String[] args) {
        System.out.println(add(3, 4));       // 7
        System.out.println(divide(10, 3));   // 3.333...
    }
}
\`\`\``,
            difficulty: easy,
            estimatedMinutes: 60,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 3: Object-Oriented Programming (OOP)',
        description: 'Design class hierarchies using encapsulation, inheritance, polymorphism, and abstraction — the four pillars of OOP.',
        order: 3,
        concepts: [
          {
            title: 'Classes, Objects & Constructors',
            description: 'Define blueprints, instantiate objects, and initialize state with constructors.',
            content: `# Classes & Objects

\`\`\`java
public class BankAccount {
    // Fields (state)
    private String owner;
    private double balance;

    // Constructor
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    // Methods (behavior)
    public void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }

    public double getBalance() { return balance; }

    @Override
    public String toString() {
        return owner + ": $" + balance;
    }
}

// Usage
BankAccount acc = new BankAccount("Alice", 1000.0);
acc.deposit(500);
System.out.println(acc); // Alice: $1500.0
\`\`\``,
            difficulty: med,
            estimatedMinutes: 70,
            order: 1
          },
          {
            title: 'Encapsulation & Access Modifiers',
            description: 'Control visibility with public, private, protected, and package-private access.',
            content: `# Access Modifiers

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| \`public\` | ✅ | ✅ | ✅ | ✅ |
| \`protected\` | ✅ | ✅ | ✅ | ❌ |
| *(package)* | ✅ | ✅ | ❌ | ❌ |
| \`private\` | ✅ | ❌ | ❌ | ❌ |

## Getters & Setters
\`\`\`java
public class Person {
    private String name;
    private int age;

    public String getName() { return name; }
    public void setName(String name) {
        if (name != null && !name.isBlank()) this.name = name;
    }

    public int getAge() { return age; }
    public void setAge(int age) {
        if (age >= 0 && age <= 150) this.age = age;
    }
}
\`\`\`

## Java Records (Java 16+) — Immutable Data Carriers
\`\`\`java
public record Point(double x, double y) {}
Point p = new Point(3.0, 4.0);
System.out.println(p.x()); // 3.0
\`\`\``,
            difficulty: med,
            estimatedMinutes: 60,
            order: 2
          },
          {
            title: 'Inheritance & Method Overriding',
            description: 'Extend classes to share and specialize behavior using extends and @Override.',
            content: `# Inheritance

\`\`\`java
// Parent class
public class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }

    public String speak() { return name + " makes a sound"; }
}

// Child class
public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name); // Call parent constructor
        this.breed = breed;
    }

    @Override
    public String speak() { return name + " barks! Woof!"; }

    public String getBreed() { return breed; }
}

// Polymorphism in action
Animal a = new Dog("Rex", "Labrador");
System.out.println(a.speak()); // Rex barks! Woof!
\`\`\`

## final Keyword
\`\`\`java
final class ImmutablePoint {}   // Cannot be extended
final void display() {}          // Cannot be overridden
final int MAX = 100;             // Cannot be reassigned
\`\`\``,
            difficulty: med,
            estimatedMinutes: 75,
            order: 3
          },
          {
            title: 'Interfaces & Abstract Classes',
            description: 'Define contracts with interfaces and partial implementations with abstract classes.',
            content: `# Interfaces vs Abstract Classes

## Interface (Contract)
\`\`\`java
public interface Drawable {
    void draw();                         // Abstract method
    default String getColor() { return "Black"; } // Default method
}

public interface Resizable {
    void resize(double factor);
}

// Implement multiple interfaces
public class Circle implements Drawable, Resizable {
    private double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override public void draw() { System.out.println("Drawing circle r=" + radius); }
    @Override public void resize(double factor) { radius *= factor; }
}
\`\`\`

## Abstract Class (Partial Implementation)
\`\`\`java
public abstract class Shape {
    protected String color;

    public Shape(String color) { this.color = color; }

    public abstract double area();  // Must be implemented by subclass

    public void printInfo() {       // Shared implementation
        System.out.printf("%s area: %.2f%n", color, area());
    }
}

public class Rectangle extends Shape {
    private double width, height;
    public Rectangle(String color, double w, double h) {
        super(color); this.width = w; this.height = h;
    }
    @Override public double area() { return width * height; }
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 80,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 4: Collections Framework & Generics',
        description: 'Work with Java\'s powerful built-in data structures — Lists, Sets, Maps, and Queues — and write type-safe generic code.',
        order: 4,
        concepts: [
          {
            title: 'ArrayList, LinkedList & List Interface',
            description: 'Store ordered, dynamic sequences using the List interface implementations.',
            content: `# Java List Implementations

\`\`\`java
import java.util.*;

// ArrayList — fast random access, backed by array
List<String> fruits = new ArrayList<>();
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");
fruits.remove("Banana");
System.out.println(fruits.get(0));  // Apple
System.out.println(fruits.size());  // 2

// Sorting
Collections.sort(fruits);
fruits.sort(Comparator.reverseOrder());

// LinkedList — fast insert/delete at ends
LinkedList<Integer> queue = new LinkedList<>();
queue.addFirst(1);
queue.addLast(2);
int head = queue.pollFirst(); // 1
\`\`\`

## List.of() — Immutable Lists (Java 9+)
\`\`\`java
List<String> days = List.of("Mon", "Tue", "Wed");
// days.add("Thu"); // ❌ UnsupportedOperationException
\`\`\``,
            difficulty: med,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: 'HashSet, TreeSet & Map Implementations',
            description: 'Use Sets for unique collections and Maps for key-value storage.',
            content: `# Sets & Maps

## HashSet — Unique, Unordered
\`\`\`java
Set<String> tags = new HashSet<>();
tags.add("java"); tags.add("backend"); tags.add("java"); // duplicate ignored
System.out.println(tags.size()); // 2
\`\`\`

## TreeSet — Unique, Sorted
\`\`\`java
Set<Integer> sorted = new TreeSet<>(Set.of(5, 1, 3, 2, 4));
System.out.println(sorted); // [1, 2, 3, 4, 5]
\`\`\`

## HashMap — Key → Value
\`\`\`java
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.put("Alice", 98);  // Overwrites previous

System.out.println(scores.get("Alice")); // 98
scores.getOrDefault("Charlie", 0);       // 0

// Iterate entries
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}
\`\`\`

## LinkedHashMap — Insertion-Order Map
\`\`\`java
Map<String, String> capitals = new LinkedHashMap<>();
capitals.put("India", "New Delhi");
capitals.put("France", "Paris");
// Iteration preserves insertion order
\`\`\``,
            difficulty: med,
            estimatedMinutes: 70,
            order: 2
          },
          {
            title: 'Generics & Type Parameters',
            description: 'Write type-safe, reusable classes and methods using generic type parameters.',
            content: `# Java Generics

## Generic Class
\`\`\`java
public class Box<T> {
    private T value;

    public Box(T value) { this.value = value; }
    public T get() { return value; }

    @Override public String toString() {
        return "Box[" + value + "]";
    }
}

Box<Integer> intBox = new Box<>(42);
Box<String>  strBox = new Box<>("Hello");
System.out.println(intBox.get()); // 42
\`\`\`

## Generic Method
\`\`\`java
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

System.out.println(max(10, 20));       // 20
System.out.println(max("Apple", "Mango")); // Mango
\`\`\`

## Wildcards
\`\`\`java
// Upper-bounded wildcard: ? extends Number
public double sumList(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

// Lower-bounded wildcard: ? super Integer
public void addNumbers(List<? super Integer> list) {
    list.add(1); list.add(2);
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 75,
            order: 3
          },
          {
            title: 'Stream API & Lambda Expressions',
            description: 'Process collections functionally using Java 8 Streams, lambdas, and method references.',
            content: `# Java Streams & Lambdas

## Lambda Syntax
\`\`\`java
// Traditional anonymous class
Runnable r1 = new Runnable() {
    @Override public void run() { System.out.println("Running"); }
};

// Lambda equivalent
Runnable r2 = () -> System.out.println("Running");
\`\`\`

## Stream Pipeline: filter → map → collect
\`\`\`java
import java.util.*;
import java.util.stream.*;

List<String> names = List.of("Alice", "Bob", "Anna", "Charlie", "Amy");

List<String> result = names.stream()
    .filter(name -> name.startsWith("A"))   // filter
    .map(String::toUpperCase)               // transform
    .sorted()                               // sort alphabetically
    .collect(Collectors.toList());          // terminal: collect

System.out.println(result); // [ALICE, AMY, ANNA]
\`\`\`

## Common Terminal Operations
\`\`\`java
List<Integer> nums = List.of(1, 2, 3, 4, 5);

int sum     = nums.stream().reduce(0, Integer::sum);    // 15
long count  = nums.stream().filter(n -> n > 2).count(); // 3
Optional<Integer> max = nums.stream().max(Integer::compareTo); // 5

// Grouping with Collectors
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 5: Exception Handling & File I/O',
        description: 'Handle runtime errors gracefully and read/write data using Java\'s modern I/O APIs.',
        order: 5,
        concepts: [
          {
            title: 'Checked vs Unchecked Exceptions',
            description: 'Understand Java\'s exception hierarchy and handle errors using try-catch-finally.',
            content: `# Java Exception Hierarchy

\`\`\`
Throwable
├── Error          (JVM errors — don't catch)
└── Exception
    ├── RuntimeException     (Unchecked — optional to catch)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── IllegalArgumentException
    └── IOException          (Checked — MUST handle)
        ├── FileNotFoundException
        └── ...
\`\`\`

## try-catch-finally
\`\`\`java
public int parseInt(String input) {
    try {
        return Integer.parseInt(input);
    } catch (NumberFormatException e) {
        System.err.println("Invalid number: " + e.getMessage());
        return -1;
    } finally {
        System.out.println("Parsing attempt completed");
    }
}
\`\`\`

## Custom Exceptions
\`\`\`java
public class InsufficientFundsException extends Exception {
    private final double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Required: " + amount);
        this.amount = amount;
    }

    public double getAmount() { return amount; }
}

// Usage
if (balance < amount) throw new InsufficientFundsException(amount);
\`\`\``,
            difficulty: med,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: 'File Reading & Writing (java.nio.file)',
            description: 'Read, write, and manage files using the modern java.nio.file.Files API.',
            content: `# Modern File I/O with java.nio

\`\`\`java
import java.nio.file.*;
import java.io.IOException;
import java.util.List;

public class FileDemo {
    public static void main(String[] args) throws IOException {
        Path filePath = Path.of("data/notes.txt");

        // Write lines to file
        List<String> lines = List.of("Line 1", "Line 2", "Line 3");
        Files.write(filePath, lines);

        // Read all lines
        List<String> content = Files.readAllLines(filePath);
        content.forEach(System.out::println);

        // Read as single string
        String text = Files.readString(filePath);

        // Append to file
        Files.writeString(filePath, "\\nLine 4", StandardOpenOption.APPEND);

        // Check existence & delete
        if (Files.exists(filePath)) Files.delete(filePath);
    }
}
\`\`\`

## Listing Directory Contents
\`\`\`java
Files.walk(Path.of("src"))
    .filter(p -> p.toString().endsWith(".java"))
    .forEach(System.out::println);
\`\`\``,
            difficulty: med,
            estimatedMinutes: 55,
            order: 2
          },
          {
            title: 'try-with-resources & AutoCloseable',
            description: 'Automatically close I/O resources using the try-with-resources statement.',
            content: `# Try-with-Resources

Any class implementing \`AutoCloseable\` (or \`Closeable\`) can be used in try-with-resources and will be auto-closed.

\`\`\`java
import java.io.*;

// Reading a file line-by-line with BufferedReader
try (BufferedReader reader = new BufferedReader(
        new FileReader("data/input.txt"))) {

    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }

} catch (FileNotFoundException e) {
    System.err.println("File not found: " + e.getMessage());
} catch (IOException e) {
    System.err.println("Read error: " + e.getMessage());
}
// reader.close() called automatically ✅

// Writing with PrintWriter
try (PrintWriter writer = new PrintWriter(new FileWriter("output.txt"))) {
    writer.println("Hello from Java!");
    writer.printf("Score: %d%n", 95);
}
\`\`\`

## Custom AutoCloseable
\`\`\`java
class DatabaseConnection implements AutoCloseable {
    public DatabaseConnection() { System.out.println("Connected"); }
    @Override public void close() { System.out.println("Connection closed"); }
}

try (DatabaseConnection db = new DatabaseConnection()) {
    // use db
} // Automatically prints "Connection closed"
\`\`\``,
            difficulty: med,
            estimatedMinutes: 50,
            order: 3
          },
          {
            title: 'Java Serialization & JSON with Gson',
            description: 'Serialize Java objects to JSON strings and deserialize them back using the Gson library.',
            content: `# Object Serialization with Gson

## Add Gson dependency (Maven)
\`\`\`xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
\`\`\`

## Serialize (Object → JSON)
\`\`\`java
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public record Student(String name, int age, List<String> courses) {}

Gson gson = new GsonBuilder().setPrettyPrinting().create();

Student student = new Student("Alice", 21, List.of("Java", "Algorithms"));
String json = gson.toJson(student);
System.out.println(json);
// {
//   "name": "Alice",
//   "age": 21,
//   "courses": ["Java", "Algorithms"]
// }
\`\`\`

## Deserialize (JSON → Object)
\`\`\`java
String inputJson = "{\\"name\\":\\"Bob\\",\\"age\\":22,\\"courses\\":[\\"Python\\"]}";
Student bob = gson.fromJson(inputJson, Student.class);
System.out.println(bob.name()); // Bob
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 65,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 6: Concurrency & Multithreading',
        description: 'Write safe, high-performance multi-threaded programs using Java\'s threading model, ExecutorService, and concurrent data structures.',
        order: 6,
        concepts: [
          {
            title: 'Threads, Runnable & Thread Lifecycle',
            description: 'Create and manage threads using Thread and Runnable, understand thread states.',
            content: `# Java Threads

## Thread Lifecycle
\`\`\`
NEW → RUNNABLE → RUNNING → BLOCKED/WAITING → TERMINATED
\`\`\`

## Creating Threads
\`\`\`java
// Method 1: Extend Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread: " + getName());
    }
}

// Method 2: Implement Runnable (preferred)
Runnable task = () -> System.out.println("Running in: " + Thread.currentThread().getName());

Thread t1 = new Thread(task, "Worker-1");
Thread t2 = new Thread(task, "Worker-2");

t1.start();
t2.start();

t1.join(); // Wait for t1 to finish
t2.join();
System.out.println("All threads done");
\`\`\`

## Thread.sleep()
\`\`\`java
try {
    Thread.sleep(1000); // Pause for 1 second
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 70,
            order: 1
          },
          {
            title: 'Synchronization & Deadlock Prevention',
            description: 'Protect shared state with synchronized blocks and understand deadlock conditions.',
            content: `# Thread Safety & Synchronization

## Race Condition Problem
\`\`\`java
class Counter {
    private int count = 0;
    public void increment() { count++; } // NOT thread-safe!
    public int getCount() { return count; }
}
\`\`\`

## synchronized Method
\`\`\`java
class SafeCounter {
    private int count = 0;
    public synchronized void increment() { count++; } // Thread-safe ✅
    public synchronized int getCount() { return count; }
}
\`\`\`

## synchronized Block (finer granularity)
\`\`\`java
private final Object lock = new Object();

public void update() {
    synchronized (lock) {
        // Only one thread at a time here
    }
}
\`\`\`

## Atomic Variables (lock-free)
\`\`\`java
import java.util.concurrent.atomic.AtomicInteger;

AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet(); // Thread-safe without synchronized
\`\`\`

## Deadlock — Avoid by always locking in same order
\`\`\`java
// ⚠️ Deadlock risk: Thread A holds lock1, wants lock2
//                   Thread B holds lock2, wants lock1
// Prevention: Always acquire locks in consistent order
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 80,
            order: 2
          },
          {
            title: 'ExecutorService & Thread Pools',
            description: 'Manage thread lifecycles efficiently using the ExecutorService framework.',
            content: `# ExecutorService — Thread Pool Management

\`\`\`java
import java.util.concurrent.*;

// Fixed thread pool
ExecutorService executor = Executors.newFixedThreadPool(4);

// Submit tasks
for (int i = 0; i < 10; i++) {
    final int taskId = i;
    executor.submit(() -> {
        System.out.println("Task " + taskId + " on " + Thread.currentThread().getName());
    });
}

executor.shutdown();                     // No new tasks
executor.awaitTermination(5, TimeUnit.SECONDS); // Wait for completion
\`\`\`

## Future & Callable (Return Values)
\`\`\`java
Callable<Integer> computation = () -> {
    Thread.sleep(1000);
    return 42;
};

Future<Integer> future = executor.submit(computation);

// Do other work...
int result = future.get(); // Blocks until done
System.out.println("Result: " + result); // 42
\`\`\`

## CompletableFuture (Java 8+)
\`\`\`java
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> processData(data))
    .thenAccept(result -> saveResult(result))
    .exceptionally(ex -> { System.err.println(ex.getMessage()); return null; });
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 85,
            order: 3
          },
          {
            title: 'Concurrent Collections & BlockingQueue',
            description: 'Use thread-safe collections and producer-consumer patterns with BlockingQueue.',
            content: `# Concurrent Collections

## ConcurrentHashMap
\`\`\`java
import java.util.concurrent.*;

Map<String, Integer> map = new ConcurrentHashMap<>();
map.put("a", 1);
map.computeIfAbsent("b", k -> 2);       // Thread-safe compute
map.merge("a", 1, Integer::sum);         // Atomic merge: a → 2
\`\`\`

## BlockingQueue — Producer-Consumer Pattern
\`\`\`java
BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

// Producer thread
Thread producer = new Thread(() -> {
    try {
        for (int i = 0; i < 5; i++) {
            queue.put("Task-" + i);   // Blocks if full
            System.out.println("Produced: Task-" + i);
        }
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});

// Consumer thread
Thread consumer = new Thread(() -> {
    try {
        for (int i = 0; i < 5; i++) {
            String task = queue.take(); // Blocks if empty
            System.out.println("Consumed: " + task);
        }
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});

producer.start(); consumer.start();
producer.join();  consumer.join();
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 75,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 7: Design Patterns & Unit Testing',
        description: 'Apply proven software design patterns to solve recurring problems and write comprehensive tests with JUnit 5 and Mockito.',
        order: 7,
        concepts: [
          {
            title: 'Creational Patterns: Singleton, Builder, Factory',
            description: 'Control object creation with the three most critical creational design patterns.',
            content: `# Creational Design Patterns

## Singleton — One Instance Only
\`\`\`java
public class ConfigManager {
    private static volatile ConfigManager instance;
    private final Map<String, String> config = new HashMap<>();

    private ConfigManager() {}

    public static ConfigManager getInstance() {
        if (instance == null) {
            synchronized (ConfigManager.class) {
                if (instance == null) instance = new ConfigManager();
            }
        }
        return instance;
    }
}
\`\`\`

## Builder Pattern — Complex Object Construction
\`\`\`java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;

    private HttpRequest(Builder b) {
        this.url = b.url; this.method = b.method;
        this.headers = b.headers; this.body = b.body;
    }

    public static class Builder {
        private String url, method = "GET", body;
        private Map<String, String> headers = new HashMap<>();

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String m) { this.method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder body(String body) { this.body = body; return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Usage
HttpRequest req = new HttpRequest.Builder()
    .url("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .body("{\\"name\\":\\"Alice\\"}")
    .build();
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 80,
            order: 1
          },
          {
            title: 'Structural Patterns: Decorator & Strategy',
            description: 'Extend behavior dynamically with Decorator and swap algorithms with Strategy.',
            content: `# Structural & Behavioral Patterns

## Strategy Pattern — Interchangeable Algorithms
\`\`\`java
@FunctionalInterface
interface SortStrategy {
    void sort(int[] array);
}

class Sorter {
    private SortStrategy strategy;
    public Sorter(SortStrategy s) { this.strategy = s; }
    public void setStrategy(SortStrategy s) { this.strategy = s; }
    public void sort(int[] arr) { strategy.sort(arr); }
}

// Lambdas as strategies
Sorter sorter = new Sorter(arr -> Arrays.sort(arr));
sorter.sort(new int[]{3,1,2});

sorter.setStrategy(arr -> {
    // Reverse sort
    Arrays.sort(arr);
    for (int i = 0, j = arr.length-1; i < j; i++, j--) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
});
\`\`\`

## Observer Pattern — Event Notification
\`\`\`java
interface Observer { void update(String event); }

class EventBus {
    private List<Observer> observers = new ArrayList<>();
    public void subscribe(Observer o) { observers.add(o); }
    public void publish(String event) { observers.forEach(o -> o.update(event)); }
}

EventBus bus = new EventBus();
bus.subscribe(event -> System.out.println("Logger: " + event));
bus.subscribe(event -> System.out.println("UI: " + event));
bus.publish("USER_LOGGED_IN");
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 70,
            order: 2
          },
          {
            title: 'JUnit 5 — Unit Testing',
            description: 'Write, organize, and run automated unit tests using JUnit 5 and AssertJ.',
            content: `# JUnit 5 Testing

## Maven Dependency
\`\`\`xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
</dependency>
\`\`\`

## Writing Tests
\`\`\`java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() { calc = new Calculator(); }

    @Test
    void testAdd() {
        assertEquals(5, calc.add(2, 3));
    }

    @Test
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }

    @ParameterizedTest
    @ValueSource(ints = {2, 4, 6, 8})
    void testIsEven(int n) {
        assertTrue(n % 2 == 0);
    }

    @Test
    @DisplayName("Multiply negative numbers")
    void testNegativeMultiply() {
        assertEquals(6, calc.multiply(-2, -3));
    }
}
\`\`\`

Run tests: \`mvn test\` or \`./gradlew test\``,
            difficulty: med,
            estimatedMinutes: 65,
            order: 3
          },
          {
            title: 'Mockito — Mocking Dependencies in Tests',
            description: 'Isolate unit tests by mocking external dependencies using Mockito.',
            content: `# Mockito — Test Doubles

## Setup
\`\`\`xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
\`\`\`

## Mocking a Service Dependency
\`\`\`java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnUserWhenFound() {
        User mockUser = new User("1", "Alice");
        when(userRepo.findById("1")).thenReturn(Optional.of(mockUser));

        User result = userService.getUser("1");

        assertEquals("Alice", result.getName());
        verify(userRepo, times(1)).findById("1");
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepo.findById("999")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
            () -> userService.getUser("999"));
    }
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 70,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 8: Spring Boot & REST API Development',
        description: 'Build production-grade REST APIs using Spring Boot — the industry-standard Java backend framework.',
        order: 8,
        concepts: [
          {
            title: 'Spring Boot Setup & Dependency Injection',
            description: 'Bootstrap a Spring Boot application and understand IoC container and @Autowired.',
            content: `# Spring Boot Basics

## Create Project (Spring Initializr)
Visit **start.spring.io** and select:
- Project: Maven | Language: Java | Spring Boot: 3.x
- Dependencies: Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok

## Application Entry Point
\`\`\`java
@SpringBootApplication
public class LearnFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearnFlowApplication.class, args);
    }
}
\`\`\`

## Dependency Injection
\`\`\`java
@Service
public class CourseService {
    private final CourseRepository repo;

    // Constructor injection (recommended over @Autowired field injection)
    public CourseService(CourseRepository repo) {
        this.repo = repo;
    }

    public List<Course> getAllCourses() {
        return repo.findAll();
    }
}
\`\`\`

## application.properties
\`\`\`properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learnflow
spring.datasource.username=postgres
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
server.port=8080
\`\`\``,
            difficulty: med,
            estimatedMinutes: 70,
            order: 1
          },
          {
            title: 'Building REST Controllers & Request Mapping',
            description: 'Expose HTTP endpoints using @RestController, @GetMapping, @PostMapping, and request validation.',
            content: `# Spring MVC REST Controllers

\`\`\`java
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // GET /api/courses
    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // GET /api/courses/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // POST /api/courses
    @PostMapping
    public ResponseEntity<CourseDto> createCourse(
            @Valid @RequestBody CreateCourseRequest request) {
        CourseDto created = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/courses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CourseDto> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    // DELETE /api/courses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
\`\`\``,
            difficulty: med,
            estimatedMinutes: 75,
            order: 2
          },
          {
            title: 'Spring Data JPA & Database Integration',
            description: 'Map Java entities to database tables and perform queries using JPA Repository.',
            content: `# Spring Data JPA

## Entity Definition
\`\`\`java
@Entity
@Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Lesson> lessons = new ArrayList<>();
}
\`\`\`

## JPA Repository
\`\`\`java
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDifficulty(DifficultyLevel difficulty);
    List<Course> findByTitleContainingIgnoreCase(String keyword);

    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId")
    List<Course> findByInstructorId(@Param("instructorId") Long instructorId);
}
\`\`\`

## Service Layer with Transactions
\`\`\`java
@Service
@Transactional
public class CourseService {
    public CourseDto createCourse(CreateCourseRequest req) {
        Course course = new Course();
        course.setTitle(req.title());
        course.setDescription(req.description());
        Course saved = repo.save(course);
        return CourseDto.from(saved);
    }
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 3
          },
          {
            title: 'Spring Security & JWT Authentication',
            description: 'Secure REST APIs using Spring Security with stateless JWT token-based authentication.',
            content: `# Spring Security + JWT

## Security Configuration
\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
\`\`\`

## JWT Token Service
\`\`\`java
@Service
public class JwtService {
    @Value("\u0024{jwt.secret}")
    private String secret;

    public String generateToken(UserDetails user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
            .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(secret.getBytes()).build()
            .parseClaimsJws(token).getBody().getSubject();
    }
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 100,
            order: 4
          }
        ]
      },
      {
        title: 'Phase 9: Capstone — Full Java Backend Application',
        description: 'Design and build a complete, production-ready Java backend — from architecture design to containerized deployment — demonstrating mastery of all phases.',
        order: 9,
        concepts: [
          {
            title: 'Project Architecture & Domain Modeling',
            description: 'Design a layered architecture, define domain entities, and plan the API contract.',
            content: `# Capstone: Architecture Design

## Project: "CourseHub" — Learning Management REST API

### Layered Architecture
\`\`\`
┌─────────────────────────────┐
│  Controller Layer           │  HTTP request/response handling
│  (@RestController)          │
├─────────────────────────────┤
│  Service Layer              │  Business logic, transactions
│  (@Service)                 │
├─────────────────────────────┤
│  Repository Layer           │  Data access (Spring Data JPA)
│  (@Repository)              │
├─────────────────────────────┤
│  Database (PostgreSQL)      │  Persistent storage
└─────────────────────────────┘
\`\`\`

### Core Domain Entities
- **User** (id, email, passwordHash, role, createdAt)
- **Course** (id, title, description, difficulty, instructor)
- **Lesson** (id, title, content, order, course)
- **Enrollment** (id, user, course, enrolledAt, progress)

### API Endpoints Plan
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | User registration |
| POST | /api/auth/login | Public | JWT login |
| GET | /api/courses | Optional | List all courses |
| POST | /api/courses | INSTRUCTOR | Create course |
| POST | /api/enrollments | USER | Enroll in course |
| PUT | /api/enrollments/{id}/progress | USER | Update lesson progress |`,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 1
          },
          {
            title: 'Full API Implementation with Validation & Error Handling',
            description: 'Implement all endpoints with Bean Validation, global exception handling, and consistent error responses.',
            content: `# Capstone: API Implementation

## Global Exception Handler
\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream().map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.toList());
        return ResponseEntity.status(400)
            .body(new ErrorResponse("VALIDATION_ERROR", errors.toString()));
    }
}
\`\`\`

## Request Validation
\`\`\`java
public record CreateCourseRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100)
    String title,

    @NotBlank
    String description,

    @NotNull
    DifficultyLevel difficulty
) {}
\`\`\`

## Pagination & Filtering
\`\`\`java
@GetMapping
public Page<CourseDto> getCourses(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(required = false) String keyword) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    return courseService.searchCourses(keyword, pageable);
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 120,
            order: 2
          },
          {
            title: 'Integration Testing & Test Coverage',
            description: 'Write integration tests for the full API stack using MockMvc and Testcontainers.',
            content: `# Capstone: Integration Testing

## MockMvc Controller Tests
\`\`\`java
@SpringBootTest
@AutoConfigureMockMvc
class CourseControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void shouldCreateCourse() throws Exception {
        CreateCourseRequest req = new CreateCourseRequest(
            "Java Mastery", "Learn Java deeply", DifficultyLevel.INTERMEDIATE
        );

        mockMvc.perform(post("/api/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + getAdminToken())
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Java Mastery"))
            .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(post("/api/courses"))
            .andExpect(status().isUnauthorized());
    }
}
\`\`\`

## Testcontainers — Real DB in Tests
\`\`\`java
@Testcontainers
@SpringBootTest
class RepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 100,
            order: 3
          },
          {
            title: 'Dockerizing & Deploying the Spring Boot App',
            description: 'Containerize the application, write a docker-compose stack, and deploy to a cloud environment.',
            content: `# Capstone: Containerization & Deployment

## Multi-Stage Dockerfile
\`\`\`dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

## Docker Compose (Full Stack)
\`\`\`yaml
version: '3.9'
services:
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/coursehub
      SPRING_DATASOURCE_USERNAME: coursehub
      SPRING_DATASOURCE_PASSWORD: secret
      JWT_SECRET: your-256-bit-secret
    depends_on:
      db: { condition: service_healthy }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: coursehub
      POSTGRES_USER: coursehub
      POSTGRES_PASSWORD: secret
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U coursehub"]
      interval: 5s
      retries: 5

volumes:
  postgres_data:
\`\`\`

## Launch & Verify
\`\`\`bash
docker-compose up --build -d
curl http://localhost:8080/api/courses
\`\`\``,
            difficulty: hard,
            estimatedMinutes: 150,
            order: 4
          }
        ]
      }
    ]
  }
};
