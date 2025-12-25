import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
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

  // Category badge colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CONCERT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      SPORTS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      FESTIVAL: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      CONFERENCE: 'bg-green-500/20 text-green-300 border-green-500/30',
      THEATER: 'bg-red-500/20 text-red-300 border-red-500/30',
      COMEDY: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      OTHER: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return colors[category] || colors.OTHER
  }

  return (
    <Link href={`/events/${event.id}`} className="group">
      <div className="bg-[#292929] rounded-2xl overflow-hidden border border-[#404040] hover:border-[#A5BF13] transition-all duration-300 hover:shadow-xl hover:shadow-[#A5BF13]/10 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-56 bg-[#1a1a1a] overflow-hidden">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl opacity-30">🎫</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(event.category)}`}>
              {event.category}
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#292929] via-transparent to-transparent opacity-60" />
        </div>
        
        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#A5BF13] transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2.5 mb-4 flex-grow">
            <div className="flex items-center text-gray-400 text-sm">
              <CalendarDays className="w-4 h-4 mr-2.5 flex-shrink-0 text-[#A5BF13]" />
              <span>{format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')}</span>
            </div>
            
            {event.venue && (
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2.5 flex-shrink-0 text-[#A5BF13]" />
                <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-[#404040] flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <p className="text-[#A5BF13] font-bold text-lg">
                {prices.length > 0 ? formatPrice(minPrice) : "TBA"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-white text-sm font-medium group-hover:text-[#A5BF13] transition-colors">
              Get Tickets
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
