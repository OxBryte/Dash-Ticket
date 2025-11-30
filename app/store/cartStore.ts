import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  price: number // in cents
  eventId: string
  eventTitle: string
  maxPerOrder: number
}

interface CartStore {
  items: CartItem[]
  eventId: string | null
  expiresAt: number | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  updateQuantity: (ticketTypeId: string, quantity: number) => void
  removeItem: (ticketTypeId: string) => void
  clearCart: () => void
  
  // Computed
  getTotal: () => number
  getItemCount: () => number
  isExpired: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      eventId: null,
      expiresAt: null,

      addItem: (item, quantity) => {
        const state = get()
        
        // If adding item from different event, clear cart
        if (state.eventId && state.eventId !== item.eventId) {
          set({ 
            items: [], 
            eventId: item.eventId,
            expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
          })
        }
        
        // Check if item already exists
        const existingItem = state.items.find(i => i.ticketTypeId === item.ticketTypeId)
        
        if (existingItem) {
          // Update quantity
          const newQuantity = Math.min(existingItem.quantity + quantity, item.maxPerOrder)
          set({
            items: state.items.map(i =>
              i.ticketTypeId === item.ticketTypeId
                ? { ...i, quantity: newQuantity }
                : i
            ),
            expiresAt: Date.now() + 30 * 60 * 1000
          })
        } else {
          // Add new item
          set({
            items: [...state.items, { ...item, quantity }],
            eventId: item.eventId,
            expiresAt: Date.now() + 30 * 60 * 1000
          })
        }
      },

      updateQuantity: (ticketTypeId, quantity) => {
        const state = get()
        
        if (quantity <= 0) {
          // Remove item if quantity is 0
          set({
            items: state.items.filter(i => i.ticketTypeId !== ticketTypeId)
          })
        } else {
          set({
            items: state.items.map(i =>
              i.ticketTypeId === ticketTypeId
                ? { ...i, quantity: Math.min(quantity, i.maxPerOrder) }
                : i
            ),
            expiresAt: Date.now() + 30 * 60 * 1000
          })
        }
        
        // Clear eventId if no items left
        if (get().items.length === 0) {
          set({ eventId: null, expiresAt: null })
        }
      },

      removeItem: (ticketTypeId) => {
        const state = get()
        set({
          items: state.items.filter(i => i.ticketTypeId !== ticketTypeId)
        })
        
        // Clear eventId if no items left
        if (get().items.length === 0) {
          set({ eventId: null, expiresAt: null })
        }
      },

      clearCart: () => {
        set({ items: [], eventId: null, expiresAt: null })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      isExpired: () => {
        const expiresAt = get().expiresAt
        return expiresAt ? Date.now() > expiresAt : false
      }
    }),
    {
      name: 'ticket-cart-storage',
    }
  )
)

