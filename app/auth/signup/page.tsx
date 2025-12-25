'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, User, Mail, Lock, Ticket, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ATTENDEE'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      const message = 'Passwords do not match'
      setError(message)
      toast.error(message)
      return
    }

    if (formData.password.length < 8) {
      const message = 'Password must be at least 8 characters'
      setError(message)
      toast.error(message)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully! Please sign in.')
        // Redirect to sign in
        router.push('/auth/signin?registered=true')
      } else {
        const message = data.error || 'Failed to create account'
        setError(message)
        toast.error(message)
      }
    } catch (error) {
      const message = 'An error occurred. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A5BF13] blur-md opacity-50" />
              <Ticket className="h-10 w-10 text-[#A5BF13] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">TixHub</span>
              <span className="text-[10px] text-[#A5BF13] font-medium -mt-1">LIVE EVENTS</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#A5BF13] bg-opacity-10 rounded-xl mb-4">
              <UserPlus className="w-7 h-7 text-[#A5BF13]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-400">
              Join TixHub and start your journey
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
              >
                <option value="ATTENDEE">Attendee (Buy Tickets)</option>
                <option value="ORGANIZER">Organizer (Create Events)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 p-4">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#A5BF13]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[#A5BF13] hover:text-[#8a9f10] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
