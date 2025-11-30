# Ticketing Platform - Complete Event Management System

A comprehensive, enterprise-grade ticketing platform built with **Next.js 16**, **Prisma**, **SQLite**, **Tailwind CSS**, and **Zustand**. This platform enables event organizers to create, manage, and sell tickets while providing attendees with a seamless purchase experience.

## 🚀 Features Implemented

### ✅ **Core Event Management**
- **Event Browsing**: Browse all events with responsive grid layout
- **Event Details**: Comprehensive event pages with venue info, dates, and ticket options
- **Event Creation**: Full-featured form for organizers to create events with custom ticket types
- **Event Categories**: CONCERT, SPORTS, CONFERENCE, FESTIVAL, THEATER, COMEDY, OTHER
- **Event Status Management**: DRAFT, PENDING_APPROVAL, SCHEDULED, ON_SALE, PAUSED, SOLD_OUT, ENDED, CANCELLED, POSTPONED

### 🛒 **Shopping Cart System**
- **Persistent Cart**: Zustand-based state management with localStorage persistence
- **30-Minute Timer**: Automatic cart expiration with countdown display
- **Cart Drawer**: Slide-out cart interface with item management
- **Quantity Controls**: Adjust ticket quantities with validation
- **Single Event Rule**: Cart restricted to one event at a time (prevents mixing)
- **Real-time Total**: Dynamic price calculation

### 💳 **Checkout Flow**
- **Multi-Step Process**: 
  1. Review Cart
  2. Contact Information
  3. Payment & Billing
  4. Confirmation
- **Guest Checkout**: No account required to purchase
- **Form Validation**: Email confirmation, required field checks
- **Promo Codes**: Apply discount codes during checkout
- **Order Summary**: Real-time price breakdown (subtotal, fees, tax, total)
- **Payment Processing**: Simulated payment flow (ready for Stripe integration)

### 🎫 **Order Management**
- **Order Tracking**: Search by order number or email address
- **Order Details**: View complete order history with ticket information
- **Ticket Generation**: Unique ticket numbers and QR codes for each ticket
- **Order Status**: PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED
- **PDF Downloads**: Placeholder for downloadable ticket PDFs

### 🔍 **Advanced Search & Filters**
- **Text Search**: Search events by title, description, venue
- **Category Filters**: Quick filter buttons for event categories
- **Date Range**: Filter by start/end dates
- **Price Range**: Min/max price filtering
- **City Filter**: Location-based search
- **Sorting**: Date (asc/desc), Name (A-Z, Z-A)
- **Real-time Results**: Dynamic event list updates

### 🎟️ **Ticket Type Management**
- **Multiple Ticket Types**: General Admission, VIP, Early Bird, etc.
- **Flexible Pricing**: Per-ticket pricing in cents
- **Quantity Controls**: Set total quantity and max per order
- **Inventory Tracking**: Real-time sold/held/available counts
- **Seat Type Options**: General, Reserved, Section-based (schema ready)

### 🏢 **Organizer Dashboard**
- **Event Creation Form**: Comprehensive form with:
  - Basic event details (title, description, category)
  - Date/time management with timezone support
  - Venue information (name, address, capacity)
  - Multiple ticket type configuration
  - Age restrictions and policies
- **Event Listing**: View all created events
- **Draft Management**: Save events as drafts before publishing

### 🎁 **Promo Code System**
- **Code Creation API**: Create discount codes
- **Discount Types**: 
  - Percentage-based (e.g., 10% off)
  - Fixed amount (e.g., $5 off)
- **Usage Limits**: Per-code and per-customer limits
- **Date Validity**: Set start and end dates
- **Event-Specific**: Apply to specific events or all events
- **Minimum Purchase**: Set minimum order requirements
- **Real-time Validation**: API-based code verification

### 🗄️ **Database Schema**
- **Users**: Organizers, Attendees, Admins, Staff
- **Events**: Full event data with relationships
- **Venues**: Reusable venue records
- **Ticket Types**: Multiple types per event
- **Orders**: Complete order history
- **Order Items**: Line items with snapshots
- **Tickets**: Individual tickets with QR codes
- **Promo Codes**: Discount code management
- **Auth Tables**: NextAuth-ready (Account, Session, VerificationToken)

## 📊 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Prisma 5** | ORM for database management |
| **SQLite** | Lightweight database (production-ready for Postgres) |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | State management for cart |
| **Lucide React** | Beautiful icon system |
| **date-fns** | Date formatting and manipulation |
| **React Hook Form** | Form handling (ready to integrate) |
| **Zod** | Schema validation (installed) |
| **NextAuth** | Authentication (installed, ready to configure) |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Set environment variable
export DATABASE_URL="file:./dev.db"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
ticketing-app/
├── app/
│   ├── api/                      # API Routes
│   │   ├── events/
│   │   │   ├── search/           # Event search endpoint
│   │   │   └── route.ts          # Event CRUD
│   │   ├── orders/
│   │   │   └── route.ts          # Order creation & retrieval
│   │   └── promo-codes/
│   │       └── route.ts          # Promo code validation
│   ├── checkout/
│   │   └── page.tsx              # Multi-step checkout
│   ├── components/
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx    # Shopping cart UI
│   │   ├── events/
│   │   │   ├── EventCard.tsx     # Event display card
│   │   │   └── TicketSelector.tsx # Ticket selection widget
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── events/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Event detail page
│   │   └── page.tsx              # Event listing with search
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   └── utils.ts              # Utility functions
│   ├── orders/
│   │   └── page.tsx              # Order tracking
│   ├── organizer/
│   │   └── events/
│   │       └── create/
│   │           └── page.tsx      # Event creation form
│   ├── store/
│   │   └── cartStore.ts          # Zustand cart store
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── providers.tsx             # React Query provider
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Key User Flows

