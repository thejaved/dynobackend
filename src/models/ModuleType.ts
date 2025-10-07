import mongoose, { Schema } from 'mongoose';

const ModuleTypeSchema = new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  schema: { type: Schema.Types.Mixed, required: true },
  version: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('ModuleType', ModuleTypeSchema);
