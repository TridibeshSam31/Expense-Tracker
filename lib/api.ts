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