import z from "zod"

const categorySchema = z.object({
    name:z.string().min(1,'Category name is required'),
    color:z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code')
})


const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
})

export default categorySchema,expenseSchema


