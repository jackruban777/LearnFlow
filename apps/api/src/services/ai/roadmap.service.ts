import { RoadmapGenerationResult, Difficulty } from '@learnflow/shared';
import { isMockAiEnabled, getChatCompletion } from './openai.js';
import { redis, getJson, setJson } from '../../lib/redis.js';
import { MOCK_ROADMAPS } from './mockRoadmapsData.js';
import { getWebContextForSkill } from './search.service.js';

export async function generateRoadmap(skillName: string): Promise<RoadmapGenerationResult> {
  const cacheKey = `roadmap:gen:${skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;

  // Try retrieving from Redis cache first
  try {
    const cached = await getJson<RoadmapGenerationResult>(cacheKey);
    if (cached) {
      console.log(`⚡ Roadmap cache hit for: ${skillName}`);
      return cached;
    }
  } catch (err) {
    console.warn('⚠️ Redis error reading roadmap cache:', (err as Error).message);
  }

  let result: RoadmapGenerationResult;
  const webContext = await getWebContextForSkill(skillName);

  if (isMockAiEnabled) {
    console.log(`🤖 Generating mock roadmap for: ${skillName}`);
    result = generateMockRoadmap(skillName, webContext);
  } else {
    try {
      console.log(`🔥 Invoking OpenAI to generate roadmap for: ${skillName}`);
      const responseText = await getChatCompletion([
        {
          role: 'system',
          content: `You are a dynamic AI curriculum engine.

CRITICAL RULES:
1. Never use a pre-built roadmap template.
2. Never reuse roadmap structures from previous outputs.
3. Every course/topic MUST be analyzed first and then a completely new roadmap structure must be designed.
4. Phase 1 MUST ALWAYS start from absolute zero — assume the learner has NO prior knowledge whatsoever of this topic.
5. CI/CD pipelines (GitHub Actions, Jenkins, etc.) must ONLY appear in roadmaps where software deployment is a core outcome. Include CI/CD ONLY for: DevOps, Cloud, Backend APIs, Full-Stack Web Development. Do NOT include CI/CD phases in roadmaps for: Design tools, Data Analysis, Creative skills, Language learning, Mathematics, Security concepts, or any topic where code deployment is not the primary goal.

Use the following real-world context gathered from the web to ensure accurate, up-to-date curriculum content:
---
${webContext}
---

WORKFLOW (mandatory):

STEP 1 — Analyze the course internally (do NOT output this step):
Determine scores (1–10) for:
- Domain type: Programming / Design / Science / Business / Language / Mathematics / Engineering / Healthcare / Creative / Other
- Complexity score (1–10)
- Breadth score (1–10)
- Prerequisite depth (1–10)
- Practical intensity (1–10)

STEP 2 — Decide roadmap structure dynamically (do NOT output this step):
Calculate total phases using:
  totalPhases = Math.round((complexity + breadth + prerequisites + practicalIntensity) / 3)
  Clamp result: minimum = 4 phases, maximum = 15 phases

Phase progression rule: Phases MUST follow a natural skill curve:
  Phase 1 → Complete beginner (zero assumed knowledge, setup, orientation)
  Middle phases → Progressive skill building with hands-on practice
  Final phase → Mastery-level project, real-world application, or career milestone

Domain-specific phase examples (use as inspiration, never copy verbatim):
- Python: Environment Setup & First Program → Variables, Data Types & Operators → Control Flow & Functions → Data Structures → OOP → Libraries & Ecosystem → Web/API Development → Capstone Project
- UI/UX: What is UX? & Design Thinking → User Research Methods → Information Architecture → Wireframing → Visual Design Principles → Prototyping → Usability Testing → Portfolio Building
- Cybersecurity: Networking Fundamentals → OS & Linux Basics → Security Concepts & Threat Modelling → Cryptography → Ethical Hacking Intro → Penetration Testing → Cloud Security → SOC Practice
- Machine Learning: Linear Algebra & Statistics Refresher → Python for Data Science → Data Cleaning & EDA → Classic ML Algorithms → Model Evaluation → Deep Learning → MLOps → Capstone

STEP 3 — Generate the roadmap:
For each phase produce:
- Phase number and domain-specific title
- Objective of this phase
- 4–6 concepts with subtopics, hands-on tasks, mini-projects, required tools
- Estimated duration
- Skills gained

STRICT CONSTRAINTS:
- Never generate identical phase names across unrelated courses
- Phase titles must be domain-specific (not generic)
- Different courses must produce visibly different structures
- Number of phases must vary according to the analysis formula above
- Include specialization phases only if the domain supports multiple career paths
- Include a capstone phase only if the domain benefits from a culminating project
- CI/CD: only include if deployment automation is a direct learning objective of the course

You MUST respond with a JSON object strictly matching this schema:
{
  "skillName": string,
  "totalPhases": number,
  "overview": string,
  "prerequisites": string[],
  "targetAudience": string,
  "estimatedWeeks": number,
  "phases": [
    {
      "title": string,
      "description": string,
      "order": number,
      "concepts": [
        {
          "title": string,
          "description": string,
          "content": string,
          "difficulty": "EASY" | "MEDIUM" | "HARD",
          "estimatedMinutes": number,
          "order": number
        }
      ]
    }
  ]
}

Make the educational content rich, accurate, and detailed in Markdown inside each "content" field.
Output ONLY the final roadmap JSON. Do not wrap in markdown code fences. Do not include the analysis steps in the output.`
        },
        {
          role: 'user',
          content: `Generate the complete, unique learning roadmap for: ${skillName}`
        }
      ], {
        response_format: { type: 'json_object' }
      });

      result = JSON.parse(responseText.trim()) as RoadmapGenerationResult;
    } catch (error) {
      console.error('❌ Failed to generate roadmap with OpenAI. Falling back to mock:', error);
      result = generateMockRoadmap(skillName, webContext);
    }
  }

  // Save to Redis cache
  try {
    await setJson(cacheKey, result, 24 * 60 * 60); // 24 hours TTL
  } catch (err) {
    console.warn('⚠️ Redis error caching roadmap:', (err as Error).message);
  }

  return result;
}

function generateMockRoadmap(skillName: string, webContext?: string): RoadmapGenerationResult {
  const normalizedSkill = skillName.trim();
  const lowerSkill = normalizedSkill.toLowerCase();

  // 1. Exact match in pre-built high-fidelity roadmap database
  if (MOCK_ROADMAPS[lowerSkill]) {
    const data = MOCK_ROADMAPS[lowerSkill];
    console.log(`✅ Exact mock roadmap match for: "${lowerSkill}"`);
    return {
      ...data,
      skillName: normalizedSkill,
      totalPhases: data.phases.length
    } as RoadmapGenerationResult;
  }

  // 2. Partial match in pre-built roadmap database
  for (const key of Object.keys(MOCK_ROADMAPS)) {
    if (lowerSkill.includes(key) || key.includes(lowerSkill)) {
      const data = MOCK_ROADMAPS[key];
      if (!data) continue; // guard: key exists but value may be undefined in strict index mode
      console.log(`✅ Partial mock roadmap match for: "${lowerSkill}" → "${key}"`);
      return {
        ...data,
        skillName: normalizedSkill,
        totalPhases: data.phases.length
      } as RoadmapGenerationResult;
    }
  }

  // 3. No match — use the Smart Dynamic Fallback Generator and expand to min 5 phases
  console.log(`⚙️ No mock match for "${lowerSkill}" — using smart fallback generator`);
  const fallbackData = getSmartFallbackRoadmap(normalizedSkill, webContext);
  return ensure5Phases(fallbackData, normalizedSkill);
}


export function ensure5Phases(data: any, skillName?: string): RoadmapGenerationResult {
  if (!data || !data.phases) return data;
  const targetSkill = skillName || data.skillName || 'General Skill';

  const phases = [...data.phases];
  if (phases.length >= 5) {
    return {
      ...data,
      skillName: targetSkill,
      totalPhases: phases.length
    };
  }

  const easy = 'EASY' as Difficulty;
  const med = 'MEDIUM' as Difficulty;
  const hard = 'HARD' as Difficulty;
  const lc = targetSkill.toLowerCase();

  // ─── Classify domain for contextual phase content ───────────────────────────
  const isWeb = ['html', 'css', 'javascript', 'js', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'tailwind', 'sass', 'frontend', 'web design'].some(k => lc.includes(k));
  const isBackend = ['node', 'express', 'fastapi', 'django', 'flask', 'spring', 'backend', 'rest', 'api', 'server'].some(k => lc.includes(k));
  const isData = ['data', 'pandas', 'numpy', 'ml', 'machine learning', 'tensorflow', 'pytorch', 'analytics', 'tableau', 'power bi', 'spark'].some(k => lc.includes(k));
  const isSecurity = ['security', 'hacking', 'pentest', 'owasp', 'cryptography', 'network'].some(k => lc.includes(k));
  const isMobile = ['flutter', 'swift', 'kotlin', 'ios', 'android', 'react native', 'mobile'].some(k => lc.includes(k));
  const isCloud = ['aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker', 'devops', 'terraform'].some(k => lc.includes(k));

  let phase4: any;
  let phase5: any;

  if (isWeb) {
    phase4 = {
      title: `Phase ${phases.length + 1}: Performance, Accessibility & Advanced Patterns`,
      description: `Optimise render speed, ensure WCAG accessibility, and apply advanced ${targetSkill} design patterns.`,
      order: phases.length + 1,
      concepts: [
        { title: 'Web Performance Optimisation', description: 'Minimise load times with lazy loading, code splitting, and asset compression.', content: `# Web Performance\n\n## Core Web Vitals\n- **LCP** (Largest Contentful Paint): < 2.5s\n- **FID** (First Input Delay): < 100ms\n- **CLS** (Cumulative Layout Shift): < 0.1\n\n## Techniques\n\`\`\`html\n<!-- Lazy load images -->\n<img src="hero.jpg" loading="lazy" alt="Hero">\n\`\`\`\n\`\`\`js\n// Code-split with dynamic import\nconst Chart = await import('./Chart.js');\n\`\`\``, difficulty: med, estimatedMinutes: 65, order: 1 },
        { title: 'Accessibility (WCAG 2.1)', description: 'Make web content usable for everyone including screen readers and keyboard navigation.', content: `# Web Accessibility\n\n## Key Principles (POUR)\n- **Perceivable** — text alternatives, captions\n- **Operable** — keyboard accessible, no seizure triggers\n- **Understandable** — readable, predictable\n- **Robust** — parseable, compatible with assistive tech\n\n## Practical Examples\n\`\`\`html\n<button aria-label="Close dialog">✕</button>\n<img src="logo.png" alt="Company logo">\n<label for="email">Email Address</label>\n<input id="email" type="email">\n\`\`\``, difficulty: med, estimatedMinutes: 60, order: 2 },
        { title: 'Component Architecture & Reusability', description: 'Build scalable component libraries with atomic design methodology.', content: `# Component Architecture\n\n## Atomic Design\n- **Atoms**: Button, Input, Badge\n- **Molecules**: SearchBar, FormField\n- **Organisms**: Header, ProductCard\n- **Templates**: PageLayout\n- **Pages**: Dashboard, Profile\n\n## Design System Principles\n- Single responsibility per component\n- Prop-driven customisation\n- Consistent design tokens for colors/spacing`, difficulty: hard, estimatedMinutes: 70, order: 3 },
        { title: 'Browser DevTools Mastery', description: 'Profile paint cycles, memory leaks, and network waterfalls.', content: `# Chrome DevTools Deep Dive\n\n## Performance Tab\n- Record runtime and identify long tasks (>50ms)\n- Find forced synchronous layouts\n\n## Memory Tab\n- Heap snapshots to detect memory leaks\n- Identify detached DOM nodes\n\n## Network Tab\n- Waterfall analysis for render-blocking resources\n- Cache-control header inspection`, difficulty: med, estimatedMinutes: 55, order: 4 }
      ]
    };
    phase5 = {
      title: `Phase ${phases.length + 2}: Build & Deploy — Production ${targetSkill} Project`,
      description: `Deploy a polished, production-ready ${targetSkill} project with real hosting, a CI/CD pipeline, and comprehensive documentation.`,
      order: phases.length + 2,
      concepts: [
        { title: 'Build Tools & Bundling', description: 'Configure Vite, Webpack, or Rollup for optimal production builds.', content: `# Modern Build Tooling\n\n## Vite Config\n\`\`\`js\n// vite.config.js\nimport { defineConfig } from 'vite';\nexport default defineConfig({\n  build: {\n    rollupOptions: {\n      output: { manualChunks: { vendor: ['react'] } }\n    }\n  }\n});\n\`\`\`\n\n## Build Output Analysis\n\`\`\`bash\nnpx vite-bundle-visualizer\n\`\`\``, difficulty: med, estimatedMinutes: 60, order: 1 },
        { title: 'Hosting & CDN Deployment', description: 'Deploy to Vercel, Netlify, or GitHub Pages with custom domains.', content: `# Deployment Options\n\n## Vercel (Recommended for React/Next.js)\n\`\`\`bash\nnpm i -g vercel\nvercel deploy --prod\n\`\`\`\n\n## Netlify via CLI\n\`\`\`bash\nnpm i -g netlify-cli\nnetlify deploy --prod --dir=dist\n\`\`\`\n\n## GitHub Pages (Static)\n\`\`\`bash\nnpm run build\nghpages --dist dist\n\`\`\``, difficulty: med, estimatedMinutes: 55, order: 2 },
        { title: 'CI/CD with GitHub Actions', description: 'Automate lint, test, and build pipelines on every commit.', content: `# GitHub Actions Pipeline\n\n\`\`\`yaml\nname: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npm run build\n\`\`\``, difficulty: hard, estimatedMinutes: 65, order: 3 },
        { title: 'Capstone Portfolio Project', description: `Build a complete, deployable ${targetSkill} application that demonstrates all skills learned.`, content: `# Capstone Project Brief\n\n## Requirements\n1. **Responsive UI**: Mobile-first layout with ≥2 breakpoints\n2. **Accessibility**: WCAG 2.1 AA compliant (run axe DevTools audit)\n3. **Performance**: Lighthouse score ≥ 90 for Performance & Accessibility\n4. **Deployment**: Live URL on Vercel/Netlify with custom domain\n5. **Documentation**: Full README with setup, architecture, and screenshots\n\n## Ideas\n- Personal portfolio website\n- Animated landing page for a product\n- Interactive data dashboard\n- Blog with MDX support`, difficulty: hard, estimatedMinutes: 180, order: 4 }
      ]
    };
  } else if (isData) {
    phase4 = {
      title: `Phase ${phases.length + 1}: Model Evaluation, Feature Engineering & Pipelines`,
      description: 'Master robust model selection, cross-validation, feature engineering, and ML pipeline construction.',
      order: phases.length + 1,
      concepts: [
        { title: 'Feature Engineering & Selection', description: 'Transform raw data into informative features that improve model accuracy.', content: `# Feature Engineering\n\n## Encoding Categorical Variables\n\`\`\`python\nfrom sklearn.preprocessing import OneHotEncoder, LabelEncoder\nenc = OneHotEncoder(sparse=False)\nX_encoded = enc.fit_transform(df[['city']])\n\`\`\`\n\n## Scaling\n\`\`\`python\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X_train)\n\`\`\`\n\n## Feature Importance (Tree-Based)\n\`\`\`python\nfrom sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier()\nmodel.fit(X, y)\nprint(model.feature_importances_)\n\`\`\``, difficulty: med, estimatedMinutes: 75, order: 1 },
        { title: 'Cross-Validation & Hyperparameter Tuning', description: 'Reliably evaluate models with k-fold CV and optimise with GridSearchCV.', content: `# Model Evaluation\n\n## K-Fold Cross-Validation\n\`\`\`python\nfrom sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5, scoring='accuracy')\nprint(f"CV Accuracy: {scores.mean():.2f} ± {scores.std():.2f}")\n\`\`\`\n\n## GridSearchCV\n\`\`\`python\nfrom sklearn.model_selection import GridSearchCV\nparams = {'n_estimators': [100, 200], 'max_depth': [5, 10, None]}\ngrid = GridSearchCV(RandomForestClassifier(), params, cv=5)\ngrid.fit(X_train, y_train)\nprint(grid.best_params_)\n\`\`\``, difficulty: hard, estimatedMinutes: 80, order: 2 },
        { title: 'ML Pipelines with Scikit-learn', description: 'Chain preprocessing and modelling steps into reproducible pipelines.', content: `# Scikit-learn Pipelines\n\n\`\`\`python\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\n\npipeline = Pipeline([\n    ('imputer', SimpleImputer(strategy='median')),\n    ('scaler', StandardScaler()),\n    ('model', RandomForestClassifier(n_estimators=100))\n])\npipeline.fit(X_train, y_train)\npipeline.score(X_test, y_test)\n\`\`\``, difficulty: hard, estimatedMinutes: 70, order: 3 },
        { title: 'Data Visualisation for Insights', description: 'Build publication-quality charts with Matplotlib, Seaborn, and Plotly.', content: `# Data Visualisation\n\n\`\`\`python\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\n# Distribution plot\nsns.histplot(df['age'], kde=True)\nplt.title('Age Distribution')\nplt.show()\n\n# Correlation heatmap\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\nplt.show()\n\`\`\``, difficulty: med, estimatedMinutes: 60, order: 4 }
      ]
    };
    phase5 = {
      title: `Phase ${phases.length + 2}: End-to-End ${targetSkill} Capstone Project`,
      description: 'Deliver a complete data science or ML project from raw data to deployed model with a presentation.',
      order: phases.length + 2,
      concepts: [
        { title: 'Exploratory Data Analysis (EDA) Report', description: 'Perform a comprehensive EDA and present findings with visualisations.', content: `# EDA Workflow\n\n1. **Load & inspect**: shape, dtypes, head()\n2. **Missing values**: heatmap, imputation strategy\n3. **Distributions**: histplots, boxplots per feature\n4. **Correlations**: heatmap, pairplot\n5. **Outlier detection**: IQR method, z-score\n6. **Target analysis**: class balance, distribution`, difficulty: med, estimatedMinutes: 90, order: 1 },
        { title: 'Model Training & Comparison', description: 'Train multiple models and compare via metrics table.', content: `# Model Comparison\n\n\`\`\`python\nfrom sklearn.metrics import classification_report\n\nmodels = {\n    'Logistic Regression': LogisticRegression(),\n    'Random Forest': RandomForestClassifier(),\n    'XGBoost': XGBClassifier()\n}\n\nfor name, model in models.items():\n    model.fit(X_train, y_train)\n    preds = model.predict(X_test)\n    print(f"\\n{name}\\n", classification_report(y_test, preds))\n\`\`\``, difficulty: hard, estimatedMinutes: 100, order: 2 },
        { title: 'Model Deployment with FastAPI', description: 'Serve a trained model as a REST API endpoint.', content: `# Serving ML Models\n\n\`\`\`python\nimport joblib\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\nmodel = joblib.load('model.pkl')\n\nclass Input(BaseModel):\n    feature1: float\n    feature2: float\n\n@app.post('/predict')\ndef predict(data: Input):\n    features = [[data.feature1, data.feature2]]\n    pred = model.predict(features)[0]\n    return {'prediction': int(pred)}\n\`\`\``, difficulty: hard, estimatedMinutes: 120, order: 3 },
        { title: 'Capstone Final Presentation', description: 'Write a Jupyter notebook report and GitHub README summarising the project.', content: `# Capstone Deliverables\n\n## 1. Jupyter Notebook\n- Problem statement and motivation\n- EDA section with 6+ visualisations\n- 3+ models compared with metrics\n- Best model explanation (SHAP values)\n\n## 2. GitHub Repository\n- requirements.txt or environment.yml\n- Clear README with dataset source, results table, and setup guide\n- Model artifact (.pkl)\n\n## 3. (Optional) Deployed API\n- FastAPI app on Render or Railway\n- Live endpoint that accepts JSON and returns predictions`, difficulty: hard, estimatedMinutes: 150, order: 4 }
      ]
    };
  } else if (isCloud) {
    phase4 = {
      title: `Phase ${phases.length + 1}: Security, IAM & Cost Optimisation`,
      description: 'Harden cloud infrastructure with identity management, network policies, and cost controls.',
      order: phases.length + 1,
      concepts: [
        { title: 'Identity & Access Management (IAM)', description: 'Apply least-privilege policies and manage roles, users, and service accounts.', content: `# Cloud IAM Essentials\n\n## Principle of Least Privilege\nGrant only the permissions a resource needs to perform its function.\n\n## AWS IAM Policy Example\n\`\`\`json\n{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["s3:GetObject"],\n    "Resource": "arn:aws:s3:::my-bucket/*"\n  }]\n}\n\`\`\`\n\n## Best Practices\n- Enable MFA for root and admin users\n- Use IAM roles for EC2/Lambda instead of access keys\n- Rotate access keys every 90 days`, difficulty: hard, estimatedMinutes: 75, order: 1 },
        { title: 'Network Security Groups & VPC Design', description: 'Segment cloud resources with VPCs, subnets, and security groups.', content: `# VPC Architecture\n\n## Three-Tier Architecture\n\`\`\`\nPublic Subnet  → Load Balancer\nPrivate Subnet → Application servers\nData Subnet   → RDS / ElastiCache\n\`\`\`\n\n## Security Group Rules\n- Allow inbound 443 from 0.0.0.0/0 on ALB only\n- Allow EC2 inbound only from ALB security group\n- RDS inbound only from EC2 security group\n- Deny all other inbound by default`, difficulty: hard, estimatedMinutes: 80, order: 2 },
        { title: 'Infrastructure as Code (Terraform)', description: 'Provision and manage cloud resources declaratively with Terraform.', content: `# Terraform Basics\n\n\`\`\`hcl\n# main.tf\nterraform {\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "~> 5.0" }\n  }\n}\n\nresource "aws_s3_bucket" "app" {\n  bucket = "my-app-assets-2024"\n  tags   = { Environment = "Production" }\n}\n\`\`\`\n\n\`\`\`bash\nterraform init\nterraform plan\nterraform apply -auto-approve\n\`\`\``, difficulty: hard, estimatedMinutes: 90, order: 3 },
        { title: 'Cloud Cost Management', description: 'Monitor spend with cost explorer, set budgets, and apply cost-saving strategies.', content: `# Cloud Cost Optimisation\n\n## Reserved vs On-Demand vs Spot\n| Type | Cost | Use Case |\n|------|------|----------|\n| On-Demand | 100% | Dev, unpredictable load |\n| Reserved 1yr | ~40% off | Steady production workloads |\n| Spot | ~70-90% off | Batch jobs, fault-tolerant workloads |\n\n## Tagging Strategy\nTag every resource with: Environment, Team, CostCenter, Project\n\n## Auto-Scaling\nScale down in off-hours using scheduled scaling policies`, difficulty: med, estimatedMinutes: 65, order: 4 }
      ]
    };
    phase5 = {
      title: `Phase ${phases.length + 2}: Production Architecture & Capstone Deployment`,
      description: 'Design a production-grade cloud architecture and deploy a real-world application.',
      order: phases.length + 2,
      concepts: [
        { title: 'High Availability & Disaster Recovery', description: 'Design multi-AZ, multi-region architectures with RTO/RPO targets.', content: `# HA & DR Design\n\n## Key Metrics\n- **RTO** (Recovery Time Objective): Max acceptable downtime\n- **RPO** (Recovery Point Objective): Max acceptable data loss\n\n## Multi-AZ Setup\n- Deploy across ≥ 2 Availability Zones\n- Use RDS Multi-AZ for automatic failover\n- Enable S3 versioning and cross-region replication\n\n## Disaster Recovery Strategies\n1. Backup & Restore (cheapest, longest RTO)\n2. Pilot Light (core services ready, scale on demand)\n3. Warm Standby (scaled-down production runs always)\n4. Multi-Site Active-Active (zero downtime, most expensive)`, difficulty: hard, estimatedMinutes: 90, order: 1 },
        { title: 'Observability: Logs, Metrics & Tracing', description: 'Implement the three pillars of observability using cloud-native tooling.', content: `# Observability Pillars\n\n## Logs (CloudWatch / Loki)\n\`\`\`bash\n# Stream Lambda logs\naws logs tail /aws/lambda/my-function --follow\n\`\`\`\n\n## Metrics (CloudWatch / Prometheus)\n- CPU, Memory, Request Rate, Error Rate, Latency\n- Set alarms: SNS → PagerDuty\n\n## Distributed Tracing (X-Ray / Jaeger)\n- Trace requests across microservices\n- Identify latency bottlenecks in service calls`, difficulty: hard, estimatedMinutes: 85, order: 2 },
        { title: 'Capstone: Deploy a 3-Tier Cloud Application', description: 'End-to-end deployment of a containerised application on cloud infrastructure.', content: `# Capstone Architecture\n\n## Stack\n- **Frontend**: React SPA → S3 + CloudFront CDN\n- **Backend**: Node.js API → ECS Fargate\n- **Database**: PostgreSQL → RDS Multi-AZ\n- **Cache**: Redis → ElastiCache\n- **Load Balancer**: ALB with SSL termination\n\n## Deliverables\n1. Terraform IaC for all infrastructure\n2. Dockerfile + GitHub Actions CI/CD pipeline\n3. CloudWatch dashboard with key metrics\n4. Architecture diagram (draw.io)\n5. Cost estimate from AWS Pricing Calculator`, difficulty: hard, estimatedMinutes: 180, order: 3 }
      ]
    };
  } else {
    // General fallback — better than before but still domain-aware via skill name injection
    phase4 = {
      title: `Phase ${phases.length + 1}: Advanced ${targetSkill} — Patterns, Tooling & Quality`,
      description: `Go beyond the basics with advanced ${targetSkill} paradigms, professional tooling, automated testing, and code quality standards.`,
      order: phases.length + 1,
      concepts: [
        { title: `Advanced ${targetSkill} Patterns`, description: `Apply expert-level patterns and paradigms specific to ${targetSkill}.`, content: `# Advanced Patterns in ${targetSkill}\n\n## Why Patterns Matter\nPatterns solve recurring design problems without reinventing the wheel.\n\n## Key Areas to Master\n- **Separation of concerns**: divide logic into focused modules\n- **Dependency management**: abstract external dependencies for testability\n- **Error handling strategies**: fail fast, recover gracefully\n- **Code organisation**: consistent folder structure and naming conventions\n\n## Refactoring Techniques\n- Extract function / class\n- Replace conditionals with polymorphism\n- Introduce intermediate abstraction layers`, difficulty: hard, estimatedMinutes: 75, order: 1 },
        { title: 'Automated Testing Strategy', description: 'Write unit, integration, and end-to-end tests to prevent regressions.', content: `# Testing Pyramid\n\n\`\`\`\n        /\\\n       /E2E\\\n      /------\\\n     /  Integ  \\\n    /----------\\\n   /    Unit     \\\n  /──────────────\\\n\`\`\`\n\n## Best Practices\n- Unit tests: fast, isolated, no I/O\n- Integration tests: test component boundaries\n- E2E tests: cover critical user journeys only\n- Aim for 80%+ line coverage on business logic\n- Run tests on every commit via CI`, difficulty: med, estimatedMinutes: 70, order: 2 },
        { title: 'Code Quality & Linting', description: 'Enforce consistency with linters, formatters, and pre-commit hooks.', content: `# Code Quality Toolchain\n\n## Linting\nLinters catch bugs and enforce style before runtime:\n- ESLint (JavaScript/TypeScript)\n- Pylint / Ruff (Python)\n- Checkstyle / PMD (Java)\n\n## Formatting\n- Prettier / Black / gofmt for zero-config auto-formatting\n\n## Pre-commit Hooks\n\`\`\`bash\n# Install pre-commit\npip install pre-commit\npre-commit install\n\`\`\`\n\nRun lint + format automatically before every git commit.`, difficulty: med, estimatedMinutes: 50, order: 3 },
        { title: 'Documentation & Developer Experience', description: 'Write effective inline docs, README files, and API documentation.', content: `# Developer Documentation\n\n## README Structure\n1. **What it is** — one sentence description\n2. **Quick start** — 3-step install + run\n3. **Features** — bulleted list with screenshots\n4. **Architecture** — diagram or explanation\n5. **Contributing** — PR guidelines, coding standards\n6. **License**\n\n## Inline Documentation\n- Document *why*, not *what*\n- Use docstrings for public APIs\n- Keep comments up to date with code changes`, difficulty: easy, estimatedMinutes: 45, order: 4 }
      ]
    };
    phase5 = {
      title: `Phase ${phases.length + 2}: Mastery, Portfolio & Career Readiness in ${targetSkill}`,
      description: `Consolidate everything you've learned, build a portfolio-worthy project, and position yourself for real-world opportunities in ${targetSkill}.`,
      order: phases.length + 2,
      concepts: [
        { title: `Capstone Project: Showcase Your ${targetSkill} Skills`, description: `Build a complete, original project that demonstrates end-to-end mastery of ${targetSkill}.`, content: `# Capstone Project Brief\n\n## Goal\nCreate a polished, real-world project using everything you've learned in ${targetSkill}.\n\n## Requirements Checklist\n- [ ] Solves a genuine problem or creates something meaningful\n- [ ] Applies at least 3 major concepts from the roadmap\n- [ ] Has clear documentation (README with setup, screenshots, architecture notes)\n- [ ] Hosted or shareable publicly (GitHub, YouTube demo, or live link)\n\n## Ideas by Domain\n- **Technical**: Working application, tool, or library\n- **Creative**: Final piece, portfolio gallery, or published work\n- **Analytical**: End-to-end analysis report with findings and visualisations\n- **Conceptual**: Written guide, tutorial, or teaching resource\n\n## Presentation Structure\n1. What you built and why (2 min)\n2. Key skills applied (3 min)\n3. Demo or walkthrough (5 min)\n4. What you struggled with and how you solved it (2 min)\n5. What you'd do next (1 min)`, difficulty: hard, estimatedMinutes: 180, order: 1 },
        { title: 'Building Your Portfolio', description: 'Package your work attractively so employers, collaborators, or clients can evaluate your skills.', content: `# Portfolio Strategy\n\n## What Makes a Strong Portfolio\n- **Quality over quantity**: 3 excellent projects beat 10 mediocre ones\n- **Narrative**: Each project should tell a story — problem → solution → impact\n- **Diversity**: Show range in complexity, style, or domain\n\n## Portfolio Platforms\n| Platform | Best For |\n|----------|----------|\n| GitHub | Code projects (README is your storefront) |\n| Behance / Dribbble | Design work |\n| Kaggle | Data science & ML work |\n| Medium / Dev.to | Written technical content |\n| Personal website | Full creative control, all domains |\n\n## README Template\n1. One-sentence description\n2. Live link or demo GIF\n3. Technologies / tools used\n4. Setup instructions\n5. Key learning takeaways`, difficulty: med, estimatedMinutes: 75, order: 2 },
        { title: 'Interview & Assessment Preparation', description: `Prepare for technical interviews, portfolio reviews, or client pitches in ${targetSkill}.`, content: `# Interview Readiness for ${targetSkill}\n\n## Types of Assessment\n- **Technical interview**: Live problem-solving, whiteboard, or take-home challenge\n- **Portfolio review**: Walk reviewers through your best project\n- **Conceptual questions**: Theory, tradeoffs, and "why" decisions\n\n## Common Interview Topics\n- Core fundamentals (expect beginner-to-advanced questions)\n- Real-world scenario problems\n- Debugging a broken sample\n- Explaining your project decisions\n\n## Practice Resources\n- LeetCode / HackerRank (for algorithmic roles)\n- Pramp / interviewing.io (live mock interviews)\n- Domain-specific online assessments\n- Peer review sessions with other learners\n\n## Tips\n- Think out loud — interviewers evaluate your reasoning\n- Ask clarifying questions before diving in\n- Know the tradeoffs of your design decisions`, difficulty: med, estimatedMinutes: 90, order: 3 },
        { title: 'Continued Learning & Community Engagement', description: 'Map your path beyond this roadmap and connect with communities that accelerate your growth.', content: `# Life-Long Learning in ${targetSkill}\n\n## What to Learn Next\n- Identify 1–2 adjacent skills that complement ${targetSkill}\n- Pick a specialisation or advanced track based on your interests\n- Follow leading practitioners and researchers in this field\n\n## Community Channels\n- **Discord / Slack**: Join active communities in your domain\n- **Reddit**: r/learnprogramming, r/design, r/datascience, or topic-specific subs\n- **Meetups**: Local and virtual (Meetup.com, Eventbrite)\n- **Open Source**: Contribute to projects you use — great for visibility and learning\n\n## Learning Habits to Keep\n- Daily deliberate practice (30–60 min beats weekend cramming)\n- Build in public — share progress on Twitter/X or LinkedIn\n- Teach others — writing, mentoring, or presenting forces deep understanding\n- Review your own old projects quarterly — you'll be surprised how much you've grown`, difficulty: easy, estimatedMinutes: 45, order: 4 }
      ]
    };
  }

  phases.push(phase4);
  if (phases.length < 5) phases.push(phase5);

  return {
    ...data,
    skillName: targetSkill,
    totalPhases: phases.length,
    estimatedWeeks: (data.estimatedWeeks || 6) + 4,
    phases
  };
}

