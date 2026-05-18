/*

Show current month's budgets
Form to set a budget amount for a category (or overall)
Show a progress bar: spent / budget * 100% (you already have stats.byCategory)
The progress bar turns red when over 100%

*/

import { useBudgets,useCreateOrUpdateBudget,useDeleteBudget,useCategories,useExpenseStats } from "@/lib/api";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from "@/components/ui/use-toast";
import { budgetSchema } from "@/Schema/budgetSchema";
import { Loader2, Trash2 } from 'lucide-react';

type BudgetFormData = z.infer<typeof budgetSchema> 

const currentMonth = new Date().toISOString().slice(0, 7)
const currentMonthStart = `${currentMonth}-01`
const currentMonthEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,                          // last day of current month
    23, 59, 59, 999
).toISOString()

export default function BudgetManager(){
    const {toast} = useToast()
    const {data: budgets = [], isLoading} = useBudgets(currentMonth)
    const {data: categoriesData = []} = useCategories()
    const categories = categoriesData
    const { data: stats } = useExpenseStats(
        currentMonthStart,
        currentMonthEnd
    )
    const createOrUpdateBudget = useCreateOrUpdateBudget() 
    const deleteBudget = useDeleteBudget()

    const getSpentAmount = (categoryId: string | null) => {
        if (!stats?.byCategory) return 0
        const match = stats.byCategory.find(s => s.categoryId === categoryId)
        return match?.total ?? 0
    }

    const {register,handleSubmit,formState:{errors},reset} = useForm<BudgetFormData>({
        resolver:zodResolver(budgetSchema),
        defaultValues: { month: currentMonth }
    })

    const onSubmit = async(data:BudgetFormData)=>{
        try {
            await createOrUpdateBudget.mutateAsync(data)
            toast({
                title:'Budget set',
                description:'Your budget has been set successfully.'

            })
            reset()
            
        }catch(err) {
         toast({
            variant: 'destructive',
            title: 'Error',
           description: err instanceof Error ? err.message : 'Failed to create category',
           })
        }
    }

    const handleDelete = async(id:string)=>{
        if (
      !confirm(
        'Are you sure you want to delete this budget '
      )
    ) {
      return
    }
        try {
            await deleteBudget.mutateAsync(id)
  
            toast({
                title:'Budget deleted',
                description:'Your budget has been deleted successfully.'
            })
        } catch (err) {
            toast({
                variant:'destructive',
                title:'Error',
                description: err instanceof Error ? err.message : 'Failed to delete budget'
            })
            
        }
    }

    return(
        <div className="space-y-6">
            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Set Budget — {currentMonth}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category (leave empty for overall budget)
                        </label>
                        <select
                            {...register('categoryId')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Overall (no category)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Amount (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="5000"
                            {...register('amount', { valueAsNumber: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={createOrUpdateBudget.isPending}
                        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {createOrUpdateBudget.isPending ? 'Saving...' : 'Set Budget'}
                    </button>
                </form>
            </div>

            {/* Budget List with Progress Bars */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">This Month's Budgets</h2>
                </div>

                {isLoading ? (
                    <div className="p-6 flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading budgets...
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No budgets set for this month. Add one above!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {budgets.map(budget => {
                            const spent = getSpentAmount(budget.categoryId)
                            const percentage = Math.min((spent / budget.amount) * 100, 100)
                            const isOverBudget = spent > budget.amount
                            const categoryName = budget.categoryId
                                ? categories.find(c => c.id === budget.categoryId)?.name ?? 'Unknown'
                                : 'Overall'

                            return (
                                <div key={budget.id} className="p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{categoryName}</span>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                                                ₹{spent.toFixed(0)} / ₹{budget.amount.toFixed(0)}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(budget.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        {isOverBudget
                                            ? `₹${(spent - budget.amount).toFixed(0)} over budget`
                                            : `₹${(budget.amount - spent).toFixed(0)} remaining`
                                        }
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}