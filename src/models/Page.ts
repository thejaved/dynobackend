import mongoose, { Schema } from 'mongoose';

const BlockSchema = new Schema({
  type: { type: String, required: true },
  props: { type: Schema.Types.Mixed, required: true },
  moduleVersion: { type: Number, default: 1 }
}, { _id: false });

const PageSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  layout: { type: [BlockSchema], default: [] },
  meta: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model('Page', PageSchema);