function extractTopicsFromWebContext(webContext?: string): string[] {
  if (!webContext) return [];
  const topics: string[] = [];
  const lines = webContext.split('\n');
  for (const line of lines) {
    const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
    if (!cleanLine) continue;

    const colonIndex = cleanLine.indexOf(':');
    let title = '';
    let description = '';
    if (colonIndex !== -1) {
      title = cleanLine.substring(0, colonIndex).trim();
      description = cleanLine.substring(colonIndex + 1).trim();
    } else {
      title = cleanLine;
    }

    const dashParts = title.split(' - ');
    const firstDash = dashParts[0] || '';
    const pipeParts = firstDash.split(' | ');
    title = (pipeParts[0] || '').trim();

    if (title && title.length > 3 && title.length < 50) {
      const cleanedTitle = title
        .replace(/\b(?:course|syllabus|curriculum|tutorial|class|training|certification|intro|introduction)\b\s*(?:to|of|for\b)?/gi, '')
        .trim();
      if (cleanedTitle && cleanedTitle.length > 2) {
        topics.push(cleanedTitle);
      }
    }

    if (description) {
      const triggers = /(?:covers|covering|including|includes|learn|topics include|focuses on)\s+([^.]+)/i;
      const match = description.match(triggers);
      if (match && match[1]) {
        const listItems = match[1]
          .split(/,|\band\b|\bor\b/gi)
          .map(item => item.trim())
          .filter(item => item.length > 2 && item.length < 30);
        for (const item of listItems) {
          const cleanedItem = item.replace(/^[a-z]/, c => c.toUpperCase());
          if (!topics.includes(cleanedItem)) {
            topics.push(cleanedItem);
          }
        }
      }
    }
  }

  const finalTopics: string[] = [];
  const seen = new Set<string>();
  for (const topic of topics) {
    const lower = topic.toLowerCase();
    if (!seen.has(lower) && !lower.includes('no detailed information') && !lower.includes('could not retrieve')) {
      seen.add(lower);
      finalTopics.push(topic);
    }
  }

  return finalTopics;
}

