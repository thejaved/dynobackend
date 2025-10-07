import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['ADMIN','EDITOR','VIEWER'], default: 'EDITOR' }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
