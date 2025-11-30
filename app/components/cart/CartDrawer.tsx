'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/app/store/cartStore'
import { ShoppingCart, X, Minus, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'

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
        className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <ShoppingCart className="h-6 w-6" />
        {mounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Drawer panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Shopping Cart
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Timer */}
                  {timeLeft && items.length > 0 && (
                    <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b dark:border-gray-800">
                      <div className="flex items-center text-yellow-800 dark:text-yellow-200 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Time remaining: <strong>{timeLeft}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.ticketTypeId}
                            className="border dark:border-gray-800 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {item.ticketTypeName}
                                </h3>
                                <p className="text-sm text-gray-500">{item.eventTitle}</p>
                              </div>
                              <button
                                onClick={() => removeItem(item.ticketTypeId)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                                  className="p-1 text-gray-500 hover:text-blue-600"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                                  disabled={item.quantity >= item.maxPerOrder}
                                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  {formatPrice(item.price)} each
                                </div>
                                <div className="font-bold text-gray-900 dark:text-white">
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
                    <div className="border-t dark:border-gray-800 p-6 space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      
                      <Link
                        href="/checkout"
                        onClick={() => setIsOpen(false)}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Proceed to Checkout
                      </Link>
                      
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to clear your cart?')) {
                            clearCart()
                          }
                        }}
                        className="block w-full text-red-600 hover:text-red-700 text-center text-sm"
                      >
                        Clear Cart
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

