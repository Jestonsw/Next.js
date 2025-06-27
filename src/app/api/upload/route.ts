import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = (data.get('file') || data.get('image')) as unknown as File

    if (!file) {

      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {

      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }



    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!extension || !allowedExtensions.includes(extension)) {

      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.' }, { status: 400 })
    }
    
    // Clean filename - remove spaces and special characters
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase()
    const filename = `event_${timestamp}_${cleanName}`
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })

    }
    
    const filePath = join(uploadDir, filename)
    
    await writeFile(filePath, buffer)

    
    // Return the public URL
    const imageUrl = `/uploads/${filename}`
    
    return NextResponse.json({ imageUrl: imageUrl })
  } catch (error) {

    return NextResponse.json({ 
      error: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}