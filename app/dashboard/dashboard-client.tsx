"use client"

import { useState, useMemo } from 'react'
import { authClient } from '@/lib/auth-client'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import ExpenseStats from '@/components/ExpenseStats'
import CategoryManager from '@/components/CategoryManager'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, LogOut, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExpenses, useCategories } from '@/lib/api'
import BudgetManager from '@/components/BudgetManager'

interface User {
  id: string
  name?: string | null
  email?: string | null
}

export default function DashboardClient({user}:{user:User}){
    const [selectedPeriod,setSelectedPeriod] = useState<'week'|'month'|'year'|'all'>("week")

   const { startDate, endDate } = useMemo(() => {
    let start: string | undefined = undefined
    let end: string | undefined = undefined
    const now = new Date()

    if (selectedPeriod === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      end = now.toISOString()
    } else if (selectedPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      end = now.toISOString()
    } else if (selectedPeriod === 'year') {
      start = new Date(now.getFullYear(), 0, 1).toISOString()
      end = now.toISOString()
    }

    return { startDate: start, endDate: end }
  }, [selectedPeriod])

  // Use React Query hooks
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(startDate, endDate)
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const loading = expensesLoading || categoriesLoading

  const periodLabels: Record<string, string> = {
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time',
  }

   const handleExpenseAdded = () => {
    // React Query will automatically refetch due to cache invalidation in mutations
  }

  const handleExpenseUpdated = () => {
    // React Query will automatically refetch due to cache invalidation in mutations
  }

  const handleExpenseDeleted = () => {
    // React Query will automatically refetch due to cache invalidation in mutations
  }

    return(
        <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Expense Tracker</h1>
                <p className="text-xs text-muted-foreground">
                  {user.name || user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await authClient.signOut()
                window.location.href = '/'
              }}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">View:</span>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {periodLabels[period]}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <ExpenseStats expenses={expenses} period={selectedPeriod} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="space-y-8">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>

            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ExpenseForm
                  categories={categories}
                  onExpenseAdded={handleExpenseAdded}
                />
              </div>
              <div className="lg:col-span-2">
                <ExpenseList
                  expenses={expenses}
                  categories={categories}
                  loading={loading}
                  onExpenseUpdated={handleExpenseUpdated}
                  onExpenseDeleted={handleExpenseDeleted}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManager />
          </TabsContent>
          <TabsContent value="budget" className="space-y-6">
            <BudgetManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    )
}