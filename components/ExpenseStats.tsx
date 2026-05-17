'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useExpenseStats } from '@/lib/api'


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

interface ExpenseStatsProps{
  expenses:Expense[]
  period:'week'|'month'|'year'|'all'
}

interface CategoryStat{
  categoryName:string,
  categoryColor:string,
  total:number,
  count:number
}

interface MonthlyStat{
  month:string,
  total:number
}

export default function EcpenseStats({expenses,period}:ExpenseStatsProps){
  //period based stats 
  //useMemo will be used so that not to re-render if things are same 

  const{startDate,endDate} = useMemo(()=>{
    let start:string| undefined = undefined //don't know what the user will select
    let end:string|undefined = undefined
    const now = new Date()

    if (period = 'week') {
      start = new Date(now.getTime() - 7*24*60*60*1000).toISOString()
      end = now.toISOString()
           
    }else if(period = 'month'){
      start = startOfMonth(now).toISOString()
      end = endOfMonth(now).toISOString()

    }else if(period = 'year'){
      start = new Date(now.getFullYear(),0,1).toISOString()
      end = now.toISOString()

      
    }

    return {startDate:start,endDate:end}
  },[period])

   const {data:stats, isLoading:loading} = useExpenseStats(startDate,endDate)

   const totalExpenses = expenses.reduce((sum,expense)=> sum + expense.amount ,0)
   

   //grouyping expenses for category 
   /*
   const categoryData = useMemo(()=>{
    return expenses.reduce((acc,expense)=>{
      const categoryName = expense.category?.name || 'Uncategorized'
      const categoryColor = expense.category?.color || '#6b7280'
      const existing = acc.find((item) => item.name === categoryName)

      if (existing) {
        existing.value += expense.amount
      } else {
        acc.push({
          name: categoryName,
          value: expense.amount,
          color: categoryColor,
        })
      }
      return acc 

    },[] as Array<{name:string; value:number , color:string}>)
   },[])
   */
  
   //anpther way to write the same code 

   const categoryData:{
    name:string,
    value:number,
    color:string

   }[] = []

   //looking each expenses individually
   for (let i = 0; i<expenses.length;i++) {
    const expense = expenses[i]

    //category mapping
    const categoryName = expense.category && expense.category.name?expense.category.name : "uncategorized"

    const categoryColor = expense.category && expense.category.color ? expense.category.color:"#6b7280"

    let found = false 

    for(let j = 0; j< categoryData.length;j++){
      if (categoryData[j].name === categoryName) {
         categoryData[j].value += expense.amount
      found = true
      break
        
      }

    }
     

     if (!found) {
    categoryData.push({
      name: categoryName,
      value: expense.amount,
      color: categoryColor,
    })
  }
        
   }

   const monthlyData = useMemo(() => {
   const result = []

  for (let i = 0; i < 6; i++) {
    const monthDate = subMonths(new Date(), 5 - i)
    const monthKey = format(monthDate, 'yyyy-MM')

    let total = 0

    for (let j = 0; j < expenses.length; j++) {
      const expenseMonth = format(
        new Date(expenses[j].date),
        'yyyy-MM'
      )

      if (expenseMonth === monthKey) {
        total += expenses[j].amount
      }
    }

    result.push({
      month: format(monthDate, 'MMM'),
      total: Number(total.toFixed(2)),
    })
  }

  return result
}, [expenses])

    if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    )
  }




    return (
      <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Expenses</div>
          <div className="text-3xl font-bold text-gray-900">
            ${totalExpenses.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Average Expense</div>
          <div className="text-3xl font-bold text-gray-900">
            ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-gray-500 mt-2">Per transaction</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Categories Used</div>
          <div className="text-3xl font-bold text-gray-900">
            {categoryData.length}
          </div>
          <div className="text-sm text-gray-500 mt-2">Active categories</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? `$${value.toFixed(2)}` : ''} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Spending Bar Chart */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Spending (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? `$${value.toFixed(2)}` : ''} />
                <Bar dataKey="total" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
    )
}