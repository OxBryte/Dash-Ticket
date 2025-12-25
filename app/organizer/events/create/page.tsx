'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, DollarSign, Ticket, Plus, X, Sparkles, Clock, Image as ImageIcon, Upload, Trash2 } from 'lucide-react'
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [useImageUrl, setUseImageUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedImage(data.imageUrl)
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        toast.success('Image uploaded to Cloudinary successfully!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const clearUploadedImage = () => {
    setUploadedImage(null)
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedImage(data.url)
        setFormData({ ...formData, imageUrl: data.url })
        toast.success('Image uploaded successfully!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setFormData({ ...formData, imageUrl: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-[#A5BF13]" />
            <h1 className="text-4xl font-bold text-white">Create New Event</h1>
          </div>
          <p className="text-gray-400 text-lg">Fill in the details to create your event and start selling tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-[#A5BF13]" />
              <h2 className="text-2xl font-bold text-white">Event Details</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  placeholder="Taylor Swift: The Eras Tour"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief tagline for listings (optional)"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe your event in detail..."
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Restriction</label>
                  <select
                    name="ageRestriction"
                    value={formData.ageRestriction}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                  >
                    <option value="ALL_AGES">All Ages</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                  >
                    <option value="ON_SALE">On Sale (Published)</option>
                    <option value="DRAFT">Draft (Not Published)</option>
                  </select>
                </div>
              </div>

              {formData.status && (
                <div className={`p-4 rounded-xl border ${
                  formData.status === 'DRAFT' 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : 'bg-[#A5BF13]/10 border-[#A5BF13]/30'
                }`}>
                  <p className={`text-sm font-medium ${
                    formData.status === 'DRAFT' ? 'text-yellow-400' : 'text-[#A5BF13]'
                  }`}>
                    {formData.status === 'DRAFT' 
                      ? '📝 Event will be saved but not visible to customers'
                      : '✅ Event will be immediately visible in the events list'}
                  </p>
                </div>
              )}

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#A5BF13]" />
                  Event Image
                </label>

                {/* Toggle between upload and URL */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUseImageUrl(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useImageUrl
                        ? 'bg-[#A5BF13] text-[#292929]'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#404040]'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseImageUrl(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useImageUrl
                        ? 'bg-[#A5BF13] text-[#292929]'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#404040]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Use Image URL
                  </button>
                </div>

                {!useImageUrl ? (
                  /* Upload Area */
                  <div>
                    {!uploadedImage ? (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#404040] rounded-xl p-12 text-center cursor-pointer hover:border-[#A5BF13] transition-all bg-[#1a1a1a] hover:bg-[#1a1a1a]/50"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <svg className="animate-spin h-12 w-12 text-[#A5BF13] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-white font-medium">Uploading...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-white font-medium mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-400">
                              PNG, JPG, GIF, WebP up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Preview uploaded image */
                      <div className="relative rounded-xl overflow-hidden border border-[#404040]">
                        <img
                          src={uploadedImage}
                          alt="Event preview"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearUploadedImage}
                          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Input */
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-image-url.com/image.jpg"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Time (Optional)</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white focus:outline-none focus:border-[#A5BF13] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#A5BF13]" />
              <h2 className="text-2xl font-bold text-white">Venue Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name *</label>
                <input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  placeholder="Madison Square Garden"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                <input
                  type="text"
                  name="venueAddress"
                  value={formData.venueAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="venueCity"
                    value={formData.venueCity}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                  <input
                    type="text"
                    name="venueState"
                    value={formData.venueState}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ZIP *</label>
                  <input
                    type="text"
                    name="venueZip"
                    value={formData.venueZip}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue Capacity *</label>
                <input
                  type="number"
                  name="venueCapacity"
                  value={formData.venueCapacity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="5000"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-[#A5BF13]" />
                <h2 className="text-2xl font-bold text-white">Ticket Types</h2>
              </div>
              <button
                type="button"
                onClick={addTicketType}
                className="flex items-center gap-2 px-4 py-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Ticket Type
              </button>
            </div>

            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={ticket.id} className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-6 hover:border-[#A5BF13]/50 transition-all">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-white text-lg">Ticket Type #{index + 1}</h3>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticket.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-[#292929] p-2 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Name *</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'name', e.target.value)}
                        placeholder="VIP, General Admission, Early Bird, etc."
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'description', e.target.value)}
                        placeholder="What's included in this ticket?"
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#A5BF13]" />
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="50.00"
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Quantity *</label>
                      <input
                        type="number"
                        value={ticket.quantityTotal}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'quantityTotal', e.target.value)}
                        min="1"
                        placeholder="100"
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Per Order</label>
                      <input
                        type="number"
                        value={ticket.maxPerOrder}
                        onChange={(e) => handleTicketTypeChange(ticket.id, 'maxPerOrder', e.target.value)}
                        min="1"
                        max="50"
                        placeholder="10"
                        className="w-full px-4 py-3 bg-[#292929] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-[#404040] text-white rounded-xl font-medium hover:bg-[#3a3a3a] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-[#A5BF13]/30"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Event...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
