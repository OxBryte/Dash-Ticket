import Link from 'next/link'
import { Ticket, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#292929] border-t border-[#404040] mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#A5BF13] blur-md opacity-50" />
                <Ticket className="h-8 w-8 text-[#A5BF13] relative z-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">TixHub</span>
                <span className="text-[10px] text-[#A5BF13] font-medium -mt-1">LIVE EVENTS</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experience unforgettable moments. Book tickets for the world's best concerts, festivals, sports, and events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=CONCERT" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Concerts
                </Link>
              </li>
              <li>
                <Link href="/events?category=SPORTS" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/events?category=FESTIVAL" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Festivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/orders" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-[#A5BF13]" />
                support@tixhub.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-[#A5BF13]" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-[#A5BF13] mt-0.5" />
                <span>123 Event Street<br />San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#404040] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} TixHub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-[#A5BF13] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
