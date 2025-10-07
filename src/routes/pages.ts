import { Router } from 'express';
import Page from '../models/Page';
import { validateLayout } from '../validators/validators';

const router = Router();

router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  const page = await Page.findOne({ slug }).lean();
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json({ page });
});

router.post('/', async (req, res) => {
  try {
    const { slug, title, layout = [], status = 'DRAFT' } = req.body;
    const validation = validateLayout(layout);
    if (!validation.ok) return res.status(400).json({ error: validation.error });
    const page = await Page.create({ slug, title, layout, status });
    res.status(201).json({ page });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { layout } = req.body;
    if (layout) {
      const validation = validateLayout(layout);
      if (!validation.ok) return res.status(400).json({ error: validation.error });
    }
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json({ page });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    page.status = 'PUBLISHED';
    await page.save();

    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': process.env.REVALIDATE_SECRET || ''
        },
        body: JSON.stringify({ path: `/${page.slug}` })
      });
    } catch (e) {
      console.warn('Revalidate failed', e);
    }

    res.json({ ok: true, page });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/reorder', async (req, res) => {
  try {
    const { layout, order } = req.body;
    const pageId = req.params.id;

    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    if (layout) {
      if (!Array.isArray(layout)) return res.status(400).json({ error: 'layout must be array' });
      const validation = validateLayout(layout);
      if (!validation.ok) return res.status(400).json({ error: validation.error });

      const updated = await Page.findByIdAndUpdate(
        pageId,
        { $set: { layout } },
        { new: true, runValidators: true }
      ).lean();
      return res.json({ ok: true, page: updated });
    }

    if (order) {
      if (!Array.isArray(order) || !order.every(n => Number.isInteger(n))) {
        return res.status(400).json({ error: 'order must be array of integers' });
      }

      const oldLayout = page.layout.map(item => (item && typeof item.toObject === 'function' ? item.toObject() : item));
      const newLayout = [];
      for (const idx of order) {
        if (idx < 0 || idx >= oldLayout.length) {
          return res.status(400).json({ error: `order contains invalid index ${idx}` });
        }
        newLayout.push(oldLayout[idx]);
      }

      page.set('layout', newLayout);
      await page.save();
      return res.json({ ok: true, page: page.toObject() });
    }

    return res.status(400).json({ error: 'Provide layout[] or order[] in body' });
  } catch (err: any) {
    console.error('reorder error', err);
    return res.status(500).json({ error: err.message });
  }
});


export default router;
