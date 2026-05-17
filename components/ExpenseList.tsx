"use client"

import React from 'react'
import { useState } from 'react'
import { format } from 'date-fns'
import ExpenseForm from './ExpenseForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Edit2, Trash2, Loader2, Receipt } from 'lucide-react'
import { useDeleteExpense } from '@/lib/api'

interface Expense{
  id:string,
  amount:number,
  description:string,
  date:string,
  categoryId:string|null,
  category:{
    id:string,
    name:string,
    color:string
  } | null
}

interface Category{
    id:string,
    name:string,
    color:string 
}

interface ExpenseListProps{
    expenses:Expense[]
    categories:Category[]
    loading:boolean
    onExpenseUpdated:(expense:Expense)=>void
    onExpenseDeleted:(expenseId:string)=>void
}


const ExpenseList = ({
  expenses,
  categories,
  loading,
  onExpenseUpdated,
  onExpenseDeleted,
}:ExpenseListProps) => {

    const [editingExpense,setEditingExpense] = useState<Expense|null>(null)
    const [deletingExpense,setDeletingExpense] = useState<Expense|null>(null)
    const {toast} = useToast()
    const deleteExpense = useDeleteExpense()


    const handleEdit = (expense:Expense) =>{
        setEditingExpense(expense)

    }

    const handleDelete = async () => {
        if (!deletingExpense) {
            return 
        }

        try {
            await deleteExpense.mutateAsync(deletingExpense.id)
            toast({
        title: 'Expense deleted',
        description: 'The expense has been removed successfully.',
      })
      setDeletingExpense(null)
      if (onExpenseDeleted) {
        onExpenseDeleted(deletingExpense.id)
      }
        } catch (error:Error|unknown) {
            toast({
                variant:"destructive",
                title:"Error",
                description:error instanceof Error ? error.message : "Something went wrong"
            })
        }
    }

    const handleUpdateComplete = (expense:Expense) => {
        if (onExpenseUpdated) {
            onExpenseUpdated(expense)
            
        }
        setEditingExpense(null)
    }
    const isDeleting = deleteExpense.isPending && deletingExpense?.id === deleteExpense.variables

    if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-3 text-muted-foreground">Loading expenses...</p>
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No expenses yet</p>
          <p className="text-sm text-muted-foreground text-center">
            Add your first expense above to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
        <Card>
        <CardHeader>
          <CardTitle>Your Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold truncate">
                      {expense.description}
                    </h3>
                    {expense.category && (
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: `${expense.category.color}20`,
                          color: expense.category.color,
                        }}
                      >
                        {expense.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expense.date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-xl font-bold">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(expense)}
                      className="h-9 w-9"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingExpense(expense)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Make changes to your expense. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              categories={categories}
              editingExpense={editingExpense}
              onExpenseUpdated={handleUpdateComplete}
              onCancel={() => setEditingExpense(null)}
              onExpenseAdded={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingExpense}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ExpenseList