### 1. **Attendee Purchase Flow**
1. Browse events on homepage or `/events`
2. Use search/filters to find desired event
3. Click event card to view details
4. Select ticket types and quantities
5. Add to cart (view cart drawer)
6. Proceed to checkout
7. Enter contact information
8. Enter billing and payment details
9. Apply promo code (optional)
10. Review and complete purchase
11. Receive order confirmation with tickets

### 2. **Organizer Event Creation Flow**
1. Navigate to `/organizer/events/create`
2. Fill in event details (title, description, category)
3. Set date, time, and timezone
4. Add venue information
5. Create multiple ticket types with pricing
6. Set quantity limits and restrictions
7. Add policies (refund, age restrictions)
8. Save as draft or publish
9. Event appears in listings when status is ON_SALE

### 3. **Order Tracking Flow**
1. Navigate to `/orders`
2. Enter order number OR email address
3. View order details and ticket information
4. Download tickets (QR codes)
5. Check ticket status (VALID, USED, CANCELLED)

## 🔌 API Endpoints

### Events API
- `GET /api/events/search` - Search and filter events
  - Query params: `q`, `category`, `city`, `startDate`, `endDate`, `minPrice`, `maxPrice`, `sortBy`
- `POST /api/events` - Create new event (organizers)
- `GET /api/events` - List events (with filters)

### Orders API
- `POST /api/orders` - Create new order
  - Body: items, customer info, billing, payment
- `GET /api/orders?orderNumber={number}` - Get order by number
- `GET /api/orders?email={email}` - Get orders by email

### Promo Codes API
- `GET /api/promo-codes?code={code}&eventId={id}` - Validate promo code
- `POST /api/promo-codes` - Create promo code (organizers)

## 💾 Database Models

```prisma
- User (organizers, attendees)
- Venue (reusable venues)
- Event (main event data)
- TicketType (multiple per event)
- Order (purchase records)
- OrderItem (line items)
- Ticket (individual tickets with QR)
- PromoCode (discount codes)
- Account, Session, VerificationToken (NextAuth)
```

## 🎨 Features from PRD Implemented

✅ Event Management System
  - Event creation & configuration
  - Venue management
  - Date & time handling
  - Event statuses & lifecycle

✅ Ticket Sales & Distribution
  - Event discovery & search
  - Event detail pages
  - Ticket selection
  - Shopping cart

✅ Checkout Process
  - Multi-step flow
  - Guest checkout
  - Payment info collection
  - Order confirmation

✅ Order Management
  - Order tracking
  - Ticket generation
  - QR code support

✅ Promo Codes
  - Code validation
  - Discount application
  - Usage tracking

✅ Search & Filters
  - Text search
  - Category filters
  - Date/price ranges
  - Sort options

## 🚧 Ready for Production Enhancements

### Authentication (Installed, Not Configured)
- NextAuth.js installed
- Auth schema tables created
- Ready for provider configuration (Google, GitHub, Email)

### Payment Processing
- Stripe/PayPal integration points identified
- Ready for payment gateway SDK
- Webhook handlers stubbed

### Reserved Seating
- Schema includes seat type fields
- UI ready for seat map integration
- Can add SVG-based seat maps

### Email Notifications
- Order confirmation emails
- Ticket delivery
- Event reminders
- Ready for SendGrid/Postmark integration

### Image Uploads
- Currently uses URL input
- Ready for S3/Cloudinary integration
- Event gallery support in schema

### Advanced Analytics
- Event views tracking
- Conversion funnels
- Revenue reports
- Attendee demographics

## 🔐 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"

# For production with Postgres:
# DATABASE_URL="postgresql://user:password@localhost:5432/ticketing"

# NextAuth (when configured)
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key"

# Payment (when configured)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (when configured)
# SENDGRID_API_KEY="SG..."
```

## 📝 Sample Data

The seed script creates:
- 1 Organizer user (organizer@example.com)
- 2 Venues (The Grand Hall, Sunset Amphitheater)
- 2 Events (Summer Music Festival, Tech Conference 2025)
- 4 Ticket Types (General Admission, VIP, Early Bird, Regular)

## 🧪 Testing Promo Codes

Test promo code validation:
1. Go to checkout with items in cart
2. In promo code field, you can test the API by creating codes via POST `/api/promo-codes`
3. Example code format: `SAVE10` for 10% off

## 📈 Performance Considerations

- **Database Indexing**: Key fields indexed (email, orderNumber, code)
- **Eager Loading**: Strategic use of Prisma `include` for relations
- **Client-Side State**: Cart stored in Zustand + localStorage
- **API Optimization**: Efficient queries with proper WHERE clauses
- **Image Optimization**: Ready for Next.js Image component

## 🎭 Future Enhancements (From PRD)

- [ ] User authentication with roles (ADMIN, ORGANIZER, ATTENDEE, STAFF)
- [ ] Interactive seat map for reserved seating events
- [ ] Waitlist management for sold-out events
- [ ] Transfer/resell ticket functionality
- [ ] QR code scanning app for entry validation
- [ ] Organizer analytics dashboard
- [ ] Multi-day/recurring event support
- [ ] Dynamic pricing algorithms
- [ ] Mobile-responsive PWA features
- [ ] Social sharing and invites

## 📄 License

This project is part of a coding assessment. All rights reserved.

## 🤝 Contributing

This is a demonstration project. For production use, additional security hardening, testing, and compliance measures would be required.

---

**Built with ❤️ using Next.js, Prisma, and Modern Web Technologies**
