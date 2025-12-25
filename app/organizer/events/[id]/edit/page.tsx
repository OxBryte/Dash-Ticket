'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, MapPin, DollarSign, Ticket, Trash2, Plus, Save, ArrowLeft, BarChart3, Users, TrendingUp, Eye, ImageIcon, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantityTotal: number
  quantityAvailable: number
  maxPerOrder: number
  sortOrder: number
}

interface Event {
  id: string
  title: string
  shortDescription: string
  description: string
  category: string
  status: string
  startDate: string
  endDate: string | null
  timezone: string
  ageRestriction: string | null
  refundPolicy: string | null
  imageUrl: string | null
  venue: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    capacity: number
  }
  ticketTypes: TicketType[]
  _count: {
    orders: number
  }
  orders: Array<{
    totalAmount: number
    items: Array<{
      quantity: number
    }>
  }>
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'tickets' | 'stats'>('details')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'OTHER',
    status: 'DRAFT',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'America/New_York',
    ageRestriction: '',
    refundPolicy: '',
    imageUrl: ''
  })

  const [venue, setVenue] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    capacity: 0
  })

  const [ticketTypes, setTicketTypes] = useState<Array<{
    id?: string
    name: string
    description: string
    price: string
    quantityTotal: string
    maxPerOrder: string
  }>>([])

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) throw new Error('Failed to fetch event')
        
        const data = await response.json()
        setEvent(data)

        // Populate form
        const startDate = new Date(data.startDate)
        const endDate = data.endDate ? new Date(data.endDate) : null

        setFormData({
          title: data.title,
          shortDescription: data.shortDescription || '',
          description: data.description,
          category: data.category,
          status: data.status,
          startDate: format(startDate, 'yyyy-MM-dd'),
          startTime: format(startDate, 'HH:mm'),
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
          endTime: endDate ? format(endDate, 'HH:mm') : '',
          timezone: data.timezone,
          ageRestriction: data.ageRestriction || '',
          refundPolicy: data.refundPolicy || '',
          imageUrl: data.imageUrl || ''
        })

        setVenue(data.venue)

        setTicketTypes(data.ticketTypes.map((tt: TicketType) => ({
          id: tt.id,
          name: tt.name,
          description: tt.description || '',
          price: (tt.price / 100).toString(),
          quantityTotal: tt.quantityTotal.toString(),
          maxPerOrder: tt.maxPerOrder.toString()
        })))

        setLoading(false)
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to load event')
        router.push('/dashboard')
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVenue({ ...venue, [e.target.name]: e.target.value })
  }

  const handleTicketChange = (index: number, field: string, value: string) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, {
      name: '',
      description: '',
      price: '',
      quantityTotal: '',
      maxPerOrder: '10'
    }])
  }

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (ticketTypes.length === 0 || ticketTypes.some(tt => !tt.name || !tt.price || !tt.quantityTotal)) {
      toast.error('Please add at least one valid ticket type')
      return
    }

    setSaving(true)

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : null

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString(),
          venue,
          ticketTypes: ticketTypes.map(tt => ({
            id: tt.id,
            name: tt.name,
            description: tt.description,
            price: Math.round(parseFloat(tt.price) * 100),
            quantityTotal: parseInt(tt.quantityTotal),
            maxPerOrder: parseInt(tt.maxPerOrder)
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to update event')

      toast.success('Event updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  // Calculate stats
  const totalRevenue = event?.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0
  const totalTicketsSold = event?.orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  ) || 0
  const totalCapacity = event?.ticketTypes.reduce((sum, tt) => sum + tt.quantityTotal, 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#A5BF13] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Manage Event
              </h1>
              <p className="text-gray-400 text-lg">
                Update event details, tickets, and view performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/events/${eventId}`}
                className="flex items-center gap-2 px-5 py-3 bg-[#292929] hover:bg-[#3a3a3a] text-white rounded-xl font-medium transition-all border border-[#404040] cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#404040]">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'text-[#A5BF13] border-b-2 border-[#A5BF13]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Event Details
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'text-[#A5BF13] border-b-2 border-[#A5BF13]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ticket Types
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'text-[#A5BF13] border-b-2 border-[#A5BF13]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="Taylor Swift | The Eras Tour"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="A brief tagline for your event"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors resize-none"
                      placeholder="Detailed description of your event"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      >
                        <option value="CONCERT">Concert</option>
                        <option value="SPORTS">Sports</option>
                        <option value="THEATER">Theater</option>
                        <option value="COMEDY">Comedy</option>
                        <option value="FESTIVAL">Festival</option>
                        <option value="CONFERENCE">Conference</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ON_SALE">On Sale</option>
                        <option value="SOLD_OUT">Sold Out</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-[#404040]">
                        <img
                          src={formData.imageUrl}
                          alt="Event preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Date & Time</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Venue Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={venue.name}
                      onChange={handleVenueChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="Madison Square Garden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={venue.address}
                      onChange={handleVenueChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={venue.city}
                        onChange={handleVenueChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={venue.state}
                        onChange={handleVenueChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={venue.zip}
                        onChange={handleVenueChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={venue.country}
                        onChange={handleVenueChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="USA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={venue.capacity}
                        onChange={handleVenueChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Policies</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age Restriction
                    </label>
                    <input
                      type="text"
                      name="ageRestriction"
                      value={formData.ageRestriction}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="All ages, 18+, 21+, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Refund Policy
                    </label>
                    <textarea
                      name="refundPolicy"
                      value={formData.refundPolicy}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors resize-none"
                      placeholder="Describe your refund policy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Orders</span>
                    <span className="text-lg font-bold text-white">{event?._count.orders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Revenue</span>
                    <span className="text-lg font-bold text-[#A5BF13]">
                      ${(totalRevenue / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Tickets Sold</span>
                    <span className="text-lg font-bold text-white">
                      {totalTicketsSold}/{totalCapacity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/events/${eventId}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-xl font-medium transition-all border border-[#404040] cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    View Public Page
                  </Link>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ticket Types</h2>
              <button
                onClick={addTicketType}
                className="flex items-center gap-2 px-4 py-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-xl font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Ticket Type
              </button>
            </div>

            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Ticket Type {index + 1}</h3>
                    {ticketTypes.length > 1 && (
                      <button
                        onClick={() => removeTicketType(index)}
                        className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ticket Name *
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="General Admission"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="Standing room access"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="99.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total Quantity *
                      </label>
                      <input
                        type="number"
                        value={ticket.quantityTotal}
                        onChange={(e) => handleTicketChange(index, 'quantityTotal', e.target.value)}
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="1000"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Per Order
                      </label>
                      <input
                        type="number"
                        value={ticket.maxPerOrder}
                        onChange={(e) => handleTicketChange(index, 'maxPerOrder', e.target.value)}
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#A5BF13]">
                    ${(totalRevenue / 100).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                  <DollarSign className="h-8 w-8 text-[#A5BF13]" />
                </div>
              </div>
            </div>

            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tickets Sold</p>
                  <p className="text-3xl font-bold text-white">
                    {totalTicketsSold}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">of {totalCapacity} total</p>
                </div>
                <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                  <Ticket className="h-8 w-8 text-[#A5BF13]" />
                </div>
              </div>
            </div>

            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-white">
                    {event?._count.orders || 0}
                  </p>
                </div>
                <div className="p-4 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                  <Users className="h-8 w-8 text-[#A5BF13]" />
                </div>
              </div>
            </div>

            {/* Ticket Breakdown */}
            <div className="lg:col-span-3 bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Ticket Type Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event?.ticketTypes.map((tt) => {
                  const soldPercentage = ((tt.quantityTotal - tt.quantityAvailable) / tt.quantityTotal * 100).toFixed(0)
                  return (
                    <div key={tt.id} className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-4">
                      <h4 className="font-bold text-white mb-2">{tt.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-medium">${(tt.price / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sold:</span>
                          <span className="text-white font-medium">
                            {tt.quantityTotal - tt.quantityAvailable}/{tt.quantityTotal}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-[#292929] rounded-full h-2">
                            <div
                              className="bg-[#A5BF13] h-2 rounded-full transition-all"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1 text-right">{soldPercentage}% sold</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

