'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/app/store/cartStore'
import { ShoppingCart, X, Minus, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  
  const { items, getTotal, getItemCount, updateQuantity, removeItem, clearCart, expiresAt, isExpired } = useCartStore()
  
  // Prevent hydration mismatch by only rendering cart count after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const itemCount = getItemCount()
  const total = getTotal()

  // Timer countdown
  useEffect(() => {
    if (!expiresAt || isExpired()) {
      setTimeLeft('')
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = expiresAt - now
      
      if (remaining <= 0) {
        setTimeLeft('Expired')
        clearCart()
        clearInterval(interval)
      } else {
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, isExpired, clearCart])

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <>
      {/* Cart Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center justify-center rounded-full border border-gray-200/70 bg-white/80 px-3 py-2 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-100"
      >
        <ShoppingCart className="h-5 w-5" />
        {mounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Drawer panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-lg">
                <div className="h-full flex flex-col bg-slate-950 text-slate-50 shadow-2xl border-l border-slate-800">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        Your tickets
                      </h2>
                      <p className="text-xs text-slate-400">
                        Tickets are reserved for {timeLeft || 'a limited time'}.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Timer */}
                  {timeLeft && items.length > 0 && (
                    <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-800">
                      <div className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-500/40">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        <span className="mr-1">Time remaining:</span>
                        <span className="font-semibold text-amber-300">{timeLeft}</span>
                      </div>
                    </div>
                  )}

                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60">
                        <ShoppingCart className="h-10 w-10 text-slate-500 mb-3" />
                        <p className="text-sm text-slate-300 font-medium">Your cart is empty</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Browse events and add tickets to get started.
                        </p>
                        <Link
                          href="/events"
                          onClick={() => setIsOpen(false)}
                          className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          Find events
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.ticketTypeId}
                            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-50">
                                  {item.ticketTypeName}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {item.eventTitle}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item.ticketTypeId)}
                                className="text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-full p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 bg-slate-800/80 rounded-full px-1 py-1">
                                <button
                                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                                  className="p-1.5 text-slate-300 hover:text-blue-400"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-slate-50">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                                  disabled={item.quantity >= item.maxPerOrder}
                                  className="p-1.5 text-slate-300 hover:text-blue-400 disabled:opacity-30"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xs text-slate-400">
                                  {formatPrice(item.price)} each
                                </div>
                                <div className="font-semibold text-slate-50">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {items.length > 0 && (
                    <div className="border-t border-slate-800 px-6 py-4 space-y-4 bg-slate-950/95">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Items</span>
                        <span>{itemCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      
                      <Link
                        href="/checkout"
                        onClick={() => setIsOpen(false)}
                        className="block w-full rounded-full bg-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                      >
                        Proceed to checkout
                      </Link>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to clear your cart?')) {
                            clearCart()
                          }
                        }}
                        className="block w-full text-center text-xs font-medium text-slate-400 hover:text-red-400"
                      >
                        Clear cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

