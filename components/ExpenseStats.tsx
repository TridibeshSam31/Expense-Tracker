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

    




    return (
      <div></div>
    )
}