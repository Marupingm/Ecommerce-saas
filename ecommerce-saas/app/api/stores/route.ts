import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stores = await prisma.store.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Stores fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { name, description, subdomain } = data

    // Validate required fields
    if (!name || !subdomain) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if subdomain is available
    const existingStore = await prisma.store.findFirst({
      where: {
        subdomain,
      },
    })

    if (existingStore) {
      return NextResponse.json(
        { message: 'Subdomain is already taken' },
        { status: 400 }
      )
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        description,
        subdomain,
        userId: session.user.id,
      },
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('Store creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('id')

    if (!storeId) {
      return NextResponse.json(
        { message: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    })

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete store
    await prisma.store.delete({
      where: {
        id: storeId,
      },
    })

    return NextResponse.json({ message: 'Store deleted successfully' })
  } catch (error) {
    console.error('Store deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 