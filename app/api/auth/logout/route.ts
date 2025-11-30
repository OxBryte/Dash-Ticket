import { NextResponse } from 'next/server'
import { signOut } from '@/app/lib/auth'

export async function POST() {
  await signOut()
  return NextResponse.json({ success: true })
}

