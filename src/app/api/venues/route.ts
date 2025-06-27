import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { venues, venueCategories } from '@/lib/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    
    let venuesList
    
    if (categoryId && categoryId !== 'all') {
      venuesList = await db.select().from(venues)
        .leftJoin(venueCategories, eq(venues.categoryId, venueCategories.id))
        .where(and(
          eq(venues.isActive, true),
          eq(venues.categoryId, parseInt(categoryId))
        ))
        .orderBy(desc(venues.isFeatured), desc(venues.createdAt))
    } else {
      venuesList = await db.select().from(venues)
        .leftJoin(venueCategories, eq(venues.categoryId, venueCategories.id))
        .where(eq(venues.isActive, true))
        .orderBy(desc(venues.isFeatured), desc(venues.createdAt))
    }
    
    return NextResponse.json(venuesList)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const [newVenue] = await db.insert(venues).values({
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      address: body.address,
      phone: body.phone,
      phone2: body.phone2,
      email: body.email,
      website: body.website,
      capacity: body.capacity,
      amenities: body.amenities,
      imageUrl: body.imageUrl,
      imageUrl2: body.imageUrl2,
      imageUrl3: body.imageUrl3,
      latitude: body.latitude,
      longitude: body.longitude,
      openingHours: body.openingHours,
      rating: body.rating || 0,
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
    }).returning()
    
    return NextResponse.json(newVenue, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    // Check if this is a simple status toggle (only isActive field)
    if (Object.keys(body).length === 1 && 'isActive' in body) {
      const [updatedVenue] = await db.update(venues)
        .set({
          isActive: body.isActive,
          updatedAt: new Date(),
        })
        .where(eq(venues.id, parseInt(id)))
        .returning()

      return NextResponse.json(updatedVenue)
    }
    
    // Full venue update
    const [updatedVenue] = await db.update(venues)
      .set({
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        address: body.address,
        phone: body.phone,
        phone2: body.phone2,
        email: body.email,
        website: body.website,
        capacity: body.capacity,
        amenities: body.amenities,
        imageUrl: body.imageUrl,
        imageUrl2: body.imageUrl2,
        imageUrl3: body.imageUrl3,
        latitude: body.latitude,
        longitude: body.longitude,
        openingHours: body.openingHours,
        rating: body.rating,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        updatedAt: new Date()
      })
      .where(eq(venues.id, parseInt(id)))
      .returning()
    
    if (!updatedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedVenue)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }
    
    const [deletedVenue] = await db.delete(venues)
      .where(eq(venues.id, parseInt(id)))
      .returning()
    
    if (!deletedVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Venue deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
  }
}