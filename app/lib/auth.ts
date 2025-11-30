import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return { error: 'Invalid email or password' }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Invalid email or password' }
  }

  // Create JWT token
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  // Set cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}

export async function signOut() {
  cookies().delete('auth-token')
  return { success: true }
}

export async function getCurrentUser() {
  try {
    const token = cookies().get('auth-token')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return payload as { id: string; email: string; name: string; role: string }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

