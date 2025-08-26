import { z } from 'zod';

const item = z.object({
    name: z.string().min(1),
    link: z.string().url(),
    imageUrl: z.string().url().optional().or(z.literal(''))
});

export const createOutfitSchema = z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(1000).optional().or(z.literal('')),
    items: z.array(item).max(30).default([]),
    pictures: z.array(z.string().url()).max(10).default([]),
    tags: z.array(z.string().min(1)).max(10).default([])
});
