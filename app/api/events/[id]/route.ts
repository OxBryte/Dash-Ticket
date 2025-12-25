import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        venue: true,
        ticketTypes: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          where: { status: 'COMPLETED' },
          select: {
            totalAmount: true,
            items: {
              select: {
                quantity: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      shortDescription,
      description,
      category,
      status,
      startDate,
      endDate,
      timezone,
      ageRestriction,
      refundPolicy,
      imageUrl,
      venue,
      ticketTypes
    } = body

    // Verify user owns this event
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { organizerId: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update event with venue and ticket types in transaction
    const event = await prisma.$transaction(async (tx) => {
      // Update venue
      await tx.venue.update({
        where: { id: venue.id },
        data: {
          name: venue.name,
          address: venue.address,
          city: venue.city,
          state: venue.state,
          zip: venue.zip,
          country: venue.country,
          capacity: venue.capacity
        }
      })

      // Update ticket types
      for (const tt of ticketTypes) {
        if (tt.id) {
          // Update existing ticket type
          await tx.ticketType.update({
            where: { id: tt.id },
            data: {
              name: tt.name,
              description: tt.description || null,
              price: tt.price,
              quantityTotal: tt.quantityTotal,
              maxPerOrder: tt.maxPerOrder
            }
          })
        } else {
          // Create new ticket type
          await tx.ticketType.create({
            data: {
              name: tt.name,
              description: tt.description || null,
              price: tt.price,
              quantityTotal: tt.quantityTotal,
              quantityAvailable: tt.quantityTotal,
              maxPerOrder: tt.maxPerOrder,
              sortOrder: ticketTypes.indexOf(tt),
              eventId: params.id
            }
          })
        }
      }

      // Update event
      const updatedEvent = await tx.event.update({
        where: { id: params.id },
        data: {
          title,
          shortDescription: shortDescription || null,
          description,
          category: category || 'OTHER',
          status: status || 'DRAFT',
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          timezone: timezone || 'America/New_York',
          ageRestriction: ageRestriction || null,
          refundPolicy: refundPolicy || null,
          imageUrl: imageUrl || null
        },
        include: {
          venue: true,
          ticketTypes: true
        }
      })

      return updatedEvent
    })

    return NextResponse.json(event)

  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this event
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { organizerId: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete event (cascade will delete related records)
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Event deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

