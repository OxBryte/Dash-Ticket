import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, eventId, discountType, discountValue } = body

    // Validate code
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 })
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        eventId: eventId || null,
        discountType,
        discountValue,
        usageLimit: body.usageLimit || null,
        perCustomerLimit: body.perCustomerLimit || 1,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        minimumPurchase: body.minimumPurchase || null,
        active: true
      }
    })

    return NextResponse.json(promoCode, { status: 201 })

  } catch (error) {
    console.error('Promo code creation error:', error)
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const eventId = searchParams.get('eventId')

    if (code) {
      // Validate a specific promo code
      const promoCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (!promoCode) {
        return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
      }

      // Check if code is valid
      const now = new Date()
      const isValid = 
        promoCode.active &&
        (!promoCode.validFrom || promoCode.validFrom <= now) &&
        (!promoCode.validUntil || promoCode.validUntil >= now) &&
        (!promoCode.usageLimit || promoCode.usageCount < promoCode.usageLimit)

      if (!isValid) {
        return NextResponse.json({ error: 'Promo code is not valid or has expired' }, { status: 400 })
      }

      // Check if applies to event
      if (eventId && promoCode.eventId && promoCode.eventId !== eventId) {
        return NextResponse.json({ error: 'Promo code not valid for this event' }, { status: 400 })
      }

      return NextResponse.json({
        valid: true,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      })
    }

    // List all promo codes (for admin/organizer)
    const promoCodes = await prisma.promoCode.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(promoCodes)

  } catch (error) {
    console.error('Promo code fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
  }
}

