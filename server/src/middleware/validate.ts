import { z } from 'zod'

export const contactSchema = z.object({
    name: z.string().trim().min(1).max(255),
    contact: z.string().trim().min(1).max(255),
    message: z.string().trim().min(1).max(5000),
    budget: z.string().trim().max(100).optional()
})

export type ContactInput = z.infer<typeof contactSchema>

export const demoLeadSchema = z.object({
    name: z.string().trim().min(1, 'Укажите имя').max(100),
    phone: z.string().trim().min(5, 'Укажите телефон').max(30),
    message: z.string().trim().max(1000).optional(),
    source: z.enum(['local-landing', 'form-integration']),
    website: z.string().max(0).optional()
})

export type DemoLeadInput = z.infer<typeof demoLeadSchema>
