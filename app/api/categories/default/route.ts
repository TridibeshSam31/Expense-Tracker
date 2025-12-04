//default colors ko change bhi krna hai uske liye bhi routes ko likhne pdenge

import { NextRequest,NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";


//what should be our default categories color
//food ke liye red
//transport ke liye blue
//shopping ke liye purple
//entertainment ke liye yellow
//bills ke liye green
//other expense ke liye grey 

const defaultCategories = [
    {name:'Food',color:'#ef4444'},
    {name:'Transport',color:'#3b82f6'},
    {name:'Shopping',color:'#8b5cf6'},
    {name:'Entertainment',color:'#f59e0b'},
    {name:'Bills',color:'#10b981'},
    {name:'Other',color:'#6b7280'},

]

export async function POST(request:NextRequest){
    try {
       const session = await getServerSession()
       const user = session?.user.id
       
       if (!session) {
        return NextResponse.json({error:'no user found'},{status:401})
       }

       //check if the user already has categories
       const existingCategories = await prisma.Category.findMany({
        where:{
            userId:user
        }
               
       })

       //If this user has no categories yet, then insert all defaultCategories for them. If a duplicate happens, ignore it.

        if (existingCategories.length === 0) {
          for (const cat of defaultCategories) {
         try {
          await prisma.category.create({
            data: {
              ...cat,
              userId: session.user.id,
            },
          })
         } catch (err) {
          // Ignore duplicate category errors
         }
        }  
            
        }
        /*
        The above has other ways also 
        
        if (existingCategories.length === 0) {
        await prisma.category.createMany({
        data: defaultCategories.map(cat => ({
      ...cat,
      userId: session.user.id,
      })),
     skipDuplicates: true,
     });
     }

     This avoids the loop, avoids try–catch spam, and is faster (1 DB call instead of many).

     Alternative 2 — Upsert
     This will create the category if not existing, otherwise do nothing.
     for (const cat of defaultCategories) {
    await prisma.category.upsert({
    where: {
      name_userId: {   // composite unique key you should define
        name: cat.name,
        userId: session.user.id,
      }
    },
    update: {},
    create: {
      ...cat,
      userId: session.user.id,
    },
  });
  }

  Alternative 3 — Check missing items only (Smartest logic)
  Instead of inserting blindly, check which default categories the user is missing.

  const userCategories = await prisma.category.findMany({
  where: { userId: session.user.id },
});

const missing = defaultCategories.filter(
  dc => !userCategories.some(uc => uc.name === dc.name)
);

if (missing.length > 0) {
  await prisma.category.createMany({
    data: missing.map(cat => ({
      ...cat,
      userId: session.user.id,
    })),
  });
}



        
        
        
        
        
        
        
     */

        return NextResponse.json({message:"Default Categories Created"},)
    } catch (error) {
    console.error('Error creating default categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }
}