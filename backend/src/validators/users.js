import { z } from 'zod';

export const updateUserSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    profilePictureUrl: z.string().url().optional().or(z.literal(''))
}).refine(
    data => data.username || typeof data.profilePictureUrl !== 'undefined',
    { message: 'Nothing to update' }
);
