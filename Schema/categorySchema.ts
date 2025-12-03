import z from "zod"

export const categorySchema = z.object({
    name:z.string().min(1,'Category name is required'),
    color:z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code')
})

export default categorySchema