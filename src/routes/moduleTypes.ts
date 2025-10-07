import { Router } from 'express';
import ModuleType from '../models/ModuleType';

const router = Router();

router.get('/', async (req, res) => {
  const modules = await ModuleType.find().lean();
  res.json({ modules });
});

router.post('/', async (req, res) => {
  try {
    const m = await ModuleType.create(req.body);
    res.status(201).json({ module: m });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
