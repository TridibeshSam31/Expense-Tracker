//update and delete expenses 

import { getServerSession } from "@/lib/auth-utils";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import expenseSchema from "@/Schema/expenseSchema";



export async function DELETE(response:NextResponse,{ params }: { params: { id: string } }){
    try {
        const session = await getServerSession()
        const user = session?.user.id 
    
        if (!user) {
            NextResponse.json("user not found",{status:403})
            
        }
    
       //checking agar user ne shi mai koi expense bnaya hai ya nhi agar nhi bnaya toh response pass krwa denge
    
       const expense = await prisma.expense.findUnique({
        where:{
            id:params.id
        }
       })
    
       if (!expense || expense.userId!==user) {
        return NextResponse.json("not authorized",{status:404})
        
       }
    
       const deleteIndb = await prisma.expense.delete({
        where:{
            id:params.id
        }
       })
    
       return NextResponse.json(deleteIndb)
    
    } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }

}

export async function PUT(response:NextResponse,{ params }: { params: { id: string } }){
    //yeh thoda mushkil hai noramal method se expenses ko delete nhi kr skte logic dhundna mushkil hai
    //sbse pehle user authentication
    try {
      const session = await getServerSession()
        const user = session?.user.id 
    
        if (!user) {
            NextResponse.json("user not found",{status:403})
            
        }
        //if user is authenticated see the exisiting expenses

        const expense = await prisma.expense.findUnique({
        where:{
            id:params.id
        }
       })
    
       if (!expense || expense.userId!==user) {
        return NextResponse.json("not authorized",{status:404})
        
       }

       //now the updation works starts
       const body = await response.json()
       const data = expenseSchema.parse(body)
       //console.log(data)
       //in the data we have categoryId , amount , description , data

       
       const updateData:any = {}
    
       if (data.amount !== undefined) {
        updateData.amount = data.amount
       }
       if (data.description!==undefined) {
        updateData.description = data.description
       }
       if (data.categoryId!==undefined||null) {
        updateData.categoryId = data.categoryId
       }
       if (data.date!==undefined) {
        updateData.date = new Date(data.date)
       }

       const updateindb = await prisma.expense.update({
         where: { id: params.id },
         data: updateData,
        include: { category: true }, //After updating this expense, also fetch and return the linked category object
       })

       return NextResponse.json(updateindb)

       /*
       alternatte method the data that we are parsing 
       
       data: {
     ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.description !== undefined && { description: data.description }),
     ...(data.date !== undefined && { date: new Date(data.date) }),
    ...(data.categoryId !== undefined && {
      categoryId: data.categoryId || null,
    }),
    },  

    ... spread operator used for spreading object properties into another object.
    this  is the cleaner form of if else condition form 
       
       
       
       
       */

       

    } catch (error) {
        console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }
}