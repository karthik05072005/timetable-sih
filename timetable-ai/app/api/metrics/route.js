import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

// MongoDB connection (reused per process)
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

export async function GET() {
  try {
    const database = await connectToMongo()

    const [students, faculty, rooms] = await Promise.all([
      database.collection('students_data').countDocuments({}),
      database.collection('faculty_data').countDocuments({}),
      database.collection('rooms_data').countDocuments({})
    ])

    return handleCORS(NextResponse.json({
      students,
      faculty,
      rooms
    }))
  } catch (error) {
    // If MongoDB is not reachable, provide a graceful response
    return handleCORS(NextResponse.json({
      error: 'Database not available',
      students: null,
      faculty: null,
      rooms: null
    }, { status: 200 }))
  }
}



