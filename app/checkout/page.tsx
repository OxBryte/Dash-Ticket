'use client'

import { useState } from 'react'
import { useCartStore } from '@/app/store/cartStore'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, User, MapPin, ShoppingBag, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

const steps = [
  { id: 1, name: 'Review Cart', description: 'Review your tickets' },
  { id: 2, name: 'Contact Info', description: 'Your details' },
  { id: 3, name: 'Payment', description: 'Complete purchase' },
  { id: 4, name: 'Confirmation', description: 'Order confirmed' },
]

interface CheckoutFormData {
  email: string
  confirmEmail: string
  firstName: string
  lastName: string
  phone: string
  
  // Billing
  address: string
  city: string
  state: string
  zip: string
  country: string
  
  // Payment (in real app, use Stripe Elements)
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardName: string
  
  // Promo
  promoCode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    confirmEmail: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    promoCode: '',
  })
  
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)

  const subtotal = getTotal()
  const fees = Math.round(subtotal * 0.025 + 99) // 2.5% + $0.99
  const tax = Math.round((subtotal + fees) * 0.08) // 8% tax
  const total = subtotal - promoDiscount + fees + tax

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleApplyPromo = async () => {
    // Validate promo code via API
    try {
      const response = await fetch(`/api/promo-codes?code=${formData.promoCode}&eventId=${items[0]?.eventId}`)
      const result = await response.json()
      
      if (response.ok && result.valid) {
        // Calculate discount
        let discount = 0
        if (result.discountType === 'PERCENTAGE') {
          discount = Math.round(subtotal * (result.discountValue / 100))
        } else if (result.discountType === 'FIXED_AMOUNT') {
          discount = result.discountValue // Already in cents
        }
        
        setPromoDiscount(discount)
        setPromoApplied(true)
        toast.success(`Promo code applied! You saved ${formatPrice(discount)}`)
      } else {
        const message = result.error || 'Invalid promo code'
        toast.error(message)
      }
    } catch (error) {
      console.error('Promo code error:', error)
      toast.error('Failed to apply promo code')
    }
  }

  const validateStep = (step: number): boolean => {
    if (step === 2) {
      if (!formData.email || !formData.confirmEmail || !formData.firstName || !formData.lastName) {
        toast.error('Please fill in all required fields')
        return false
      }
      if (formData.email !== formData.confirmEmail) {
        toast.error('Email addresses do not match')
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address')
        return false
      }
    }
    
    if (step === 3) {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc || !formData.cardName) {
        toast.error('Please fill in all payment details')
        return false
      }
      if (!formData.address || !formData.city || !formData.state || !formData.zip) {
        toast.error('Please fill in billing address')
        return false
      }
    }
    
    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) return
    
    setIsProcessing(true)
    
    try {
      // API call to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            pricePerItem: item.price,
          })),
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          billingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
          promoCode: promoApplied ? formData.promoCode : null,
          itemsSubtotal: subtotal,
          discount: promoDiscount,
          fees,
          tax,
          totalAmount: total,
        }),
      })
      
      const order = await response.json()
      
      if (response.ok) {
        setOrderId(order.orderNumber)
        clearCart()
        setCurrentStep(4)
        toast.success('Order completed successfully!')
      } else {
        throw new Error(order.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && currentStep < 4) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] py-20">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-12">
            <ShoppingBag className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">
              Add some tickets to your cart before checking out
            </p>
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-6 py-3 rounded-xl font-bold transition-all"
            >
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#A5BF13]" />
            Checkout
          </h1>
          <p className="text-gray-400">Complete your purchase and get your tickets</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2
                    ${currentStep > step.id 
                      ? 'bg-[#A5BF13] border-[#A5BF13] text-[#292929]' 
                      : currentStep === step.id 
                      ? 'bg-[#A5BF13] bg-opacity-20 border-[#A5BF13] text-[#A5BF13]' 
                      : 'bg-[#292929] border-[#404040] text-gray-600'}
                  `}>
                    {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-white' : 'text-gray-600'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block mt-0.5">{step.description}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-[#A5BF13]' : 'bg-[#404040]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Review Cart */}
            {currentStep === 1 && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="w-6 h-6 text-[#A5BF13]" />
                  <h2 className="text-2xl font-bold text-white">Review Your Tickets</h2>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.ticketTypeId} className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-lg">{item.ticketTypeName}</h3>
                          <p className="text-sm text-gray-400 mt-1">{item.eventTitle}</p>
                          <p className="text-sm text-gray-500 mt-2">Quantity: <span className="text-[#A5BF13] font-medium">{item.quantity}</span></p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white text-lg">{formatPrice(item.price * item.quantity)}</div>
                          <div className="text-sm text-gray-500 mt-1">{formatPrice(item.price)} each</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30"
                  >
                    Continue to Contact Info
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-[#A5BF13]" />
                  <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Email *</label>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="Confirm your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2 px-6 py-3 border border-[#404040] text-white rounded-xl font-medium hover:bg-[#3a3a3a] transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-[#A5BF13]" />
                  <h2 className="text-2xl font-bold text-white">Payment Information</h2>
                </div>
                
                {/* Billing Address */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#A5BF13]" />
                    <h3 className="font-bold text-white">Billing Address</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-[#A5BF13]" />
                    <h3 className="font-bold text-white">Card Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">CVC *</label>
                        <input
                          type="text"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#404040] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#A5BF13] transition-colors"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2 px-6 py-3 border border-[#404040] text-white rounded-xl font-medium hover:bg-[#3a3a3a] transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    {!isProcessing && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="bg-[#292929] border border-[#404040] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-[#A5BF13] rounded-2xl flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                  <Check className="w-12 h-12 text-[#292929]" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">Order Confirmed!</h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Your tickets have been sent to <span className="text-[#A5BF13] font-medium">{formData.email}</span>
                </p>
                <div className="bg-[#1a1a1a] border border-[#404040] p-6 rounded-xl mb-8 max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-2">Order Number</p>
                  <p className="text-3xl font-bold text-[#A5BF13] font-mono">{orderId}</p>
                </div>
                <button
                  onClick={() => router.push('/events')}
                  className="inline-flex items-center gap-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#A5BF13]/30"
                >
                  Browse More Events
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.ticketTypeId} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.quantity}x {item.ticketTypeName}</span>
                    <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#404040] pt-4 space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-[#A5BF13]">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Service Fee</span>
                  <span className="text-white">{formatPrice(fees)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">{formatPrice(tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-[#404040] pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-[#A5BF13]">{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* Promo Code */}
              {currentStep < 4 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleInputChange}
                      disabled={promoApplied}
                      className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-gray-500 text-sm disabled:opacity-50 focus:outline-none focus:border-[#A5BF13] transition-colors"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !formData.promoCode}
                      className="px-5 py-2.5 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg text-sm font-bold disabled:opacity-50 transition-all"
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
