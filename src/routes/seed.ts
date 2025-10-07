import { Router } from 'express';
import Page from '../models/Page';
import ModuleType from '../models/ModuleType';
import Media from '../models/Media';

const router = Router();

router.post('/', async (req, res) => {
  await ModuleType.deleteMany({});
  await Page.deleteMany({});
  await Media.deleteMany({});

  await ModuleType.create({
    key: 'hero',
    name: 'Hero',
    schema: {
      title: 'string',
      subtitle: 'string?',
      bgImage: 'url?',
      ctaText: 'string?',
      ctaUrl: 'url?'
    },
    version: 1
  });

  await ModuleType.create({
    key: 'features',
    name: 'Features',
    schema: { items: 'array' },
    version: 1
  });

  await Page.create({
    slug: 'home',
    title: 'VisionLyft — Home',
    status: 'PUBLISHED',
    layout: [
      { type: 'hero', props: { title: 'Welcome to VisionLyft', subtitle: 'AI-generated visuals', ctaText: 'Get started', ctaUrl: '/signup' }, moduleVersion: 1 },
      { type: 'features', props: { items: [{ title: 'Fast' }, { title: 'Beautiful' }, { title: 'Composable' }] }, moduleVersion: 1 }
    ]
  });

  res.json({ ok: true });
});

export default router;
