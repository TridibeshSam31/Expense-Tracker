'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Save, X } from 'lucide-react'
import { useCreateExpense, useUpdateExpense } from '@/lib/api'

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string(),
  categoryId: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface Category {
  id: string
  name: string
  color: string
}

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  categoryId: string | null
  category: Category | null
}

interface ExpenseFormProps {
  categories: Category[]
  onExpenseAdded: (expense: Expense) => void
  editingExpense?: Expense | null
  onCancel?: () => void
  onExpenseUpdated?: (expense: Expense) => void
}

export default function ExpenseForm({
  categories,
  onExpenseAdded,
  editingExpense,
  onCancel,
  onExpenseUpdated,
}: ExpenseFormProps) {
  const { toast } = useToast()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: editingExpense
      ? {
          amount: editingExpense.amount,
          description: editingExpense.description,
          date: format(new Date(editingExpense.date), 'yyyy-MM-dd'),
          categoryId: editingExpense.categoryId || undefined,
        }
      : {
          date: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  const selectedCategoryId = watch('categoryId')
  
  // For Select component, use 'none' when categoryId is undefined/null
  const selectValue = selectedCategoryId || 'none'

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      // Convert 'none' to undefined for categoryId
      const requestData = {
        ...data,
        categoryId: data.categoryId === 'none' ? undefined : data.categoryId,
      }

      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense.id,
          ...requestData,
        })
        toast({
          title: 'Expense updated',
          description: 'Your expense has been updated successfully.',
        })
        if (onExpenseUpdated) {
          // The mutation will automatically refetch, but we can call the callback for immediate UI update
          onExpenseUpdated({ ...editingExpense, ...requestData } as Expense)
        }
      } else {
        const result = await createExpense.mutateAsync(requestData)
        toast({
          title: 'Expense added',
          description: 'Your expense has been added successfully.',
        })
        if (onExpenseAdded) {
          onExpenseAdded(result)
        }
      }

      reset()
      if (onCancel) onCancel()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save expense',
      })
    }
  }

  const isLoading = createExpense.isPending || updateExpense.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editingExpense ? (
            <>
              <Save className="h-5 w-5" />
              Edit Expense
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Add Expense
            </>
          )}
        </CardTitle>
        <CardDescription>
          {editingExpense
            ? 'Update your expense details below'
            : 'Enter the details of your new expense'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What did you spend on?"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={selectValue}
              onValueChange={(value) => {
                if (value === 'none') {
                  setValue('categoryId', undefined)
                } else {
                  setValue('categoryId', value)
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? editingExpense
                  ? 'Updating...'
                  : 'Adding...'
                : editingExpense
                ? 'Update Expense'
                : 'Add Expense'}
            </Button>
            {editingExpense && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
