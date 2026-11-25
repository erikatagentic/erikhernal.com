import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    page: z.number().int(),
    struck: z.object({
      was: z.string(),
      now: z.string(),
      label: z.string(),
    }),
    fast: z.string(),
    title: z.string(),
    slug: z.string(),
    cohort: z.string(),
    date: z.coerce.date(),
    one_line: z.string(),
    number: z.object({
      label: z.string(),
      value: z.string(),
      source: z.string(),
    }),
    receipts: z.array(
      z.object({
        file: z.string(),
        count: z.string(),
        proves: z.string(),
      }),
    ),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      )
      .default([]),
  }),
});

const emails = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/emails' }),
  schema: z.object({
    position: z.number().int(),
    subject: z.string(),
    delay_days: z.number().int(),
    links_to: z.string(),
  }),
});

export const collections = { work, emails };
