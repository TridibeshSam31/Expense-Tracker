import { auth } from './auth'
import { headers } from 'next/headers'

export async function getServerSession() {
  const headersList = await headers()
  const session = await auth.api.getSession({ 
    headers: Object.fromEntries(headersList.entries())
  })
  return session
}

