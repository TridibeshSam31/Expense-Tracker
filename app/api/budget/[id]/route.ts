//DELETE /api/budgets/[id] → delete a budget



import { getServerSession } from "@/lib/auth-utils";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"




export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }){
    try {
        const { id } = await params
        const session = await getServerSession()
        const user = session?.user.id 
    
        if (!user) {
            NextResponse.json({ error: "user not found" }, { status: 403 })
            
        }
    
       //checking agar user ne shi mai koi expense bnaya hai ya nhi agar nhi bnaya toh response pass krwa denge
    
       const budget = await prisma.budget.findUnique({
        where:{
            id:id
        }
       })
    
       if (!budget || budget.userId !== user) {
        return NextResponse.json({ error: "not authorized" }, { status: 404 })
        
       }
    
       const deleteIndb = await prisma.budget.delete({
        where:{
            id:id
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