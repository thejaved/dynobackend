import { Router } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  let user = await User.findOne({ email });
    //if (!user) user = await User.create({ email, role: 'ADMIN' });
  const token = jwt.sign({ sub: user?._id, role: user?.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ accessToken: token });
});

export default router;
