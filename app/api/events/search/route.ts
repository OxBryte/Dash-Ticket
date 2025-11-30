import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'date_asc'

    // Build where clause
    const where: any = {
      status: 'ON_SALE',
    }

    // Text search (SQLite doesn't support case-insensitive mode, so we use contains)
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } },
      ]
    }

    // Category filter
    if (category && category !== 'ALL') {
      where.category = category
    }

    // City filter
    if (city) {
      where.venue = {
        city: { contains: city, mode: 'insensitive' }
      }
    }

    // Date range filter
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
    }

    // Fetch events
    const events = await prisma.event.findMany({
      where,
      include: {
        venue: true,
        ticketTypes: true,
      },
      orderBy: sortBy === 'date_desc' ? { startDate: 'desc' } :
               sortBy === 'title_asc' ? { title: 'asc' } :
               sortBy === 'title_desc' ? { title: 'desc' } :
               { startDate: 'asc' } // default: date_asc
    })

    // Apply price filter (need to do this post-query for SQLite)
    let filteredEvents = events
    if (minPrice || maxPrice) {
      filteredEvents = events.filter(event => {
        const prices = event.ticketTypes.map(t => t.price)
        if (prices.length === 0) return false
        
        const minEventPrice = Math.min(...prices)
        const maxEventPrice = Math.max(...prices)
        
        const matchesMin = !minPrice || maxEventPrice >= parseInt(minPrice)
        const matchesMax = !maxPrice || minEventPrice <= parseInt(maxPrice)
        
        return matchesMin && matchesMax
      })
    }

    return NextResponse.json(filteredEvents)

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

