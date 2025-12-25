import { prisma } from '@/app/lib/prisma'
import TicketSelector from '@/app/components/events/TicketSelector'
import { Calendar, Clock, MapPin, User, ArrowLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
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
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Image */}
            <div className="relative h-72 md:h-[500px] bg-[#1a1a1a] rounded-2xl overflow-hidden">
              {event.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <span className="text-8xl">🎫</span>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 bg-[#A5BF13] px-4 py-2 rounded-full">
                  <Tag className="w-4 h-4 text-[#292929]" />
                  <span className="text-sm font-bold text-[#292929] uppercase tracking-wide">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
            </div>

            {/* Event Info Header */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{event.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#A5BF13] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Date</p>
                    <p className="text-white font-medium">{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#A5BF13] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Time</p>
                    <p className="text-white font-medium">{format(new Date(event.startDate), 'h:mm a')}</p>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="w-10 h-10 bg-[#A5BF13] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#A5BF13]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="text-white font-medium">{event.venue.name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {event.venue.address}, {event.venue.city}, {event.venue.state} {event.venue.zip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">About this Event</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
              
              {event.organizer && (
                <div className="mt-8 pt-8 border-t border-[#404040]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#A5BF13] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#A5BF13]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Organized by</p>
                      <p className="text-white font-medium">{event.organizer.name || event.organizer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {(event.ageRestriction || event.timezone) && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-white">Event Details</h2>
                <div className="space-y-3">
                  {event.ageRestriction && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#A5BF13] font-bold">•</span>
                      Age Restriction: <span className="font-medium">{event.ageRestriction}</span>
                    </div>
                  )}
                  {event.timezone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#A5BF13] font-bold">•</span>
                      Timezone: <span className="font-medium">{event.timezone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Tickets */}
          <div className="lg:col-span-1 space-y-6">
            <TicketSelector 
              ticketTypes={event.ticketTypes} 
              eventId={event.id} 
              eventTitle={event.title}
            />
            
            {event.venue && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#A5BF13]" />
                  Venue Information
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-white">{event.venue.name}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {event.venue.address}<br/>
                    {event.venue.city}, {event.venue.state} {event.venue.zip}
                  </p>
                </div>
                
                <div className="mt-4 h-40 bg-[#1a1a1a] rounded-xl border border-[#404040] flex items-center justify-center text-sm text-gray-500">
                  Map View
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
