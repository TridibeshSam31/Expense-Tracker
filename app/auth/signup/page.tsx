'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Wallet } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const signupMutation = useMutation({
    mutationFn: async (data: SignUpForm) => {
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name.trim(),
      }

      const result = await authClient.signUp.email(payload) as {
        error?: {
          message?: string
          code?: string
        }
      }

      if (result.error) {
        // Better Auth error format - log for debugging
        console.error('Better Auth signup error:', result.error)
        const errorMessage = 
          result.error.message || 
          result.error.code || 
          (typeof result.error === 'object' ? JSON.stringify(result.error) : String(result.error as Error)) ||
          'Registration failed'
        throw new Error(errorMessage)
      }

      return result
    },
  })

  const signinMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      }) as {
        error?: {
          message?: string
          code?: string
        }
      }

      if (result.error) {
        throw new Error(result.error.message || 'Sign in failed')
      }

      return result
    },
  })

  const createDefaultCategoriesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/categories/default', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to create default categories')
      }
      return response.json()
    },
  })

  const onSubmit = async (data: SignUpForm) => {
    try {
      // Step 1: Sign up
      await signupMutation.mutateAsync(data)

      // Step 2: Sign in
      await signinMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })

      // Step 3: Create default categories (ignore errors)
      try {
        await createDefaultCategoriesMutation.mutateAsync()
      } catch (err) {
        // Ignore errors creating default categories
      }

      toast({
        title: 'Account created!',
        description: 'Redirecting to dashboard...',
      })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'

      if (signupMutation.isError) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: errorMessage,
        })
      } else if (signinMutation.isError) {
        toast({
          variant: 'destructive',
          title: 'Registration successful but sign in failed',
          description: 'Please sign in manually',
        })
        router.push('/auth/signin?registered=true')
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        })
      }
    }
  }

  const isLoading =
    signupMutation.isPending ||
    signinMutation.isPending ||
    createDefaultCategoriesMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
