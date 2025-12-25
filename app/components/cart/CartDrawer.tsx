"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/app/store/cartStore";
import { ShoppingCart, X, Minus, Plus, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const {
    items,
    getTotal,
    getItemCount,
    updateQuantity,
    removeItem,
    clearCart,
    expiresAt,
    isExpired,
  } = useCartStore();

  // Prevent hydration mismatch by only rendering cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = getItemCount();
  const total = getTotal();

  // Timer countdown
  useEffect(() => {
    if (!expiresAt || isExpired()) {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setTimeLeft("Expired");
        clearCart();
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, clearCart]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const handleOpenCart = () => {
    console.log("Cart button clicked!");
    setIsOpen(true);
  };

  const handleCloseCart = () => {
    console.log("Closing cart");
    setIsOpen(false);
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={handleOpenCart}
        className="relative inline-flex items-center justify-center rounded-lg border border-[#404040] bg-[#292929] px-3 py-2 text-white hover:border-[#A5BF13] transition-all"
        type="button"
      >
        <ShoppingCart className="h-5 w-5" />
        {mounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#A5BF13] text-[#292929] text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-[#A5BF13]/50">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] overflow-hidden h-[100vh]"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
              onClick={handleCloseCart}
              style={{ opacity: isOpen ? 1 : 0 }}
            />

            {/* Drawer panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pointer-events-none">
              <div
                className="w-screen max-w-lg pointer-events-auto transform transition-transform duration-300 ease-in-out"
                style={{
                  transform: isOpen ? "translateX(0)" : "translateX(100%)",
                }}
              >
                <div className="h-full flex flex-col bg-[#292929] border-l border-[#404040] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#404040]">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        Your Tickets
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Reserved for {timeLeft || "a limited time"}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseCart}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#404040] text-gray-400 hover:bg-[#3a3a3a] hover:text-white transition-all"
                      type="button"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Timer */}
                  {timeLeft && items.length > 0 && (
                    <div className="px-6 py-3 bg-gradient-to-r from-[#A5BF13]/10 to-transparent border-b border-[#404040]">
                      <div className="inline-flex items-center rounded-full bg-[#1a1a1a] px-4 py-2 text-xs font-bold text-[#A5BF13] border border-[#A5BF13]/30">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="mr-1.5">Time remaining:</span>
                        <span className="font-bold">{timeLeft}</span>
                      </div>
                    </div>
                  )}

                  {/* Cart items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[#404040] bg-[#1a1a1a]">
                        <ShoppingCart className="h-16 w-16 text-gray-600 mb-4" />
                        <p className="text-base text-white font-medium mb-1">
                          Your cart is empty
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                          Browse events and add tickets to get started
                        </p>
                        <Link
                          href="/events"
                          onClick={handleCloseCart}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#A5BF13] hover:bg-[#8a9f10] px-6 py-3 text-sm font-bold text-[#292929] transition-all"
                        >
                          Find Events
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.ticketTypeId}
                            className="rounded-xl border border-[#404040] bg-[#1a1a1a] p-5 hover:border-[#A5BF13]/50 transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-white">
                                  {item.ticketTypeName}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {item.eventTitle}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item.ticketTypeId)}
                                className="text-gray-500 hover:text-red-400 hover:bg-[#292929] rounded-lg p-1.5 transition-all"
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-[#292929] rounded-lg px-2 py-2 border border-[#404040]">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.ticketTypeId,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-1 text-gray-400 hover:text-[#A5BF13] transition-colors"
                                  type="button"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.ticketTypeId,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={item.quantity >= item.maxPerOrder}
                                  className="p-1 text-gray-400 hover:text-[#A5BF13] disabled:opacity-30 transition-colors"
                                  type="button"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {formatPrice(item.price)} each
                                </div>
                                <div className="font-bold text-white mt-0.5">
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
                    <div className="border-t border-[#404040] px-6 py-6 space-y-4 bg-[#292929]">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Items</span>
                        <span className="text-white font-medium">
                          {itemCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xl font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-[#A5BF13]">
                          {formatPrice(total)}
                        </span>
                      </div>

                      <Link
                        href="/checkout"
                        onClick={handleCloseCart}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#A5BF13] hover:bg-[#8a9f10] py-3.5 text-center text-sm font-bold text-[#292929] shadow-lg shadow-[#A5BF13]/30 transition-all"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to clear your cart?"
                            )
                          ) {
                            clearCart();
                          }
                        }}
                        className="block w-full text-center text-xs font-medium text-gray-500 hover:text-red-400 transition-colors"
                        type="button"
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
  );
}