function getSmartFallbackRoadmap(skillName: string, webContext?: string): RoadmapGenerationResult {
  const lowerSkill = skillName.toLowerCase();
  const easy = 'EASY' as Difficulty;
  const med = 'MEDIUM' as Difficulty;
  const hard = 'HARD' as Difficulty;

  // Categorize
  let category: 'creative' | 'data' | 'security' | 'game' | 'database' | 'programming' | 'general' = 'general';

  if (
    lowerSkill.includes('guitar') ||
    lowerSkill.includes('piano') ||
    lowerSkill.includes('singing') ||
    lowerSkill.includes('music') ||
    lowerSkill.includes('baking') ||
    lowerSkill.includes('cooking') ||
    lowerSkill.includes('french') ||
    lowerSkill.includes('spanish') ||
    lowerSkill.includes('language') ||
    lowerSkill.includes('photography') ||
    lowerSkill.includes('photo') ||
    lowerSkill.includes('painting') ||
    lowerSkill.includes('drawing') ||
    lowerSkill.includes('art') ||
    lowerSkill.includes('sculpting') ||
    lowerSkill.includes('knitting') ||
    lowerSkill.includes('craft') ||
    lowerSkill.includes('gardening') ||
    lowerSkill.includes('acting') ||
    lowerSkill.includes('writing') ||
    lowerSkill.includes('reading') ||
    lowerSkill.includes('dance') ||
    lowerSkill.includes('fitness') ||
    lowerSkill.includes('yoga') ||
    lowerSkill.includes('figma') ||
    lowerSkill.includes('photoshop') ||
    lowerSkill.includes('illustrator') ||
    lowerSkill.includes('indesign') ||
    lowerSkill.includes('premiere') ||
    lowerSkill.includes('blender') ||
    lowerSkill.includes('sketch') ||
    lowerSkill.includes('canva') ||
    lowerSkill.includes('ui/ux') ||
    lowerSkill.includes('ui-ux') ||
    lowerSkill.includes('design')
  ) {
    category = 'creative';
  } else if (
    lowerSkill.includes('data') ||
    lowerSkill.includes('pandas') ||
    lowerSkill.includes('numpy') ||
    lowerSkill.includes('tableau') ||
    lowerSkill.includes('power bi') ||
    lowerSkill.includes('powerbi') ||
    lowerSkill.includes('excel') ||
    lowerSkill.includes('math') ||
    lowerSkill.includes('science') ||
    lowerSkill.includes('statistics') ||
    lowerSkill.includes('analytics') ||
    lowerSkill.includes('probability') ||
    lowerSkill.includes('regression') ||
    lowerSkill.includes('clustering')
  ) {
    category = 'data';
  } else if (
    lowerSkill.includes('security') ||
    lowerSkill.includes('cybersecurity') ||
    lowerSkill.includes('hacking') ||
    lowerSkill.includes('pentest') ||
    lowerSkill.includes('penetration') ||
    lowerSkill.includes('nmap') ||
    lowerSkill.includes('kali') ||
    lowerSkill.includes('burp') ||
    lowerSkill.includes('owasp') ||
    lowerSkill.includes('cryptography') ||
    lowerSkill.includes('firewall') ||
    lowerSkill.includes('sniff')
  ) {
    category = 'security';
  } else if (
    lowerSkill.includes('game') ||
    lowerSkill.includes('unity') ||
    lowerSkill.includes('unreal') ||
    lowerSkill.includes('godot') ||
    lowerSkill.includes('3d') ||
    lowerSkill.includes('render') ||
    lowerSkill.includes('blender') ||
    lowerSkill.includes('rigging') ||
    lowerSkill.includes('animation')
  ) {
    category = 'game';
  } else if (
    lowerSkill.includes('database') ||
    lowerSkill.includes('sql') ||
    lowerSkill.includes('nosql') ||
    lowerSkill.includes('mysql') ||
    lowerSkill.includes('postgres') ||
    lowerSkill.includes('postgresql') ||
    lowerSkill.includes('sqlite') ||
    lowerSkill.includes('mongodb') ||
    lowerSkill.includes('redis') ||
    lowerSkill.includes('cassandra') ||
    lowerSkill.includes('schema') ||
    lowerSkill.includes('query')
  ) {
    category = 'database';
  } else if (
    lowerSkill.includes('programming') ||
    lowerSkill.includes('coding') ||
    lowerSkill.includes('developer') ||
    lowerSkill.includes('react') ||
    lowerSkill.includes('vue') ||
    lowerSkill.includes('angular') ||
    lowerSkill.includes('next.js') ||
    lowerSkill.includes('express') ||
    lowerSkill.includes('node') ||
    lowerSkill.includes('typescript') ||
    lowerSkill.includes('javascript') ||
    lowerSkill.includes('c++') ||
    lowerSkill.includes('cpp') ||
    lowerSkill.includes('c plus plus') ||
    lowerSkill.includes('rust') ||
    lowerSkill.includes('go') ||
    lowerSkill.includes('golang') ||
    lowerSkill.includes('java') ||
    lowerSkill.includes('c#') ||
    lowerSkill.includes('csharp') ||
    lowerSkill.includes('php') ||
    lowerSkill.includes('python') ||
    lowerSkill.includes('laravel') ||
    lowerSkill.includes('django') ||
    lowerSkill.includes('flask') ||
    lowerSkill.includes('flutter') ||
    lowerSkill.includes('react native') ||
    lowerSkill.includes('swift') ||
    lowerSkill.includes('kotlin') ||
    lowerSkill.includes('docker') ||
    lowerSkill.includes('kubernetes') ||
    lowerSkill.includes('aws') ||
    lowerSkill.includes('cloud') ||
    lowerSkill.includes('devops') ||
    lowerSkill.includes('git') ||
    lowerSkill.includes('github') ||
    lowerSkill.includes('linux') ||
    lowerSkill.includes('api') ||
    lowerSkill.includes('graphql') ||
    lowerSkill.includes('rest') ||
    lowerSkill.includes('compiler')
  ) {
    category = 'programming';
  }

  // Generate category-appropriate attributes
  let overview = `A structured learning roadmap custom-designed for mastering ${skillName}. Learn core conventions, practical operations, and advanced workflows in ${skillName}.`;
  if (webContext) {
    overview += `\n\nReal-world context: ${webContext}`;
  }
  let prerequisites = [`Basic understanding of the scope of ${skillName}`];
  let targetAudience = `Aspiring practitioners, students, and professionals interested in ${skillName}.`;
  let estimatedWeeks = 8;
  let phases: RoadmapGenerationResult['phases'] = [];

  if (category === 'creative') {
    prerequisites = ['No technical setup needed', 'Personal equipment or access to the instruments'];
    targetAudience = `Hobbyists, artists, and creators aiming to build practical skills in ${skillName}.`;
    estimatedWeeks = 6;
    phases = [
      {
        title: `Phase 1: Getting Started & Basics of ${skillName}`,
        description: `Establish a rock-solid foundation, learn safety/etiquette, and set up your ${skillName} workspace.`,
        order: 1,
        concepts: [
          {
            title: `Introduction to ${skillName}`,
            description: `Learn the origin, history, and core objectives of ${skillName}.`,
            content: `# Introduction to ${skillName}\n\nExplore the basic guidelines and principles behind ${skillName}. Set initial target goals and milestones.\n\n### Essential Resources\n- Search local workshops and guides.\n- Keep a practice journal to track progress.`,
            difficulty: easy,
            estimatedMinutes: 30,
            order: 1
          },
          {
            title: `Essential Tools & Materials`,
            description: `Understand the primary equipment, items, or instruments required to practice ${skillName}.`,
            content: `# Tools & Equipment\n\nTo master ${skillName}, you need the correct tools:\n- Identify high-quality items vs cheap starter tools.\n- Learn routine maintenance, storage, and cleaning guidelines.`,
            difficulty: easy,
            estimatedMinutes: 40,
            order: 2
          },
          {
            title: `Core Mechanics & Basic Exercises`,
            description: `Practice initial setups, basic postures, or introductory workflows in ${skillName}.`,
            content: `# Core Mechanics\n\nBegin practicing the basic actions:\n- Maintain correct posture or hold positions.\n- Focus on safety, pacing, and basic repetitions.`,
            difficulty: easy,
            estimatedMinutes: 45,
            order: 3
          },
          {
            title: `First Project: Simple ${skillName} Drill`,
            description: `Apply your basic knowledge to complete a simple, supervised ${skillName} practice.`,
            content: `# Simple Practice Project\n\nAssemble your first output:\n- Follow step-by-step procedures carefully.\n- Accept minor inconsistencies as you build confidence.`,
            difficulty: easy,
            estimatedMinutes: 50,
            order: 4
          }
        ]
      },
      {
        title: `Phase 2: Intermediate Techniques of ${skillName}`,
        description: `Enhance details precision, refine your actions, and introduce intermediate methodologies.`,
        order: 2,
        concepts: [
          {
            title: `Refining Controls & Accuracy`,
            description: `Improve your speed, accuracy, and detail management in ${skillName}.`,
            content: `# Refinement & Accuracy\n\nMove beyond basics by focusing on precision:\n- Identify areas of friction or sluggishness.\n- Run repetition drills targeting your weakest sections.`,
            difficulty: med,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: `Understanding Composition & Structure`,
            description: `Study the rules of combining separate elements (rhythm, composition, recipes) in ${skillName}.`,
            content: `# Composition & Structure\n\nLearn how elements blend together:\n- Study balance, contrast, or ingredient weights ratios.\n- Apply structural rules to ensure intermediate pieces look/sound professional.`,
            difficulty: med,
            estimatedMinutes: 70,
            order: 2
          },
          {
            title: `Advanced Tools & Stylistic Variations`,
            description: `Introduce supplementary tools or stylistic variations to expand your range in ${skillName}.`,
            content: `# Advanced Variations\n\nExpand your toolkit:\n- Introduce specialized instruments or secondary products.\n- Experiment with distinct creative styles or regional variations.`,
            difficulty: med,
            estimatedMinutes: 65,
            order: 3
          },
          {
            title: `Troubleshooting Common Mistakes`,
            description: `Identify, correct, and prevent standard errors or flaws that occur during intermediate ${skillName}.`,
            content: `# Troubleshooting Guide\n\nLearn to spot and fix mistakes early:\n- Diagnose structural cracks, tuning offsets, or execution errors.\n- Apply immediate corrections to salvage projects.`,
            difficulty: med,
            estimatedMinutes: 55,
            order: 4
          }
        ]
      },
      {
        title: `Phase 3: Professional Workflow & Expression`,
        description: `Develop your own custom styles and execute high-fidelity independent projects.`,
        order: 3,
        concepts: [
          {
            title: `Developing Your Personal Style`,
            description: `Experiment with self-expression, customization, and advanced projects in ${skillName}.`,
            content: `# Personal Expression\n\nCreate unique variations:\n- Deviate from standard formulas to build your custom imprint.\n- Research leading figures in ${skillName} for inspiration.`,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 1
          },
          {
            title: `Efficiency & Workplace Organization`,
            description: `Learn how professional practitioners organize their workspaces and optimize their time in ${skillName}.`,
            content: `# Professional Workflow\n\nOptimize your output:\n- Arrange tools for immediate access (mis-en-place for cooking/baking, workspace grids for art).\n- Minimize downtime and clean as you work.`,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 2
          },
          {
            title: `Collaboration & Constructive Critique`,
            description: `Learn how to present your ${skillName} work to others and incorporate constructive feedback.`,
            content: `# Feedback and Collaboration\n\nImprove through reviews:\n- Share images, audio recordings, or samples with community forums.\n- Implement review tips in your next cycle.`,
            difficulty: med,
            estimatedMinutes: 60,
            order: 3
          },
          {
            title: `Capstone Portfolio Project`,
            description: `Create a comprehensive, independent project showcasing all your ${skillName} capabilities.`,
            content: `# Capstone Project Guidelines\n\nPlan and execute a complete piece:\n1. Outline material parameters or storyboard.\n2. Complete execution phases systematically.\n3. Present final photographs, recordings, or physical samples for review.`,
            difficulty: hard,
            estimatedMinutes: 150,
            order: 4
          }
        ]
      }
    ];
  } else if (category === 'data') {
    prerequisites = ['Basic arithmetic', 'Spreadsheet or computer layouts literacy'];
    targetAudience = `Analysts, researchers, and engineers seeking data tools skills in ${skillName}.`;
    estimatedWeeks = 8;
    phases = [
      {
        title: `Phase 1: Foundations of Data Manipulation in ${skillName}`,
        description: `Import data columns, clean records, and aggregate values inside ${skillName}.`,
        order: 1,
        concepts: [
          { title: `Importing Datasets & Workspace Setup`, description: `Load tabular worksheets or database tables into ${skillName}.`, content: `# Ingestion\n\nSet up folders, connect to source APIs, and inspect variables.`, difficulty: easy, estimatedMinutes: 45, order: 1 },
          { title: `Cleaning Missing Records`, description: `Locate null rows and apply imputation or drop filters.`, content: `# Data Cleaning\n\nMessy inputs yield biased stats. Learn to resolve empty cells.`, difficulty: easy, estimatedMinutes: 50, order: 2 },
          { title: `Filtering and Sorting Columns`, description: `Isolate target values matching conditions.`, content: `# Queries & Filters\n\nFilter metrics based on date ranges, regions, or categories.`, difficulty: easy, estimatedMinutes: 50, order: 3 },
          { title: `Calculating Summary Metrics`, description: `Find mean, median, standard deviation, and count totals.`, content: `# Aggregations\n\nSummarize columns to extract fast insights.`, difficulty: easy, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: `Phase 2: Exploratory Analytics & Visualizations`,
        description: `Design dashboards, examine skewness, and map feature correlations in ${skillName}.`,
        order: 2,
        concepts: [
          { title: `Plotting Distributions`, description: `Recognize distributions shapes using histograms and box plots.`, content: `# Distributions\n\nSpot outliers and assess numerical distribution types.`, difficulty: med, estimatedMinutes: 60, order: 1 },
          { title: `Designing Interactive Dashboards`, description: `Expose metrics dynamically to stakeholders.`, content: `# Dashboard Design\n\nInclude filtering slicers and highlight key KPIs clearly.`, difficulty: med, estimatedMinutes: 80, order: 2 },
          { title: `Correlation & Relationships`, description: `Measure dependencies between variables.`, content: `# Correlation\n\nPlot scatter charts to see how values correlate.`, difficulty: med, estimatedMinutes: 70, order: 3 },
          { title: `Time Series and Trends`, description: `Analyze rolling averages and date-based shifts.`, content: `# Time Series\n\nIdentify seasonal patterns and long-term directions.`, difficulty: med, estimatedMinutes: 60, order: 4 }
        ]
      },
      {
        title: `Phase 3: Advanced Modeling & Analysis`,
        description: `Formulate hypothesis tests, run predictions, and compile business reports in ${skillName}.`,
        order: 3,
        concepts: [
          { title: `Hypothesis & A/B Testing`, description: `Evaluate changes statistical significance.`, content: `# A/B Testing\n\nFormulate hypotheses and inspect p-values.`, difficulty: hard, estimatedMinutes: 100, order: 1 },
          { title: `Regression & Forecasting Models`, description: `Set up prediction formulas for continuous outputs.`, content: `# Forecasting\n\nUtilize regression variables to predict future outcomes.`, difficulty: hard, estimatedMinutes: 110, order: 2 },
          { title: `Dimensionality & Grouping`, description: `Apply clustering methods to segment customer segments.`, content: `# Clustering\n\nGroup data points by proximity in feature spaces.`, difficulty: hard, estimatedMinutes: 90, order: 3 },
          { title: `Capstone Analytical Solution`, description: `Compile a complete data review deck from source to dashboard.`, content: `# Capstone Analytics\n\nClean, visualize, and forecast a custom dataset, drafting actionable insights slides.`, difficulty: hard, estimatedMinutes: 140, order: 4 }
        ]
      }
    ];
  } else if (category === 'security') {
    prerequisites = ['Basic networking layers understanding', 'Linux console literacy'];
    targetAudience = `Security engineers and system auditors seeking protection skills in ${skillName}.`;
    estimatedWeeks = 10;
    phases = [
      {
        title: `Phase 1: Basic Protocols & Setup`,
        description: `Set up testing sandboxes and audit network protocols.`,
        order: 1,
        concepts: [
          { title: `Ethics & Laboratory Setup`, description: `Install sandboxed hosts safely.`, content: `# Security Labs\n\nAlways verify permissions before testing target hosts.`, difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: `Networking Layers & Ports`, description: `Analyze IP ports, packets, and routing logs.`, content: `# Networking\n\nVerify how services communicate across ports.`, difficulty: easy, estimatedMinutes: 50, order: 2 },
          { title: `CLI Rights & Operating Systems`, description: `Master server permissions and console terminals.`, content: `# CLI Commands\n\nConfigure directory safety flags.`, difficulty: easy, estimatedMinutes: 45, order: 3 },
          { title: `Traffic Capture and Auditing`, description: `Inspect plain-text traffic packets.`, content: `# Sniffing\n\nEvaluate packets to spot unencrypted user credentials.`, difficulty: easy, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: `Phase 2: Vulnerability Audits & Exploit Vectors`,
        description: `Identify misconfigurations and simulate exploit injections.`,
        order: 2,
        concepts: [
          { title: `Active Port Service Enumeration`, description: `Scan targets to check software versions.`, content: `# Scanning\n\nLocate outdated services on open ports.`, difficulty: med, estimatedMinutes: 70, order: 1 },
          { title: `Application Input Injections`, description: `Audit forms and parameters inputs.`, content: `# Injection Vulnerabilities\n\nInject inputs to test parameter sanitization rules.`, difficulty: med, estimatedMinutes: 90, order: 2 },
          { title: `Access Bypass & Tokens`, description: `Audit cookie scopes and auth tokens.`, content: `# Authentication\n\nBypass weak password locks or hijack active session keys.`, difficulty: med, estimatedMinutes: 80, order: 3 },
          { title: `Exploitation Toolkits`, description: `Simulate safe audits inside sandbox domains.`, content: `# Exploit Tools\n\nRun scripts to confirm vulnerability exposures.`, difficulty: med, estimatedMinutes: 80, order: 4 }
        ]
      },
      {
        title: `Phase 3: Defensive Configuration & Auditing`,
        description: `Write protection rules, firewall rules, and technical risk reports.`,
        order: 3,
        concepts: [
          { title: `Firewalls & Event Triggers`, description: `Configure connection blocks and monitor logs.`, content: `# Defensive Firewalls\n\nRestrict ports access to authorized IPs.`, difficulty: hard, estimatedMinutes: 100, order: 1 },
          { title: `Log Audits & Incident Responses`, description: `Analyze login error spikes.`, content: `# Log Auditing\n\nReview syslog alerts to trace malicious indicators.`, difficulty: hard, estimatedMinutes: 100, order: 2 },
          { title: `Compliance Laws & Reporting`, description: `Classify vulnerabilities using standard security scales.`, content: `# Audit Reports\n\nDocument security flaws, ranking threats and outlining remediations.`, difficulty: hard, estimatedMinutes: 110, order: 3 },
          { title: `Capstone Penetration Test Lab`, description: `Complete a lab challenge finding and patching security holes.`, content: `# Capstone Security Audit\n\nEnumerate a target host, exploit it to find a secret flag, and patch the code.`, difficulty: hard, estimatedMinutes: 150, order: 4 }
        ]
      }
    ];
  } else if (category === 'game') {
    prerequisites = ['Vector coordinate geometry', 'Basic scripting syntax'];
    targetAudience = `Interactive designers and developers aiming to compile games in ${skillName}.`;
    estimatedWeeks = 10;
    phases = [
      {
        title: `Phase 1: Scene Layouts & Components`,
        description: `Orient coordinates, position cameras, and link basic scripts in ${skillName}.`,
        order: 1,
        concepts: [
          { title: `Editor Layouts & Viewports`, description: `Navigate hierarchies, project assets, and inspect elements.`, content: `# Workspaces\n\nLocate variables inside the editor.`, difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: `Vector Coordinates & Scaling`, description: `Understand positions, rotations, and scales.`, content: `# Vectors\n\nModify positions in 3D coordinate grids.`, difficulty: easy, estimatedMinutes: 45, order: 2 },
          { title: `Basic Script Components`, description: `Write standard scripts to respond to keystrokes.`, content: `# Scripting\n\nTranslate keyboards inputs to physical speed variables.`, difficulty: easy, estimatedMinutes: 60, order: 3 },
          { title: `Asset Prefabs templates`, description: `Create reusable objects to instantiate loops.`, content: `# Prefabs\n\nInstantiate projectile copies dynamically.`, difficulty: easy, estimatedMinutes: 40, order: 4 }
        ]
      },
      {
        title: `Phase 2: Physics, Collisions & Audio`,
        description: `Manage forces, detect collision borders, and configure sound mix panels in ${skillName}.`,
        order: 2,
        concepts: [
          { title: `Forces, gravity & Rigidbodies`, description: `Apply physical mass parameters to objects.`, content: `# Physics\n\nTrigger jumps and gravity falls.`, difficulty: med, estimatedMinutes: 70, order: 1 },
          { title: `Collision Colliders & Overlaps`, description: `Detect player collisions with power-ups.`, content: `# Colliders\n\nExecute overlap actions: increment score and destroy targets.`, difficulty: med, estimatedMinutes: 80, order: 2 },
          { title: `UI Canvas & Counters`, description: `Display values on persistent overlays.`, content: `# Game HUD\n\nAnchor score cards and health slides to screen edges.`, difficulty: med, estimatedMinutes: 65, order: 3 },
          { title: `Sound mixers & Triggers`, description: `Configure 3D audio drops and background loops.`, content: `# Game Sound\n\nTrigger crash sounds on collision frames.`, difficulty: med, estimatedMinutes: 60, order: 4 }
        ]
      },
      {
        title: `Phase 3: Core Game Loop & Platform Packaging`,
        description: `Build level transitions, manage global save data, and compile installers in ${skillName}.`,
        order: 3,
        concepts: [
          { title: `Level Loaders & Singletons`, description: `Coordinate scene transitions via global game states.`, content: `# Game Managers\n\nMaintain game states when switching levels.`, difficulty: hard, estimatedMinutes: 90, order: 1 },
          { title: `Memory optimization Pools`, description: `Recycle active objects to prevent frame lag.`, content: `# Optimization\n\nPool projectiles instead of recreating instances.`, difficulty: hard, estimatedMinutes: 100, order: 2 },
          { title: `Save Game Serialization`, description: `Store high scores locally on disk.`, content: `# Persistence\n\nWrite stats to local configurations.`, difficulty: hard, estimatedMinutes: 90, order: 3 },
          { title: `Platform Compilation Builds`, description: `Compile executables for desktop or mobile.`, content: `# Compilation\n\nRun compiler scripts to export a standalone game.`, difficulty: hard, estimatedMinutes: 120, order: 4 }
        ]
      }
    ];
  } else if (category === 'database') {
    prerequisites = ['Spreadsheet grids layouts familiarity'];
    targetAudience = `Backend designers and database users learning storage layouts in ${skillName}.`;
    estimatedWeeks = 8;
    phases = [
      {
        title: `Phase 1: Relational Layouts & basic CRUD`,
        description: `Design tables, connect primary keys, and run SELECT queries in ${skillName}.`,
        order: 1,
        concepts: [
          { title: `Creating Tables & Types`, description: `Define columns, constraints, and datatypes.`, content: `# Schema Design\n\nWrite scripts to generate clean table grids.`, difficulty: easy, estimatedMinutes: 45, order: 1 },
          { title: `Querying Rows & Filtering`, description: `Isolate target records using query criteria.`, content: `# Data Filtering\n\nFilter rows based on values thresholds.`, difficulty: easy, estimatedMinutes: 40, order: 2 },
          { title: `Inserting & Modifying Rows`, description: `Safely edit active table values.`, content: `# Data Mutations\n\nInsert or update values matching primary keys.`, difficulty: easy, estimatedMinutes: 45, order: 3 },
          { title: `Primary & Foreign Keys`, description: `Secure relationship links across sheets.`, content: `# Keys Constraints\n\nLink tables together using key constraints.`, difficulty: easy, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: `Phase 2: Complex JOINs & Transactions`,
        description: `Run multi-table connections, group metrics, and manage transaction locks in ${skillName}.`,
        order: 2,
        concepts: [
          { title: `Inner & Outer JOIN operations`, description: `Combine data rows matching relational keys.`, content: `# Joining Tables\n\nRetrieve aggregated views across tables.`, difficulty: med, estimatedMinutes: 70, order: 1 },
          { title: `Grouping Metrics & HAVING`, description: `Group logs to calculate sum/average thresholds.`, content: `# Grouping\n\nGroup values and filter results based on aggregations.`, difficulty: med, estimatedMinutes: 80, order: 2 },
          { title: `CTEs and Nested Queries`, description: `Write nested query steps cleanly.`, content: `# CTE Queries\n\nDefine temporary scopes to query recursively.`, difficulty: med, estimatedMinutes: 80, order: 3 },
          { title: `Transactions and ACID rules`, description: `Ensure modifications write atomically or roll back completely.`, content: `# ACID Transactions\n\nWrap multi-row updates in commit scripts.`, difficulty: med, estimatedMinutes: 70, order: 4 }
        ]
      },
      {
        title: `Phase 3: Database Indexing & Scaling`,
        description: `Configure speed indexes, audit slow queries, and configure cache servers in ${skillName}.`,
        order: 3,
        concepts: [
          { title: `Designing Search Indexes`, description: `Create search indexes to speed up lookups.`, content: `# Indexing\n\nSpeed up lookups from table scans to index searches.`, difficulty: hard, estimatedMinutes: 90, order: 1 },
          { title: `Query Plans Auditing`, description: `Analyze query plans to detect slow paths.`, content: `# Query Plans\n\nInspect execution logs to optimize JOIN paths.`, difficulty: hard, estimatedMinutes: 100, order: 2 },
          { title: `Replication & Caching`, description: `Scale architectures using read replicas.`, content: `# Scaling Datasets\n\nDistribute workloads across replication nodes.`, difficulty: hard, estimatedMinutes: 110, order: 3 },
          { title: `Capstone Schema Design`, description: `Design a fully optimized relational schema layout.`, content: `# Capstone Database Schema\n\nBuild a normalized, indexed table configuration for an enterprise app.`, difficulty: hard, estimatedMinutes: 140, order: 4 }
        ]
      }
    ];
  } else if (category === 'programming') {
    prerequisites = ['Logical thinking', 'Text editor interface setup'];
    targetAudience = `Software developers learning syntax and design patterns in ${skillName}.`;
    estimatedWeeks = 10;
    phases = [
      {
        title: `Phase 1: Basic Logic & Control Syntax of ${skillName}`,
        description: `Set up compilers, declare variables, evaluate conditions, and loop actions in ${skillName}.`,
        order: 1,
        concepts: [
          { title: `Workspace Installation & Hello World`, description: `Configure compilers or interpreters and run basic code.`, content: `# Environment Setup\n\nSet up folders, environment paths, and compile a hello-world template.`, difficulty: easy, estimatedMinutes: 40, order: 1 },
          { title: `Variables, Datatypes & Console IO`, description: `Define values typed statically or dynamically and prompt inputs.`, content: `# Variables\n\nDeclare variables and read inputs from the user.`, difficulty: easy, estimatedMinutes: 40, order: 2 },
          { title: `Branching & Loops`, description: `Control code paths using conditions and loops.`, content: `# Control Loops\n\nLoop arrays and run branches matching boolean states.`, difficulty: easy, estimatedMinutes: 45, order: 3 },
          { title: `Functions & Parameter Scopes`, description: `Write reusable code routines.`, content: `# Functions\n\nPass arguments and return output variables.`, difficulty: easy, estimatedMinutes: 50, order: 4 }
        ]
      },
      {
        title: `Phase 2: Memory Management & Object Layouts`,
        description: `Master scopes, build OOP classes, use interfaces, and catch exceptions in ${skillName}.`,
        order: 2,
        concepts: [
          { title: `Pointers, References & Heap Scopes`, description: `Control stack vs heap allocations.`, content: `# Memory Scopes\n\nTrace variables memory references and avoid leaks.`, difficulty: med, estimatedMinutes: 80, order: 1 },
          { title: `Classes, Fields & Constructor systems`, description: `Design custom blueprints encapsulating variables.`, content: `# OOP Classes\n\nInstantiate classes and call class methods.`, difficulty: med, estimatedMinutes: 80, order: 2 },
          { title: `Inheritance & Interface Contracts`, description: `Extend layouts and implement contract routines.`, content: `# Interfaces\n\nInherit parent templates and define common interfaces.`, difficulty: med, estimatedMinutes: 85, order: 3 },
          { title: `Exception Guard Rails`, description: `Catch runtime failures to prevent system crashes.`, content: `# Error Handling\n\nWrap operations in try-catch guards.`, difficulty: med, estimatedMinutes: 70, order: 4 }
        ]
      },
      {
        title: `Phase 3: Collections, Testing & Packaging`,
        description: `Manage dynamic arrays, run automated tests, and compile deployment packages in ${skillName}.`,
        order: 3,
        concepts: [
          { title: `Collections & Generics`, description: `Utilize maps, lists, and dynamic arrays.`, content: `# Collections\n\nStore keys and values in generic containers.`, difficulty: hard, estimatedMinutes: 90, order: 1 },
          { title: `Asynchronous Tasks & APIs`, description: `Execute tasks concurrently without blocking systems threads.`, content: `# Concurrency\n\nAwait async queries from network resources.`, difficulty: hard, estimatedMinutes: 110, order: 2 },
          { title: `Automated Test Suites`, description: `Assert outcomes automatically to prevent regression bugs.`, content: `# Unit Testing\n\nWrite tests verifying function behaviors.`, difficulty: hard, estimatedMinutes: 90, order: 3 },
          { title: `Standalone Compilation Builds`, description: `Bundle resources into executable files.`, content: `# Production Builds\n\nRun build scripts to compile deployment-ready software packages.`, difficulty: hard, estimatedMinutes: 130, order: 4 }
        ]
      }
    ];
  } else {
    // GENERAL FALLBACK template
    phases = [
      {
        title: `Phase 1: Foundations of ${skillName}`,
        description: `Get started with the fundamentals, core concepts, and initial workspace setups required for ${skillName}.`,
        order: 1,
        concepts: [
          {
            title: `Introduction & Scope of ${skillName}`,
            description: `Learn the history, core philosophy, and setup instructions for ${skillName}.`,
            content: `# Introduction to ${skillName}\n\nWelcome to ${skillName}! Identify core objectives and set your learning milestones.\n\n### Essential Resources\n- Read leading textbooks and online wikis.\n- Document your daily practice lessons.`,
            difficulty: easy,
            estimatedMinutes: 35,
            order: 1
          },
          {
            title: `Core Principles & Best Practices`,
            description: `Understand the basic rules, conventions, and standards in ${skillName}.`,
            content: `# Core Principles\n\nExplore standards that govern ${skillName}:\n- Key terminology and standard processes.\n- Quality benchmarks for intermediate work.`,
            difficulty: easy,
            estimatedMinutes: 40,
            order: 2
          },
          {
            title: `Essential Tools & Frameworks`,
            description: `Identify the primary toolkits and platforms required to practice ${skillName}.`,
            content: `# Toolkits & Platforms\n\nConfigure your tools:\n- Identify essential resources.\n- Avoid common configuration errors.`,
            difficulty: easy,
            estimatedMinutes: 45,
            order: 3
          },
          {
            title: `Workspace & Environment Setup`,
            description: `Configure your environment to start practicing ${skillName} effectively.`,
            content: `# Workspace Setup\n\nStep-by-step guidance to assemble your learning setup:\n- Verify hardware/software compatibility.\n- Run verification checks to confirm readiness.`,
            difficulty: easy,
            estimatedMinutes: 30,
            order: 4
          }
        ]
      },
      {
        title: `Phase 2: Intermediate Operations & Workflows`,
        description: `Deepen your knowledge by studying common scenarios, analyzing workflows, and running tests.`,
        order: 2,
        concepts: [
          {
            title: `Executing Custom Case Scenarios`,
            description: `Apply your knowledge to standard intermediate cases in ${skillName}.`,
            content: `# Intermediate Scenarios\n\nPractice common procedures:\n- Outline problem statements.\n- Formulate solutions using standard techniques.`,
            difficulty: med,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: `Analyzing Performance & Outcomes`,
            description: `Measure your outcomes against industry benchmarks.`,
            content: `# Performance Audits\n\nTrack speed, quality, or yield thresholds in ${skillName}.\n- Optimize friction points in your workflow.`,
            difficulty: med,
            estimatedMinutes: 70,
            order: 2
          },
          {
            title: `Standard Procedures & Checkpoints`,
            description: `Establish safety, compliance, and checkpoints throughout your workflow.`,
            content: `# Checkpoints & Audits\n\nFormulate testing checklists to ensure consistency:`,
            difficulty: med,
            estimatedMinutes: 55,
            order: 3
          },
          {
            title: `Debugging & Quality Inspections`,
            description: `Diagnose flaws and apply immediate repairs in ${skillName}.`,
            content: `# Quality Control\n\nSpot inconsistencies early:\n- List diagnostics guidelines.\n- Apply corrective actions to prevent project loss.`,
            difficulty: med,
            estimatedMinutes: 50,
            order: 4
          }
        ]
      },
      {
        title: `Phase 3: Advanced Implementations & Project Scale`,
        description: `Manage scalability, enforce security policies, automate procedures, and complete your Capstone.`,
        order: 3,
        concepts: [
          {
            title: `Scalability & Load Capacities`,
            description: `Scale operations or output volumes without quality loss in ${skillName}.`,
            content: `# Scaling Up\n\nTransition from small setups to large production-ready operations.`,
            difficulty: hard,
            estimatedMinutes: 80,
            order: 1
          },
          {
            title: `Security Policies & Access Controls`,
            description: `Secure materials, profiles, or data repositories according to standards.`,
            content: `# Security & Audits\n\nPrevent breaches, leakages, or damage to your assets.`,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 2
          },
          {
            title: `Automating Common Procedures`,
            description: `Incorporate automation tools to cut down manual labor in ${skillName}.`,
            content: `# Automation Systems\n\nConfigure automated scripts or machinery to execute repetitive tasks.`,
            difficulty: hard,
            estimatedMinutes: 90,
            order: 3
          },
          {
            title: `Capstone Case Study: Production Run`,
            description: `Design, execute, and evaluate a major independent project from scratch.`,
            content: `# Capstone Project\n\nPlan and finalize a comprehensive case study:\n1. Formulate project scopes.\n2. Complete execution phases.\n3. Publish result portfolios for evaluation.`,
            difficulty: hard,
            estimatedMinutes: 140,
            order: 4
          }
        ]
      }
    ];
  }

  // Inject real-world topics if available from webContext
  const extractedTopics = extractTopicsFromWebContext(webContext);
  if (extractedTopics.length > 0) {
    let topicIndex = 0;
    for (let p = 0; p < Math.min(phases.length, 3); p++) {
      const phase = phases[p];
      if (!phase || !phase.concepts) continue;
      for (let c = 0; c < phase.concepts.length; c++) {
        if (topicIndex < extractedTopics.length) {
          const topic = extractedTopics[topicIndex];
          if (!topic) continue;
          const concept = phase.concepts[c];
          if (!concept) continue;
          
          concept.title = topic;
          concept.description = `Master the key principles, configurations, and core details of ${topic} as it relates to ${skillName}.`;
          concept.content = `# ${topic}\n\nExplore and master ${topic} within the context of ${skillName}:\n\n- Understand the core patterns and use cases for ${topic}.\n- Practice hands-on implementation and explore configuration details.\n- Troubleshoot common errors and optimize usage according to best practices.\n\n### Key Concepts & Reference\n- **Foundations**: Learn the starting configuration and syntax.\n- **Integration**: Apply ${topic} to build complete workflows.\n- **Verification**: Run tests and check logs to verify correct behavior.`;
          
          topicIndex++;
        }
      }
    }
  }

  return ensure5Phases({
    skillName,
    totalPhases: 3,
    phases,
    overview,
    prerequisites,
    targetAudience,
    estimatedWeeks
  }, skillName);
}
