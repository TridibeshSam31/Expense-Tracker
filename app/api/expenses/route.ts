//in thisroute we wil be filtering out the expenses based on the range of dates 

import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import {expenseSchema} from "@/Schema/expenseSchema"



export async function GET(request:NextRequest){
   try {
     const session = await getServerSession()
 
     if (session?.user.id) {
        return NextResponse.json({error:'unauthorized'},{status:401})
     }
 
     const {searchParams} = new URL(request.url)
     const startDate = searchParams.get('startDate')
     const endDate = searchParams.get('endDate')

     //now we have to filter out the expenses based on the startDate and endDate from the database 
     //for doing so we can understand using a normal sql query
     // SELECT * FROM EXPENSE
     // WHERE userID=123
     // AND DATE >= 1-12-25
     //AND DATE <= 31-12-25

     const where:any = {userId:session?.user.id}

     //if we have bothe startDate and EndDate from the frontend in the URL

     if (startDate&&endDate) {
        where.date = {
            gte:new Date(startDate),
            lte:new Date(endDate)

        }
     }

     const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(expenses)

      


    } catch (error) {
       console.error('Error fetching expenses:', error)
     return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
     )
   }


}


//post the expenses 
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, date, categoryId } = expenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: new Date(date as string),
        userId: session.user.id,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error:unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
