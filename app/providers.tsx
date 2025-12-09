"use client"

import {QueryClient,QueryClientProvider} from "@tanstack/react-query"
import {useState} from "react"

export function Provider({children}:{children:React.ReactNode}){
    //isme hum aise nhi kr skte
   // const queryClient = new queryClient() 
   //aise har re render mai ek new client bnega jisse 
   //mutations break honge 
   //cache resets
   //React Query completely breaks
    const [queryClient] = useState(()=>{
        return new QueryClient({
            defaultOptions:{
                queries:{
                    staleTime: 60 * 1000, // 1 minute 
                    refetchOnWindowFocus: false, //
                    retry: 1,
                }
            }
        })
    })

    return(
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

}

/*

staleTime: 60 * 1000

Meaning:

“For 60 seconds, data is considered fresh, so React Query will NOT refetch.”

Why this matters:

Without staleTime (default = 0), React Query refetches EXTREMELY often.

Example:
Component mounts → fetch
Switch tab → back → refetch
Hover over tab → refetch
Focus window → refetch

refetchOnWindowFocus: false
Meaning:

“Whenever user switches tabs → don’t auto-refetch.”
This avoids unnecessary network calls.
Most devs leave this ON → UI keeps reloading and flickering.


retry: 1

Meaning:

“If a request fails, retry only once.”
Default is 3 retries, which is too much.
You trimmed it → good.
This makes the app more responsive and avoids spamming backend.




this syntax is very common so use it in almost every where 
*/