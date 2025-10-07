import mongoose, { Schema } from 'mongoose';

const MediaSchema = new Schema({
  url: { type: String, required: true },
  path: { type: String, required: true },
  filename: String,
  mimeType: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Media', MediaSchema);
