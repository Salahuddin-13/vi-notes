import { Router, Response } from 'express';
import Session from '../models/Session';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All session routes require authentication
router.use(authMiddleware);

// POST /api/sessions — Feature 5: Save writing session
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { text, keystrokeData, pasteEvents, totalTypingTime } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Session text cannot be empty' });
    }

    const session = await Session.create({
      userId: req.userId,
      text,
      keystrokeData: keystrokeData || [],
      pasteEvents: pasteEvents || [],
      totalTypingTime: totalTypingTime || 0,
    });

    res.status(201).json({ message: 'Session saved successfully', session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// GET /api/sessions — Get all sessions for the logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id — Get a specific session
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
