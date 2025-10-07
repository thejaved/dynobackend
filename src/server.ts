import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

import pagesRouter from './routes/pages';
import moduleTypesRouter from './routes/moduleTypes';
import mediaRouter from './routes/media';
import authRouter from './routes/auth';
import seedRouter from './routes/seed';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/pages', pagesRouter);
app.use('/module-types', moduleTypesRouter);
app.use('/media', mediaRouter);
app.use('/auth', authRouter);
app.use('/seed', seedRouter);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visionlyft';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
  });
