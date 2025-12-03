import z from "zod"

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
})

export default expenseSchema