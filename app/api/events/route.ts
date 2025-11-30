import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      shortDescription,
      description,
      category,
      startDate,
      endDate,
      timezone,
      ageRestriction,
      refundPolicy,
      imageUrl,
      status,
      venue,
      ticketTypes
    } = body

    // Validate required fields
    if (!title || !description || !startDate || !venue || !ticketTypes || ticketTypes.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, would get organizerId from authenticated session
    // For now, get the first organizer from the database
    const organizer = await prisma.user.findFirst({
      where: { role: 'ORGANIZER' }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'No organizer found' }, { status: 400 })
    }

    // Create event with venue and ticket types in transaction
    const event = await prisma.$transaction(async (tx) => {
      // Create venue
      const newVenue = await tx.venue.create({
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

      // Create event
      const newEvent = await tx.event.create({
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
          imageUrl: imageUrl || null,
          organizerId: organizer.id,
          venueId: newVenue.id,
          ticketTypes: {
            create: ticketTypes.map((tt: any, index: number) => ({
              name: tt.name,
              description: tt.description || null,
              price: tt.price,
              quantityTotal: tt.quantityTotal,
              maxPerOrder: tt.maxPerOrder || 10,
              sortOrder: index
            }))
          }
        },
        include: {
          venue: true,
          ticketTypes: true
        }
      })

      return newEvent
    })

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get('organizerId')
    const status = searchParams.get('status')

    const where: any = {}
    if (organizerId) where.organizerId = organizerId
    if (status) where.status = status

    const events = await prisma.event.findMany({
      where,
      include: {
        venue: true,
        ticketTypes: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(events)

  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

