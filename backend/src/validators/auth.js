import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(8).max(200),
    profilePictureUrl: z.string().url().optional().or(z.literal(''))
});

export const loginSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(8).max(200),
    code: z.string().length(6).optional()
});