//get and post budget 

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

//return all budgets for that month for the logged-in user format is "YYYY-MM"
export async function GET(request: NextRequest , response: NextResponse){
    try {
        const session = await getServerSession()
        if(!session?.user?.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
        const {searchParams} = new URL(request.url)
        const month = searchParams.get('month');
        const year = searchParams.get('year')

        if (!month || !year) {
            return NextResponse.json({error:'month and year are required'},{status:400})
        }
        
        const budgets = await prisma.budget.findMany({
            where:{
                userId:session.user?.id,
                month:`${year}-${month}`
                
            }
        })

        return NextResponse.json({budgets})

    } catch (error) {
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }

}

//POST /api/budgets → create or update a budget (use Prisma's upsert)
export async function POST(request: NextRequest , response: NextResponse){
    try {
        const session = await getServerSession()
        if(!session?.user?.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
        const body = await request.json()
        const {amount,month,year,categoryId} = body

        if(!amount||!month||!year||!categoryId){
            return NextResponse.json({error:'All fields are required'},{status:400})
        }
        const budget = await prisma.budget.upsert({
            where:{
                userId_categoryId_month:{
                    userId:session.user.id,
                    categoryId:categoryId,
                    month:`${year}-${month}`
                }
            },
            update:{
                amount
            },
            create:{
                amount,
                userId:session.user.id,
                categoryId,
                month:`${year}-${month}`
            }
        })

        NextResponse.json({budget});
    } catch (error) {
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }

}