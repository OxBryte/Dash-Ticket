import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { Prisma } from '@prisma/client'

// Define a type that includes the relation fields we fetch
type EventWithDetails = Prisma.EventGetPayload<{
  include: {
    venue: true,
    ticketTypes: true
  }
}>

interface EventCardProps {
  event: EventWithDetails
}

export default function EventCard({ event }: EventCardProps) {
  // Calculate price range
  const prices = event.ticketTypes.map(t => t.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {/* Placeholder for Image */}
        {event.imageUrl ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-4xl">🎫</span>
            </div>
        )}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase">
            {event.category}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          <Link href={`/events/${event.id}`} className="hover:text-blue-600 transition-colors">
            {event.title}
          </Link>
        </h3>
        
        <div className="space-y-2 mb-4 flex-grow">
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')}</span>
            </div>
            
            {event.venue && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
                </div>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="text-blue-600 dark:text-blue-400 font-bold">
                {prices.length > 0 ? (
                    minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                ) : (
                    "Check details"
                )}
            </div>
            <Link 
                href={`/events/${event.id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
                Get Tickets
            </Link>
        </div>
      </div>
    </div>
  )
}

