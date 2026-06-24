import { z } from 'zod'

export const contactSchema = z.object({
    name: z.string().trim().min(1).max(255),
    contact: z.string().trim().min(1).max(255),
    message: z.string().trim().min(1).max(5000),
    budget: z.string().trim().max(100).optional()
})

export type ContactInput = z.infer<typeof contactSchema>
