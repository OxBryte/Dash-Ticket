'use client'

import { useState } from 'react'
import { Prisma } from '@prisma/client'
import { Minus, Plus, ShoppingCart, Ticket } from 'lucide-react'
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
    <div className="bg-[#292929] border border-[#404040] p-6 rounded-2xl shadow-xl sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="w-6 h-6 text-[#A5BF13]" />
        <h3 className="text-xl font-bold text-white">Select Tickets</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        {ticketTypes.map((ticket) => (
          <div key={ticket.id} className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-4 hover:border-[#A5BF13]/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{ticket.name}</h4>
                <div className="text-[#A5BF13] font-bold text-lg">
                  {formatPrice(ticket.price)}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#292929] rounded-lg px-2 py-2 border border-[#404040]">
                <button 
                  onClick={() => handleQuantityChange(ticket.id, -1)}
                  disabled={!quantities[ticket.id]}
                  className="p-1 text-gray-400 hover:text-[#A5BF13] disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-white">
                  {quantities[ticket.id] || 0}
                </span>
                <button 
                  onClick={() => handleQuantityChange(ticket.id, 1)}
                  className="p-1 text-gray-400 hover:text-[#A5BF13] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {ticket.description && (
              <p className="text-sm text-gray-400 leading-relaxed">{ticket.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#404040] pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total</span>
          <span className="text-2xl font-bold text-[#A5BF13]">{formatPrice(totalPrice)}</span>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={totalTickets === 0 || isAdding}
          className="w-full bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#A5BF13]/30"
        >
          {isAdding ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add {totalTickets > 0 ? `${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}` : 'to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
