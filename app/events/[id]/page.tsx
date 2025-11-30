import { prisma } from '@/app/lib/prisma'
import TicketSelector from '@/app/components/events/TicketSelector'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  // Next.js 15 requires params to be awaited or used as is?
  // In Next 15 params is asynchronous, but in Next 14 it wasn't. 
  // With the version 16 in package.json, params is a Promise.
  // Wait, package.json says Next "16.0.6"? That must be a mistake or a nightly version?
  // Ah, user info says "Next: 16.0.6". 
  // I should await params if I am in an async component.
  
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      ticketTypes: true,
      organizer: true,
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Image */}
            <div className="relative h-64 md:h-96 bg-gray-200 rounded-xl overflow-hidden shadow-md">
                {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-800">
                        <span className="text-6xl">🎫</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <Link href="/events" className="bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-md text-sm transition-colors backdrop-blur-sm">
                        ← Back to Events
                    </Link>
                </div>
            </div>

            {/* Event Info Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                        <span>{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-500" />
                        <span>{format(new Date(event.startDate), 'h:mm a')}</span>
                    </div>
                    {event.venue && (
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                            <span>{event.venue.name}, {event.venue.city}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About this Event</h2>
                <div className="prose dark:prose-invert max-w-none">
                    <p>{event.description}</p>
                </div>
                
                {event.organizer && (
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Organized by
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{event.organizer.name || event.organizer.email}</p>
                    </div>
                )}
            </div>
          </div>

          {/* Sidebar: Tickets */}
          <div className="lg:col-span-1">
            <TicketSelector 
              ticketTypes={event.ticketTypes} 
              eventId={event.id} 
              eventTitle={event.title}
            />
            
            {event.venue && (
                <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Venue Info</h3>
                    <p className="font-semibold">{event.venue.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {event.venue.address}<br/>
                        {event.venue.city}, {event.venue.state} {event.venue.zip}
                    </p>
                    
                    <div className="mt-4 h-32 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                        Map Placeholder
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

