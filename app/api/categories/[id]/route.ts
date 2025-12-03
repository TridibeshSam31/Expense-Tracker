//delete a specific catergory filled by the user 

import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";



export async function DELETE(request:NextRequest ,  { params }: { params: { id: string } }){
    try {
      //user authentication check kro 
      //agar user aunticated hai 
      //then search the id from  the database 
      //user ko serversession se nikal do 
      //agar user mila toh  authorize nhi mila toh khtm 
      const session = await getServerSession()
      
      if (!session?.user) {
        return NextResponse.json("User Not Authonticated",{status:404})        
      }

      //idhar hi khaali nhi chd skte hai humne database mai category mai bhi userId di hai usme se bhi check krwana hoga
      //uske liye category se uId findOut krwayenge and then agar nhi mila so user nhi
      // agar categoiry.userId hmare uss session se jo user mila hai usse match na ho tab bhi user nhi hai


      
      const category = await prisma.category.findUnique({
        where:{
            id:params.id
        }
      })

      if (!category|| category.userId!==session.user) {
        return NextResponse.json("User Not Found",{status:403})
        
      }

      //jab yeh mil jaaaye then kaam ho gya so delte

      const deleteByid = await prisma.category.delete({
        where:{
            id:params.id
        }
      })

      //response pass krwa do 
      return NextResponse.json("Category Delted Successfully",deleteByid)


    } catch (error) {
        
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }

}
