import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import crypto from 'crypto'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TKT-${timestamp}-${random}`
}

function generateTicketNumber(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase()
}

function generateQRCode(ticketId: string): string {
  // In production, use a proper QR code library
  return crypto.createHash('sha256').update(ticketId + Date.now()).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      billingAddress,
      promoCode,
      itemsSubtotal,
      discount,
      fees,
      tax,
      totalAmount,
    } = body

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Get event ID from first item
    const firstTicketType = await prisma.ticketType.findUnique({
      where: { id: items[0].ticketTypeId },
      include: { event: true }
    })

    if (!firstTicketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 })
    }

    const eventId = firstTicketType.eventId

    // Validate inventory availability
    for (const item of items) {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: item.ticketTypeId }
      })

      if (!ticketType) {
        return NextResponse.json({ error: `Ticket type ${item.ticketTypeId} not found` }, { status: 404 })
      }

      const available = ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityHeld
      if (available < item.quantity) {
        return NextResponse.json({ 
          error: `Not enough tickets available for ${ticketType.name}` 
        }, { status: 400 })
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          eventId,
          status: 'COMPLETED',
          itemsSubtotal,
          discount,
          fees,
          tax,
          totalAmount,
          customerEmail,
          customerName,
          customerPhone: customerPhone || null,
          billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
          promoCode: promoCode || null,
          items: {
            create: items.map((item: any) => ({
              ticketTypeId: item.ticketTypeId,
              quantity: item.quantity,
              pricePerItem: item.pricePerItem,
              subtotal: item.quantity * item.pricePerItem,
            }))
          }
        },
        include: {
          items: {
            include: {
              ticketType: true
            }
          },
          event: true
        }
      })

      // Update ticket type quantities
      for (const item of items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            quantitySold: {
              increment: item.quantity
            }
          }
        })
      }

      // Generate individual tickets
      const tickets = []
      for (const orderItem of newOrder.items) {
        for (let i = 0; i < orderItem.quantity; i++) {
          const ticketNumber = generateTicketNumber()
          const ticket = await tx.ticket.create({
            data: {
              orderId: newOrder.id,
              ticketNumber,
              qrCode: generateQRCode(ticketNumber),
              ticketType: orderItem.ticketType.name,
              eventTitle: newOrder.event.title,
              eventDate: newOrder.event.startDate,
              attendeeEmail: customerEmail,
              attendeeName: customerName,
              status: 'VALID'
            }
          })
          tickets.push(ticket)
        }
      }

      return { ...newOrder, tickets }
    })

    // In production, send email with tickets here

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      tickets: order.tickets
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              ticketType: true
            }
          },
          event: {
            include: {
              venue: true
            }
          },
          tickets: true
        }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json(order)
    }

    if (email) {
      const orders = await prisma.order.findMany({
        where: { customerEmail: email },
        include: {
          event: true,
          items: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(orders)
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

