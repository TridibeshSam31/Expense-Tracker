//isme humko sarre expensees calculate krne hai so hum aggregate property ka use krenge but pehle logic sochna hoga

import { NextRequest,NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

//get route 

export async function GET(request:NextRequest){
    try {
        const session = await getServerSession()

        if (!session?.user.id) {
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {searchParams} = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

       const where: any = {
      userId: session.user.id,
      }

     if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
     }

     //find the total expense of the month
     const totalExpenses = await prisma.expense.aggregate({
        where,
        _sum:{
            amount:true
        }
     })

     //expenses by category isme hum jo category id mention kiya tha schema mai uska use krenge
     const expensebyCategory = await prisma.expense.groupBy({
        by:['categoryId'],
        where,
        _sum:{
            amount:true
        },
        _count:{
            id:true
        }

        
     })

     //get the category details
     const categoryIds = expensebyCategory
     .map((e:{categoryId:string|null}) => e.categoryId)
     .filter((id: string | null): id is string => id !== null)


     const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
     })

     const categoryStats = expensebyCategory.map((expense: { categoryId: string | null; _sum: { amount: number | null }; _count: { id: number } }) => {
      const category = categories.find((c: { id: string }) => c.id === expense.categoryId)
      return {
        categoryId: expense.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryColor: category?.color || '#6b7280',
        total: expense._sum.amount || 0,
        count: expense._count.id,
      }
    })

    // Monthly expenses - get all expenses and group by month
    const allExpenses = await prisma.expense.findMany({
      where,
      select: {
        date: true,
        amount: true,
      },
    })

    // Group by month
    const monthlyData: Record<string, number> = {}
    allExpenses.forEach((expense:any) => {
      const month = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + Number(expense.amount)
    })

    return NextResponse.json({
      total: totalExpenses._sum.amount || 0,
      byCategory: categoryStats,
      monthly: Object.entries(monthlyData).map(([month, total]) => ({
        month,
        total,
      })),
    })


    } catch (error) {
     console.error('Error fetching stats:', error)
     return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }
}