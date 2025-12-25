'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, Search, User, LogOut, LayoutDashboard, ShoppingBag, Plus } from 'lucide-react'
import CartDrawer from './cart/CartDrawer'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <nav className="sticky top-0 z-50 bg-[#292929] border-b border-[#404040] backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A5BF13] blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <Ticket className="h-8 w-8 text-[#A5BF13] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">TixHub</span>
              <span className="text-[10px] text-[#A5BF13] font-medium -mt-1">LIVE EVENTS</span>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              href="/events" 
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-all"
            >
              Browse Events
            </Link>
            {user?.role === 'ORGANIZER' && (
              <Link 
                href="/organizer/events/create"
                className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button - Mobile/Desktop */}
            <Link
              href="/events"
              className="p-2.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-all"
            >
              <Search className="h-5 w-5" />
            </Link>

            <CartDrawer />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#A5BF13] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#292929]">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#292929] border border-[#404040] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-[#404040]">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-2">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#3a3a3a] transition-all"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link 
                        href="/orders" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#3a3a3a] transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                      {user.role === 'ORGANIZER' && (
                        <Link 
                          href="/organizer/events/create" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#3a3a3a] transition-all lg:hidden"
                        >
                          <Plus className="h-4 w-4" />
                          Create Event
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#404040] pt-2">
                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false)
                          await fetch('/api/auth/logout', { method: 'POST' })
                          router.refresh()
                          window.location.href = '/'
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#3a3a3a] transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth/signin"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#A5BF13]/20"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
