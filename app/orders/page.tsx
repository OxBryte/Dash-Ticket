'use client'

import { useState } from 'react'
import { Search, Download, Calendar, MapPin, Ticket } from 'lucide-react'
import { format } from 'date-fns'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  customerEmail: string
  customerName: string
  createdAt: string
  event: {
    title: string
    startDate: string
    venue?: {
      name: string
      city: string
    }
  }
  items: Array<{
    quantity: number
    ticketType: {
      name: string
    }
  }>
  tickets: Array<{
    id: string
    ticketNumber: string
    qrCode: string
    status: string
  }>
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleSearch = async () => {
    if (!searchQuery) {
      setError('Please enter an order number or email')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Check if it's an email or order number
      const isEmail = searchQuery.includes('@')
      const url = isEmail 
        ? `/api/orders?email=${encodeURIComponent(searchQuery)}`
        : `/api/orders?orderNumber=${encodeURIComponent(searchQuery)}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        if (isEmail) {
          setOrders(data)
          setSelectedOrder(null)
        } else {
          setOrders([data])
          setSelectedOrder(data)
        }
      } else {
        setError(data.error || 'Order not found')
        setOrders([])
      }
    } catch (err) {
      setError('Failed to fetch order')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[status as keyof typeof colors] || colors.PENDING
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Find Your Orders</h1>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter order number or email address"
                className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Results */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{order.event.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Order #{order.orderNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{format(new Date(order.event.startDate), 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                    {order.event.venue && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{order.event.venue.name}, {order.event.venue.city}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Ticket className="w-5 h-5 mr-2" />
                      <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} ticket(s)</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Tickets</h3>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.ticketType.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t dark:border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Paid</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* QR Codes */}
                  {order.tickets && order.tickets.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Your Tickets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="border dark:border-gray-700 rounded-lg p-4 text-center"
                          >
                            <div className="bg-gray-100 dark:bg-gray-900 w-32 h-32 mx-auto mb-3 flex items-center justify-center rounded">
                              <Ticket className="w-16 h-16 text-gray-400" />
                              {/* In production, render actual QR code */}
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Ticket #{ticket.ticketNumber}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => alert('Download functionality would be implemented here')}
                        className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All Tickets (PDF)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Search for your order using the order number or email address</p>
          </div>
        )}
      </div>
    </div>
  )
}

