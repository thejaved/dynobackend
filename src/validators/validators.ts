import { z } from 'zod';

export const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  bgImage: z.string().url().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional()
});

export const featuresSchema = z.object({
  items: z.array(z.object({ title: z.string() })).min(1)
});

export const validators: Record<string, z.ZodTypeAny> = {
  hero: heroSchema,
  features: featuresSchema
};

export function validateLayout(layout: any[]) {
  for (const block of layout) {
    const schema = validators[block.type];
    if (!schema) return { ok: false, error: `Unknown block type: ${block.type}` };
    const res = schema.safeParse(block.props);
    if (!res.success) return { ok: false, error: res.error.format() };
  }
  return { ok: true };
}
