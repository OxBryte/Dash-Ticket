import { prisma } from '@/app/lib/prisma'
import EventCard from '@/app/components/events/EventCard'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: {
      status: 'ON_SALE',
    },
    include: {
      venue: true,
      ticketTypes: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover Events</h1>
          <p className="text-gray-600 dark:text-gray-300">Find tickets for the best concerts, sports, and more.</p>
        </div>
        
        {/* Filter/Sort could go here */}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
          <p className="text-gray-500">Check back later for upcoming events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

