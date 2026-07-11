import { OpenAI } from 'openai';

const apiKey = process.env['OPENAI_API_KEY'];
export const isMockAiEnabled = process.env['USE_MOCK_AI'] === 'true' || !apiKey;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getChatCompletion(
  messages: ChatMessage[],
  options?: { response_format?: { type: 'json_object' | 'text' }; temperature?: number }
): Promise<string> {
  if (isMockAiEnabled || !openai) {
    console.log('🤖 OpenAI wrapper running in MOCK mode.');
    // Simple heuristic parser for mock responses
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    const systemPrompt = messages.find((m: any) => m.role === 'system')?.content.toLowerCase() || '';

    // Check if JSON response is expected
    const isJson = options?.response_format?.type === 'json_object';

    if (isJson) {
      if (lastUserMessage.includes('roadmap') || systemPrompt.includes('roadmap')) {
        return JSON.stringify({
          skillName: 'React Developer',
          totalPhases: 3,
          phases: [
            {
              title: 'Phase 1: Foundations of React',
              description: 'Learn the absolute basics of React, JSX, and component creation.',
              order: 1,
              concepts: [
                {
                  title: 'React Fundamentals',
                  description: 'Understand virtual DOM and elements.',
                  content: '# React Fundamentals\n\nVirtual DOM is a lightweight copy of the real DOM...',
                  difficulty: 'EASY',
                  estimatedMinutes: 45,
                  order: 1,
                }
              ]
            }
          ],
          overview: 'A comprehensive React learning pathway.',
          prerequisites: ['HTML', 'CSS', 'JavaScript'],
          targetAudience: 'Beginner web developers',
          estimatedWeeks: 6
        });
      }

      if (lastUserMessage.includes('question') || systemPrompt.includes('question')) {
        return JSON.stringify({
          questions: [
            {
              text: 'What is state in React?',
              type: 'MCQ',
              difficulty: 'EASY',
              options: [
                'An internal data store',
                'A stylesheet',
                'A routing mechanism',
                'A database connection'
              ],
              correctAnswer: 'An internal data store',
              explanation: 'State is an object that holds information that may change over the lifetime of the component.',
              codeSnippet: null
            }
          ]
        });
      }

      if (lastUserMessage.includes('evaluate') || systemPrompt.includes('project') || systemPrompt.includes('evaluate')) {
        return JSON.stringify({
          overallScore: 85,
          passed: true,
          feedback: 'Excellent work! The project showcases solid structure and correct usage of hooks.',
          strengths: ['Clean structure', 'Correct use of state'],
          improvements: ['Add error boundaries', 'Optimize re-renders'],
          scores: {
            codeQuality: 85,
            functionality: 90,
            documentation: 80,
            bestPractices: 85,
            creativity: 90
          },
          xpAwarded: 400
        });
      }

      if (lastUserMessage.includes('viva') || systemPrompt.includes('viva')) {
        return JSON.stringify({
          overallScore: 80,
          passed: true,
          feedback: 'Great verbal explanation of components and hooks.',
          questionScores: [
            { questionIndex: 0, score: 8, feedback: 'Strong explanation.' }
          ],
          xpAwarded: 150,
          interviewReadinessDelta: 5
        });
      }
    }

    // Default mock response for non-JSON or general chat (e.g. mentor chat)
    return 'This is a mock AI response from the LearnFlow system. Set OPENAI_API_KEY in your environment to connect to a live assistant.';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: options?.response_format,
      temperature: options?.temperature ?? 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    throw error;
  }
}
