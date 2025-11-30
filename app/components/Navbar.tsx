import Link from 'next/link'
import { Calendar, Search, User } from 'lucide-react'
import CartDrawer from './cart/CartDrawer'

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              <Calendar className="h-8 w-8" />
              <span>TicketMaster</span>
            </Link>
          </div>

          {/* Search (Hidden on mobile for now) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search events, venues, or artists..."
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/events" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Find Events
            </Link>
            
            <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <ShoppingCart className="h-6 w-6" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

