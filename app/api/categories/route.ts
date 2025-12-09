//post the categories and get the categories
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import {categorySchema} from '@/Schema/categorySchema'
import {z} from "zod"

export async function GET(request: NextRequest){
    try {
        const session = await getServerSession()

        if (!session?.user) {
            return NextResponse.json({error:"not authenticated"},{status:401})
        }

        const categories = await prisma.category.findMany({
            where:{
                userId:session.user.id
            },
            orderBy:{
                name:"asc"
            }
        })

        return NextResponse.json(categories)



    } catch (error) {
     console.error('Error fetching categories:', error)
     return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }
 
}

export async function POST(request:NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user) {
            return NextResponse.json({error:"not authenticated"},{status:401})
        } 

        const body = await request.json()
        const {name,color} = categorySchema.parse(body)

        const category = await prisma.category.create({
            data:{
                name,
                color,
                userId: session.user.id,
            }
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error:any) {
        if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
     }
     //prisma error code when the user tries to make the category with the same name it created previous one (existing name)
     /*
     we could also write in this form 

     if (
  error instanceof Error &&
  error.message.includes('Unique constraint')
) {
  return NextResponse.json(
    { error: 'Category with this name already exists' },
    { status: 400 }
  )
}
     
     
     
     
     
     
     
     
     */
     if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }

    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
    
}