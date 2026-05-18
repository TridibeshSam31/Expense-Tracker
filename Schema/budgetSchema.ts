import z from "zod"

export const budgetSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
    categoryId: z.string().optional(),
    
})