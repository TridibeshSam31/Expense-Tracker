//frontend mai react query/tanstack query ka use krenge uske liye hume hooks create krne pdenge 
//tanstack query use krne se useEffect aur useState ki need hi khtm ho jaati hai 
// aur tanstack react ke upar caching bhi provide kr deta hai 
//code minimal but usage maximum 
// tanstack query ke andar jo cheeje aati hai
//QueryClient, QueryClientProvider
/*
QueryClient: Yeh actual "brain" hai TanStack Query ka

Think of QueryClient as:

👉 The central database in memory
👉 The place where caching happens
👉 The place where all queries and mutations are stored, updated, invalidated

React Query / TanStack Query without QueryClient = completely useless.

🔥 QueryClient what it stores:

Cached API data
Query keys
Stale/fresh status
Retry logic
Mutation states
Background refetch info
Observers (kaunsi component iss query ko use kar rahi hai)

const queryClient = new QueryClient(); 



QueryClientProvider: Yeh engine ko React tree mein inject karta hai
React ke andar ek bhi query tab tak kaam nahi karegi jab tak tum QueryClientProvider use nahi karoge.

Simple analogy:

QueryClient = Engine
QueryClientProvider = Car frame that holds the engine
React components = Passengers that use the engine
Provider ke bina engine react app se connected hi nahi hota.


What EXACTLY QueryClient gives you??
1. Caching

React khud caching nahi karta.
TanStack Query kaam hi QueryClient ki wajah se karta hai.

✔ 2. Global shared state

Agar 5 components useQuery('todos') use karte hain →
QueryClient ensures only 1 API call happens, baaki sab cache se data lete hain.

✔ 3. invalidateQueries()

This function ALSO comes from QueryClient.

queryClient.invalidateQueries(['expenses'])
eh bata raha hai:

"Expenses ka jo bhi cache hai, usko stale mark kar. Dubara fetch kar."

✔ 4. setQueryData()

Tum bina API call ke cache update kar sakte ho.

✔ 5. Prefetching

Before user opens a page, pehle se data load kar sakte ho.

What EXACTLY QueryClientProvider does


✔ 1. React app ko QueryClient provide karta hai

Without this, React components don’t know query client even exists.

✔ 2. Har component ko:

useQuery

useMutation

invalidateQueries

mutation status

query cache

—all yeh sab tree ke upar se injection hota hai.

✔ 3. Yeh context API ka use karta hai

Provider ke through niche ke components shared query client use karte hain.

Tanstack qUERY USE KRTE TIME HUME KUCH CHEEJE USE KRTE HAI JAISE
QUERY KEY
QUERY FXNS
invalidateQueries

YEH TEENO MAJORLY AATE HAI 
AB INKA USE KYA HAI KAISE HIYA JAATA HAI WOH JAANNA JARRURI HAI 

INKE ALAWA TANSTACK QUERY HUME 2MAJOR HOOKS PROVIDE KRTI HAI 
1.useMutations
2.useQuery 

Now inhe details mai dekhte hai useMutations hota hai hmara tab use jab hmare api mai hori hai cheeje jaise CREATE,UPDATE,DELETE,ACTIONS basocally data create krne ke liye 
mtlb??

Example use cases:
Create new expense
Edit expense
Delete expense
Add category
Mark todo as completed
Login (POST)
Upload file
Update profile

Basically:

POST / PUT / PATCH(update only a specific field) / DELETE = useMutation

ab useQuery kab use hota hai ??
useQuery hota hai use jab hum get request ko handle krte hai 
Aur sirf READ operations ke liye.

Example use cases:
Get all expenses
Get stats
Get user profile
Get categories
Get todos
Get products list
Get weather

Basically GET request = useQuery.


inhi se hum likhte hai code kaafi aasan bna dete hai cheeje ab aakri cheeje dekhte hai ki QueryKey
QueryFxn
invalidateQueries



*/
"use client"

import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";

export interface Expense {
    id:string,
    amount:number,
    description:string,
    date:string,
    category:Category | null,
    categoryId:string | null,
    userId:string,
    createdAt:string,
    updatedAt:string
    
}

export interface Category{
    id:string,
    name:string,
    color:string,
    userId:string,
    createdAt:string,
    updatedAt:string

}

export interface ExpenseStats{
    total:number,
    byCategory: Array<{
        categoryId:string | 0 | null,
        total:number,
        color:string | null
    }>

    byMonth: Array<{
        month:string,
        total:number
    }>
}



//Expense hooks using tanstack query
//this will be a get request , so useQuery will be used
export function useExpenses(startDate?: string, endDate?: string){
    return useQuery<Expense[]>({
        queryKey:['expenses',startDate,endDate],
        queryFn:async ()=>{
            const params = new URLSearchParams()
            if (startDate) {
                params.append('startDate', startDate)
                
            }
            if (endDate) {
                params.append('endDate', endDate)
            }
            const response = await fetch(`/api/expenses?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch expenses')
            }
            return response.json()
        }


    })

}

//post request ke lye useMutation ka use 
export function useCreateExpense(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:async (data:{
            amount:number,
            description:string,
            date:string,
            categoryId:string | null
        }) =>{
            const response = await fetch('/api/expenses',{
                method:"POST",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to create expense')
            }
            return response.json()
        },
        onSuccess:()=>{
            //Invalidate and refetch
            queryClient.invalidateQueries({queryKey:['expenses']})
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    })

}


//patch /put/Delete request ke lye useMutation ka use

export function useUpdateExpense(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:async({
            id,
            ...data
        }:{
            id: string
            amount: number
            description: string
            date: string
            categoryId?: string | null
        })=>{
            const response = await fetch(`/api/expenses/${id}`,{
                method:"PATCH",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to update expense')
            }
            return response.json()
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['expenses']})
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    })

}


//delete request ke lye useMutation ka use

export function useDeleteExpense(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:async(id:string)=>{
            const response = await fetch(`/api/expenses/${id}`,{
                method:"DELETE"
            })
            if(!response.ok){
                throw new Error('Failed to delete expense')
            }

            return response.json()
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['expenses']})
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    })
}


//fetching stats ke lye useQuery ka use

//getting stats ke lye
export function useExpenseStats(startDate?:string,endDate?:string){
    return useQuery<ExpenseStats>({
        queryKey:['stats',startDate,endDate],
        queryFn:async()=>{
            const params = new URLSearchParams()
            if (startDate) {
                params.append('startDate',startDate)
            }
            if (endDate) {
                params.append('endDate',endDate)
            }
            const response = await fetch(`/api/stats?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch stats')
            }
            return response.json()
        }
    })

}


//now categories ke liye 
//get ke liye useQuery 
export function useCategories(){
    return useQuery<Category[]>({
        queryKey:['categories'],
        queryFn:async()=>{
            const response = await fetch(`/api/categories`)
            if (!response.ok) {
                throw new Error('Failed to fetch categories')
                
            }
            return response.json()
        }
    })
}


//post ke liye useMutation

export function useCreateCategory(){
    const queryClient = useQueryClient()
    return useMutation ({
        mutatuionFn:async(data:{})

    })
}