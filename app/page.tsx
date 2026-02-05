import { Button } from "@/components/ui/button";
import { Wallet,TrendingUp,Shield,BarChart3 } from "lucide-react";
import { Card,CardContent,CardHeader,CardTitle,CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {auth} from "@/lib/auth"
import { redirect } from "next/navigation";


export default async function Home() {
  //nextjs 14 versions supports asyn compononents in frontend 
  const session = await auth.api.getSession()

  if (session?.user) {
    redirect('/dashboard')
    
  }
  return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-slate-500">
   <div className="max-w-4xl w-full mx-auto">
   <div className="text-center mb-12 ">
   <div className="flex justify-center mb-6">
    <div className="p-4 rounded-2xl ">
      <Wallet className="h-16 w-16 "/>
    </div>
   </div>
    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r  bg-clip ">Expense Tracker </h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Track your Expenses,Categorize them,and visualize your spending habits with ease</p>
   </div>

   <div className="grid md:grid-cols-3 gap-6 mb-12">
    <Card>
      <CardHeader>
        <TrendingUp className="h-10 w-10 text-primary mb-2"/>
        <CardTitle className="font-bold">Track Expenses</CardTitle>
        <CardDescription>Easily Log and manage your daily expenses</CardDescription>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader>
        <BarChart3 className="h-10 w-10 text-primary mb-2"/>
        <CardTitle className="font-bold">Visualize Spending</CardTitle>
        <CardDescription>Beautiful charts and insights into your habits</CardDescription>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader>
        <Shield className="h-10 w-10 text-primary mb-2"/>
        <CardTitle className="font-bold">Secure & Private</CardTitle>
        <CardDescription>Your financial data is protected and encrypted</CardDescription>
      </CardHeader>
    </Card>
   </div>

   <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in or create a new account to start tracking your expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
    </div>
  </div>


    
  );
}
