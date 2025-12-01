'use client'

import { useState } from 'react'
import { Prisma } from '@prisma/client'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/app/store/cartStore'
import { toast } from 'react-hot-toast'

type TicketType = Prisma.TicketTypeGetPayload<{}>

interface TicketSelectorProps {
  ticketTypes: TicketType[]
  eventId: string
  eventTitle: string
}

export default function TicketSelector({ ticketTypes, eventId, eventTitle }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isAdding, setIsAdding] = useState(false)
  
  const { addItem } = useCartStore()

  const handleQuantityChange = (ticketId: string, delta: number) => {
    const ticket = ticketTypes.find(t => t.id === ticketId)
    if (!ticket) return
    
    setQuantities(prev => {
      const current = prev[ticketId] || 0
      const newVal = Math.max(0, current + delta)
      const maxAllowed = Math.min(ticket.maxPerOrder, ticket.quantityTotal - ticket.quantitySold - ticket.quantityHeld)
      
      if (newVal > maxAllowed) return prev
      
      return { ...prev, [ticketId]: newVal }
    })
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = ticketTypes.reduce((acc, ticket) => {
    return acc + (ticket.price * (quantities[ticket.id] || 0))
  }, 0)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    try {
      // Add each ticket type to cart
      Object.entries(quantities).forEach(([ticketTypeId, quantity]) => {
        if (quantity > 0) {
          const ticket = ticketTypes.find(t => t.id === ticketTypeId)
          if (ticket) {
            addItem({
              ticketTypeId: ticket.id,
              ticketTypeName: ticket.name,
              price: ticket.price,
              eventId,
              eventTitle,
              maxPerOrder: ticket.maxPerOrder,
            }, quantity)
          }
        }
      })
      
      // Reset quantities
      setQuantities({})
      
      // Show success message
      toast.success(`Added ${totalTickets} ticket(s) to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add tickets to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Tickets</h3>
      
      <div className="space-y-4 mb-6">
        {ticketTypes.map((ticket) => (
          <div key={ticket.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{ticket.name}</h4>
                <div className="text-blue-600 dark:text-blue-400 font-bold">
                  {formatPrice(ticket.price)}
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                <button 
                  onClick={() => handleQuantityChange(ticket.id, -1)}
                  disabled={!quantities[ticket.id]}
                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-medium text-gray-900 dark:text-white">
                  {quantities[ticket.id] || 0}
                </span>
                <button 
                  onClick={() => handleQuantityChange(ticket.id, 1)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {ticket.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={totalTickets === 0 || isAdding}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </span>
          ) : (
            <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add {totalTickets > 0 ? `${totalTickets} Tickets` : 'to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

