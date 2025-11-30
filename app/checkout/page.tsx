'use client'

import { useState } from 'react'
import { useCartStore } from '@/app/store/cartStore'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

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
        alert(`Promo code applied! You saved ${formatPrice(discount)}`)
      } else {
        alert(result.error || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Promo code error:', error)
      alert('Failed to apply promo code')
    }
  }

  const validateStep = (step: number): boolean => {
    if (step === 2) {
      if (!formData.email || !formData.confirmEmail || !formData.firstName || !formData.lastName) {
        alert('Please fill in all required fields')
        return false
      }
      if (formData.email !== formData.confirmEmail) {
        alert('Email addresses do not match')
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address')
        return false
      }
    }
    
    if (step === 3) {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc || !formData.cardName) {
        alert('Please fill in all payment details')
        return false
      }
      if (!formData.address || !formData.city || !formData.state || !formData.zip) {
        alert('Please fill in billing address')
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
      // Simulate API call to create order
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
      } else {
        throw new Error(order.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && currentStep < 4) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some tickets to your cart before checking out
          </p>
          <button
            onClick={() => router.push('/events')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep > step.id ? 'bg-green-500 text-white' : 
                      currentStep === step.id ? 'bg-blue-600 text-white' : 
                      'bg-gray-300 text-gray-600'}
                  `}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Review Your Tickets</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.ticketTypeId} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.ticketTypeName}</h3>
                          <p className="text-sm text-gray-500">{item.eventTitle}</p>
                          <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatPrice(item.price * item.quantity)}</div>
                          <div className="text-sm text-gray-500">{formatPrice(item.price)} each</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Continue to Contact Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Email *</label>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                
                {/* Billing Address */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="font-semibold mb-4">Card Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CVC *</label>
                        <input
                          type="text"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your tickets have been sent to {formData.email}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                  <p className="text-2xl font-bold text-blue-600">{orderId}</p>
                </div>
                <button
                  onClick={() => router.push('/events')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                >
                  Browse More Events
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.ticketTypeId} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.ticketTypeName}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatPrice(fees)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* Promo Code */}
              {currentStep < 4 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleInputChange}
                      disabled={promoApplied}
                      className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm disabled:opacity-50"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !formData.promoCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
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

