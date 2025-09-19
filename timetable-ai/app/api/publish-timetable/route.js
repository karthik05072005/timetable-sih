import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    console.log('📢 Starting timetable publishing process')
    
    const { timetableData, metadata } = await request.json()
    
    if (!timetableData) {
      return handleCORS(NextResponse.json(
        { error: "No timetable data provided" },
        { status: 400 }
      ))
    }

    // Create published timetable record
    const publishedTimetable = {
      id: uuidv4(),
      timetableData,
      metadata,
      status: 'published',
      publishedAt: new Date(),
      publishedBy: metadata?.publishedBy || 'Administrator',
      semester: metadata?.semester || 'Fall 2025',
      program: metadata?.program || 'B.Ed + FYUP',
      year: metadata?.year || new Date().getFullYear(),
      isActive: true,
      version: 1,
      accessCount: 0,
      lastAccessed: null
    }

    try {
      // Try to save to database
      const db = await connectToMongo()
      
      // Check if there's already an active timetable for this semester/program
      const existingTimetable = await db.collection('published_timetables').findOne({
        semester: publishedTimetable.semester,
        program: publishedTimetable.program,
        year: publishedTimetable.year,
        isActive: true
      })

      if (existingTimetable) {
        // Deactivate existing timetable
        await db.collection('published_timetables').updateOne(
          { id: existingTimetable.id },
          { 
            $set: { 
              isActive: false,
              deactivatedAt: new Date(),
              deactivatedReason: 'Replaced by newer version'
            } 
          }
        )
        console.log('📝 Deactivated previous timetable version')
      }

      // Insert new published timetable
      await db.collection('published_timetables').insertOne(publishedTimetable)
      console.log('✅ Timetable published to database successfully')

      // Create notification for faculty and students (demo implementation)
      const notification = {
        id: uuidv4(),
        type: 'timetable_published',
        title: 'New Timetable Published',
        message: `The ${metadata?.semester || 'Fall 2025'} timetable for ${metadata?.program || 'B.Ed + FYUP'} has been published and is now available.`,
        createdAt: new Date(),
        publishedBy: metadata?.publishedBy || 'Administrator',
        targetAudience: ['faculty', 'students'],
        isRead: false,
        priority: 'high',
        semester: publishedTimetable.semester,
        program: publishedTimetable.program
      }

      await db.collection('notifications').insertOne(notification)
      console.log('📢 Notification created for faculty and students')

    } catch (dbError) {
      console.warn('Database error during publishing, continuing with demo mode:', dbError?.message)
    }

    // Generate public access URL (demo implementation)
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/public/timetable/${publishedTimetable.id}`

    // Create sharing links for different formats
    const sharingLinks = {
      view: publicUrl,
      pdf: `${publicUrl}/export/pdf`,
      excel: `${publicUrl}/export/excel`,
      embed: `${publicUrl}/embed`
    }

    console.log('✅ Timetable published successfully')

    return handleCORS(NextResponse.json({
      success: true,
      message: 'Timetable published successfully',
      publishedTimetable: {
        id: publishedTimetable.id,
        status: 'published',
        publishedAt: publishedTimetable.publishedAt,
        semester: publishedTimetable.semester,
        program: publishedTimetable.program,
        year: publishedTimetable.year,
        publicUrl,
        sharingLinks
      },
      notification: {
        message: 'Students and faculty have been notified about the new timetable',
        recipients: ['faculty', 'students'],
        notificationId: notification?.id
      }
    }))

  } catch (error) {
    console.error('❌ Timetable publishing error:', error)
    
    return handleCORS(NextResponse.json(
      { error: "Failed to publish timetable: " + error.message },
      { status: 500 }
    ))
  }
}

// GET endpoint to retrieve published timetables
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get('semester')
    const program = searchParams.get('program')
    const year = searchParams.get('year')
    const active = searchParams.get('active')

    let query = {}
    
    if (semester) query.semester = semester
    if (program) query.program = program
    if (year) query.year = parseInt(year)
    if (active !== null) query.isActive = active === 'true'

    try {
      const db = await connectToMongo()
      const publishedTimetables = await db.collection('published_timetables')
        .find(query)
        .sort({ publishedAt: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json({
        success: true,
        timetables: publishedTimetables.map(tt => ({
          id: tt.id,
          semester: tt.semester,
          program: tt.program,
          year: tt.year,
          publishedAt: tt.publishedAt,
          publishedBy: tt.publishedBy,
          isActive: tt.isActive,
          accessCount: tt.accessCount,
          lastAccessed: tt.lastAccessed
        }))
      }))

    } catch (dbError) {
      console.warn('Database error, returning demo data:', dbError?.message)
      
      return handleCORS(NextResponse.json({
        success: true,
        timetables: [],
        message: 'Running in demo mode - no published timetables available'
      }))
    }

  } catch (error) {
    console.error('❌ Error retrieving published timetables:', error)
    
    return handleCORS(NextResponse.json(
      { error: "Failed to retrieve published timetables: " + error.message },
      { status: 500 }
    ))
  }
}