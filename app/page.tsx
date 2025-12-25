import Link from 'next/link'
import { ArrowRight, Sparkles, Calendar, Shield, Zap } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import EventCard from '@/app/components/events/EventCard'

export default async function Home() {
  // Fetch 6 featured events
  const featuredEvents = await prisma.event.findMany({
    where: { status: 'ON_SALE' },
    take: 6,
    orderBy: { startDate: 'asc' },
    include: { venue: true, ticketTypes: true }
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0f0f0f] pt-20 pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A5BF13] opacity-5 blur-[128px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A5BF13] opacity-5 blur-[128px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#292929] border border-[#404040] rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-[#A5BF13]" />
              <span className="text-sm font-medium text-gray-300">Your Gateway to Unforgettable Experiences</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Live Events,<br />
              <span className="text-[#A5BF13]">Unforgettable Moments</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover and book tickets for the world's best concerts, festivals, sports events, and more. Your next experience is just a click away.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/events" 
                className="group inline-flex items-center justify-center gap-3 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#A5BF13]/30 hover:shadow-xl hover:shadow-[#A5BF13]/40"
              >
                Explore Events
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/organizer/events/create" 
                className="inline-flex items-center justify-center gap-3 bg-[#292929] hover:bg-[#3a3a3a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all border border-[#404040] hover:border-[#A5BF13]"
              >
                Create Event
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group">
              <div className="w-12 h-12 bg-[#A5BF13] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Easy Booking</h3>
              <p className="text-gray-400 text-sm">Browse and book tickets in seconds with our streamlined checkout process.</p>
            </div>

            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group">
              <div className="w-12 h-12 bg-[#A5BF13] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure Payments</h3>
              <p className="text-gray-400 text-sm">Your transactions are protected with enterprise-grade security.</p>
            </div>

            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group">
              <div className="w-12 h-12 bg-[#A5BF13] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Confirmation</h3>
              <p className="text-gray-400 text-sm">Get your tickets immediately via email after purchase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Featured Events</h2>
              <p className="text-gray-400">Don't miss out on these amazing experiences</p>
            </div>
            <Link 
              href="/events" 
              className="hidden md:flex items-center gap-2 text-[#A5BF13] hover:text-[#8a9f10] font-medium group"
            >
              View all events
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#292929] border border-[#404040] rounded-2xl">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-medium text-white mb-2">No events yet</h3>
              <p className="text-gray-400 mb-6">Be the first to create an event!</p>
              <Link 
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] font-bold px-6 py-3 rounded-lg transition-all"
              >
                Create Event
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Mobile View All Link */}
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 text-[#A5BF13] hover:text-[#8a9f10] font-medium"
            >
              View all events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#292929]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Host Your Event?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of organizers using TixHub to sell tickets and manage events.
            </p>
            <Link 
              href="/organizer/events/create"
              className="inline-flex items-center gap-3 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#A5BF13]/30"
            >
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
