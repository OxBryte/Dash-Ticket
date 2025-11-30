import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import EventCard from '@/app/components/events/EventCard'

export default async function Home() {
  // Fetch 3 featured events
  const featuredEvents = await prisma.event.findMany({
    where: { status: 'ON_SALE' },
    take: 3,
    orderBy: { startDate: 'asc' },
    include: { venue: true, ticketTypes: true }
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Live Experiences, Unforgettable Memories
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover and book tickets for the best concerts, festivals, conferences, and more.
          </p>
          <Link 
            href="/events" 
            className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            Find Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Events</h2>
            <Link href="/events" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {featuredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No featured events at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
