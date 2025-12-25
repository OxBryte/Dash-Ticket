import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import { Calendar, Ticket, DollarSign, TrendingUp, Package, Clock, CheckCircle, ArrowRight, Sparkles, Users, BarChart3, Eye, Edit, Plus as PlusIcon } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user?.email) {
    redirect('/auth/signin')
  }

  const isOrganizer = user.role === 'ORGANIZER'

  // Fetch data based on user role
  let orders: any[] = []
  let organizerEvents: any[] = []
  let organizerStats = {
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0
  }

  if (isOrganizer) {
    // Fetch organizer's events
    organizerEvents = await prisma.event.findMany({
      where: { organizerId: user.id },
      include: {
        venue: true,
        ticketTypes: true,
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          where: { status: 'COMPLETED' },
          select: {
            totalAmount: true,
            items: {
              select: {
                quantity: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate organizer stats
    organizerStats.totalEvents = organizerEvents.length
    organizerStats.activeEvents = organizerEvents.filter(e => e.status === 'ON_SALE' && new Date(e.startDate) > new Date()).length
    
    organizerEvents.forEach(event => {
      event.orders.forEach((order: any) => {
        organizerStats.totalRevenue += Number(order.totalAmount)
        order.items.forEach((item: any) => {
          organizerStats.totalTicketsSold += item.quantity
        })
      })
    })
  } else {
    // Fetch user's orders (attendee)
    orders = await prisma.order.findMany({
      where: { customerEmail: user.email },
      include: {
        event: {
          include: {
            venue: true
          }
        },
        items: {
          include: {
            ticketType: true
          }
        },
        tickets: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  }

  // Calculate attendee statistics
  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const totalTickets = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
  const upcomingEvents = orders.filter(order => {
    const eventDate = new Date(order.event.startDate)
    return eventDate > new Date() && order.status === 'COMPLETED'
  }).length

  // Get recent orders
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-8 h-8 text-[#A5BF13]" />
                <h1 className="text-4xl font-bold text-white">
                  Welcome back, {user.name || 'User'}!
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                {isOrganizer ? 'Manage your events, track sales, and engage with attendees.' : 'Manage your tickets, orders, and events all in one place.'}
              </p>
            </div>
            {isOrganizer && (
              <Link
                href="/organizer/events/create"
                className="flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30 cursor-pointer"
              >
                <PlusIcon className="w-5 h-5" />
                Create Event
              </Link>
            )}
          </div>
        </div>

        {isOrganizer ? (
          <>
            {/* Organizer Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Events</p>
                    <p className="text-3xl font-bold text-white">{organizerStats.totalEvents}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
                      ${(organizerStats.totalRevenue / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Tickets Sold</p>
                    <p className="text-3xl font-bold text-white">{organizerStats.totalTicketsSold}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Ticket className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Active Events</p>
                    <p className="text-3xl font-bold text-white">{organizerStats.activeEvents}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Events */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Events</h2>
                <Link 
                  href="/organizer/events/create"
                  className="flex items-center gap-2 text-[#A5BF13] hover:text-[#8a9f10] text-sm font-medium group cursor-pointer"
                >
                  Create New
                  <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              {organizerEvents.length === 0 ? (
                <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-dashed border-[#404040]">
                  <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6 text-lg">No events created yet</p>
                  <Link 
                    href="/organizer/events/create"
                    className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-6 py-3 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {organizerEvents.slice(0, 6).map((event) => {
                    const totalRevenue = event.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0)
                    const totalSold = event.orders.reduce((sum: number, order: any) => 
                      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
                    )
                    const totalCapacity = event.ticketTypes.reduce((sum: number, tt: any) => sum + tt.quantityTotal, 0)

                    return (
                      <div
                        key={event.id}
                        className="bg-[#1a1a1a] border border-[#404040] rounded-xl overflow-hidden hover:border-[#A5BF13] transition-all group"
                      >
                        {event.imageUrl && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-3 right-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                event.status === 'ON_SALE' 
                                  ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30 backdrop-blur-sm'
                                  : event.status === 'DRAFT'
                                  ? 'bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500 border-opacity-30 backdrop-blur-sm'
                                  : 'bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 backdrop-blur-sm'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#A5BF13] transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            {format(new Date(event.startDate), 'MMM d, yyyy')} • {event.venue?.name}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#404040]">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Revenue</p>
                              <p className="text-sm font-bold text-[#A5BF13]">
                                ${(totalRevenue / 100).toFixed(0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Sold</p>
                              <p className="text-sm font-bold text-white">
                                {totalSold}/{totalCapacity}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Orders</p>
                              <p className="text-sm font-bold text-white">
                                {event._count.orders}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#292929] hover:bg-[#3a3a3a] text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            <Link
                              href={`/organizer/events/${event.id}/edit`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg text-sm font-bold transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Attendee Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Package className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Spent</p>
                    <p className="text-3xl font-bold text-white">
                      ${(totalSpent / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Tickets</p>
                    <p className="text-3xl font-bold text-white">{totalTickets}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Ticket className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Upcoming Events</p>
                    <p className="text-3xl font-bold text-white">{upcomingEvents}</p>
                  </div>
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="h-7 w-7 text-[#A5BF13]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link 
                href="/events"
                className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] hover:shadow-lg hover:shadow-[#A5BF13]/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 group-hover:text-[#A5BF13] transition-colors">Browse Events</h3>
                    <p className="text-sm text-gray-400">Discover new events</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-[#A5BF13] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link 
                href="/orders"
                className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] hover:shadow-lg hover:shadow-[#A5BF13]/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <Ticket className="h-6 w-6 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 group-hover:text-[#A5BF13] transition-colors">View Orders</h3>
                    <p className="text-sm text-gray-400">Track your purchases</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-[#A5BF13] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link 
                href="/checkout"
                className="bg-[#292929] border border-[#404040] rounded-2xl p-6 hover:border-[#A5BF13] hover:shadow-lg hover:shadow-[#A5BF13]/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 group-hover:text-[#A5BF13] transition-colors">Cart & Checkout</h3>
                    <p className="text-sm text-gray-400">Complete your purchase</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-[#A5BF13] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link 
                  href="/orders"
                  className="flex items-center gap-2 text-[#A5BF13] hover:text-[#8a9f10] text-sm font-medium group cursor-pointer"
                >
                  View All
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-dashed border-[#404040]">
                  <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6 text-lg">No orders yet</p>
                  <Link 
                    href="/events"
                    className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-6 py-3 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Browse Events
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders?orderNumber=${order.orderNumber}`}
                      className="block bg-[#1a1a1a] border border-[#404040] rounded-xl p-6 hover:border-[#A5BF13] transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-white text-lg group-hover:text-[#A5BF13] transition-colors">
                              {order.event.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              order.status === 'COMPLETED' 
                                ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30'
                                : order.status === 'PENDING'
                                ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-30'
                                : 'bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {order.event.venue?.name} • {format(new Date(order.event.startDate), 'MMM d, yyyy')}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-mono">#{order.orderNumber}</span>
                            <span>•</span>
                            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} tickets</span>
                            <span>•</span>
                            <span className="font-bold text-[#A5BF13]">
                              ${(Number(order.totalAmount) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                          {order.status === 'COMPLETED' ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : (
                            <Clock className="h-6 w-6 text-yellow-400" />
                          )}
                          <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-[#A5BF13] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
