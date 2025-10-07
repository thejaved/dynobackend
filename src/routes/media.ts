import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Media from '../models/Media';

const router = Router();

const UPLOADS_PATH = process.env.UPLOADS_PATH || './uploads';
const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL || '/uploads';
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '52428800', 10); // 50MB

// ensure uploads dir exists
if (!existsSync(UPLOADS_PATH)) mkdirSync(UPLOADS_PATH, { recursive: true });

// Multer storage config: write to disk with safe unique filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (_req, file, cb) => {
    const id = uuidv4();
    // preserve extension
    const ext = path.extname(file.originalname);
    const safeName = `${id}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE }
});

/**
 * POST /media/upload
 * Multipart form: field name "file"
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required (field name: file)' });

    const { filename, mimetype, size, path: filePath } = req.file as Express.Multer.File;
    // public URL that the frontend / clients can call
    const url = `${UPLOADS_BASE_URL}/${filename}`;

    const media = await Media.create({
      url,
      path: filePath,
      filename: req.file.originalname,
      mimeType: mimetype,
      size
    });

    res.status(201).json({ media });
  } catch (err: any) {
    console.error('upload error', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /media
 * List media (paginated simple)
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(0, parseInt(String(req.query.page || '0'), 10));
    const limit = Math.min(100, parseInt(String(req.query.limit || '50'), 10));
    const media = await Media.find()
      .sort({ uploadedAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean();
    res.json({ media, page, limit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /media/:id
 * Delete a media record and file (admin-only in prod)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const m = await Media.findById(id);
    if (!m) return res.status(404).json({ error: 'not found' });

    // delete file from disk
    try {
      await fs.unlink(m.path);
    } catch (e) {
      console.warn('file delete warning', e);
    }

    await m.deleteOne();

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
