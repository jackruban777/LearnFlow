import { Router } from 'express';
import { MentorChatSchema } from '@learnflow/shared';
import { requireAuth } from '../middleware/auth.js';
import { mentorChat } from '../services/ai/mentor.service.js';

export const mentorRouter = Router();

mentorRouter.post('/chat', requireAuth, async (req, res, next) => {
  try {
    const validated = MentorChatSchema.parse(req.body);
    const userId = req.user!.id;

    const reply = await mentorChat(userId, validated.messages, validated.contextSkillId);

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: reply
      }
    });
  } catch (error) {
    next(error);
  }
});
