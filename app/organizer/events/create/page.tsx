'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, Ticket, Plus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TicketTypeForm {
  id: string
  name: string
  description: string
  price: string
  quantityTotal: string
  maxPerOrder: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'OTHER',
    status: 'ON_SALE',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'America/New_York',
    ageRestriction: 'ALL_AGES',
    
    // Venue (simplified - in production would have venue search/create)
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    venueCapacity: '',
    
    // Policies
    refundPolicy: '',
    
    // Images (in production would handle file uploads)
    imageUrl: '',
  })

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      id: '1',
      name: 'General Admission',
      description: '',
      price: '',
      quantityTotal: '',
      maxPerOrder: '10'
    }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTicketTypeChange = (id: string, field: string, value: string) => {
    setTicketTypes(ticketTypes.map(tt => 
      tt.id === id ? { ...tt, [field]: value } : tt
    ))
  }

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        quantityTotal: '',
        maxPerOrder: '10'
      }
    ])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(tt => tt.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.startDate || !formData.startTime) {
        toast.error('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Combine date and time - validate before creating Date
      if (!formData.startDate || !formData.startTime) {
        toast.error('Please select both start date and time')
        setIsSubmitting(false)
        return
      }
      
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      
      // Validate the date is valid
      if (isNaN(startDateTime.getTime())) {
        toast.error('Invalid start date/time')
        setIsSubmitting(false)
        return
      }
      
      const endDateTime = formData.endDate && formData.endTime 
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : null
        
      // Validate end date if provided
      if (endDateTime && isNaN(endDateTime.getTime())) {
        toast.error('Invalid end date/time')
        setIsSubmitting(false)
        return
      }

      // In production, would handle venue creation/selection properly
      // For now, creating inline
      const eventData = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        category: formData.category,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString(),
        timezone: formData.timezone,
        ageRestriction: formData.ageRestriction,
        refundPolicy: formData.refundPolicy,
        imageUrl: formData.imageUrl || null,
        status: formData.status || 'ON_SALE',
        venue: {
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.venueCity,
          state: formData.venueState,
          zip: formData.venueZip,
          capacity: parseInt(formData.venueCapacity) || 0,
          country: 'USA'
        },
        ticketTypes: ticketTypes.map(tt => ({
          name: tt.name,
          description: tt.description,
          price: Math.round(parseFloat(tt.price) * 100), // Convert to cents
          quantityTotal: parseInt(tt.quantityTotal),
          maxPerOrder: parseInt(tt.maxPerOrder)
        }))
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Event created successfully!')
        router.push(`/events/${result.id}`)
      } else {
        throw new Error(result.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Event creation error:', error)
      toast.error('Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief tagline for listings"
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  >
                    <option value="CONCERT">Concert</option>
                    <option value="SPORTS">Sports</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="FESTIVAL">Festival</option>
                    <option value="THEATER">Theater</option>
                    <option value="COMEDY">Comedy</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Age Restriction</label>
                  <select
                    name="ageRestriction"
                    value={formData.ageRestriction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  >
                    <option value="ALL_AGES">All Ages</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Event Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  >
                    <option value="ON_SALE">On Sale (Published)</option>
                    <option value="DRAFT">Draft (Not Published)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.status === 'DRAFT' 
                      ? 'Event will be saved but not visible to customers'
                      : 'Event will be immediately visible in the events list'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                    placeholder="https://your-image-url.com/image.jpg"
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Venue Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Venue Name *</label>
                <input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  name="venueAddress"
                  value={formData.venueAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="venueCity"
                    value={formData.venueCity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="venueState"
                    value={formData.venueState}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP *</label>
                  <input
                    type="text"
                    name="venueZip"
                    value={formData.venueZip}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Venue Capacity *</label>
                <input
                  type="number"
                  name="venueCapacity"
                  value={formData.venueCapacity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Ticket className="w-5 h-5 mr-2" />
                Ticket Types
              </h2>
              <button
                type="button"
                onClick={addTicketType}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Ticket Type
              </button>
            </div>

            <div className="space-y-6">
              {ticketTypes.map((ticket, index) => (
                <div key={ticket.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Ticket Type #{index + 1}</h3>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticket.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Ticket Name *</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'name', e.target.value)}
                        placeholder="Ticket type name"
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'description', e.target.value)}
                        placeholder="Optional description"
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="50.00"
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={ticket.quantityTotal}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'quantityTotal', e.target.value)}
                        min="1"
                        placeholder="Quantity"
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Per Order</label>
                      <input
                        type="number"
                        value={ticket.maxPerOrder}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'maxPerOrder', e.target.value)}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

