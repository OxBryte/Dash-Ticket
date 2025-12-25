'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import EventCard from '@/app/components/events/EventCard'
import { Prisma } from '@prisma/client'

type EventWithDetails = Prisma.EventGetPayload<{
  include: {
    venue: true,
    ticketTypes: true
  }
}>

const categories = [
  'ALL',
  'CONCERT',
  'SPORTS',
  'CONFERENCE',
  'FESTIVAL',
  'THEATER',
  'COMEDY',
  'OTHER'
]

const sortOptions = [
  { value: 'date_asc', label: 'Date (Soonest)' },
  { value: 'date_desc', label: 'Date (Latest)' },
  { value: 'title_asc', label: 'Name (A-Z)' },
  { value: 'title_desc', label: 'Name (Z-A)' },
]

export default function EventsSearchPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    query: '',
    category: 'ALL',
    city: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'date_asc'
  })

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      // Map query to q for API
      if (filters.query && filters.query.trim()) {
        params.append('q', filters.query.trim())
      }
      if (filters.category && filters.category !== 'ALL') {
        params.append('category', filters.category)
      }
      if (filters.city && filters.city.trim()) {
        params.append('city', filters.city.trim())
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }
      if (filters.minPrice && filters.minPrice.trim()) {
        params.append('minPrice', filters.minPrice.trim())
      }
      if (filters.maxPrice && filters.maxPrice.trim()) {
        params.append('maxPrice', filters.maxPrice.trim())
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const response = await fetch(`/api/events/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEvents([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch events on mount
  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refetch when category or sort changes (but not on initial mount)
  useEffect(() => {
    if (!isLoading) {
      fetchEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    fetchEvents()
  }

  // Also allow search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsLoading(true)
      fetchEvents()
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'ALL',
      city: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'date_asc'
    })
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Events</h1>
          <p className="text-gray-400">Find your next unforgettable experience</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search events, venues, or artists..."
                className="w-full pl-12 pr-4 py-4 bg-[#292929] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/20"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-4 border rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-[#A5BF13] border-[#A5BF13] text-[#292929]' 
                  : 'bg-[#292929] border-[#404040] text-white hover:border-[#A5BF13]'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#A5BF13]" />
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Min Price ($)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Price ($)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="1000"
                  min="0"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  fetchEvents()
                  setShowFilters(false)
                }}
                className="bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-6 py-3 rounded-lg font-bold transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterChange('category', cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filters.category === cat
                  ? 'bg-[#A5BF13] text-[#292929] shadow-lg shadow-[#A5BF13]/30'
                  : 'bg-[#292929] text-gray-300 border border-[#404040] hover:border-[#A5BF13] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {isLoading ? 'Searching...' : `${events.length} Events Found`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#292929] border border-[#404040] rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-[#292929] border border-[#404040] rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] font-bold px-6 py-3 rounded-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
