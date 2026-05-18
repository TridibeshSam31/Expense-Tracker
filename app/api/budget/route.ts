//get and post budget 

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/Schema/budgetSchema";

//return all budgets for that month for the logged-in user format is "YYYY-MM"
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month');


        if (!month) {
            return NextResponse.json({ error: 'month is required' }, { status: 400 })
        }

        const budgets = await prisma.budget.findMany({
            where: {
                userId: session.user.id,
                month: month  // directly "2025-05"
            },
            include: { category: true }
        })

        return NextResponse.json({ budgets })

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

}

//POST /api/budgets → create or update a budget (use Prisma's upsert)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { amount, month, categoryId } = budgetSchema.parse(body)

        const resolvedCategoryId = categoryId ?? null

        const existing = await prisma.budget.findFirst({
            where: {
                userId: session.user.id,
                month,
                categoryId: resolvedCategoryId
            }
        })

        const budget = existing
            ? await prisma.budget.update({
                where: { id: existing.id },
                data: { amount }
            })
            : await prisma.budget.create({
                data: {
                    amount,
                    userId: session.user.id,
                    categoryId: resolvedCategoryId,
                    month
                }
            })

        return NextResponse.json({ budget }, { status: 201 })

    } catch (error) {
        console.error('Error creating/updating budget:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}