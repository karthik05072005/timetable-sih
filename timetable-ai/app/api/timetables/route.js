import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

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

export async function GET(request) {
  try {
    const db = await connectToMongo()
    
    console.log('Retrieving generated timetables')
    
    const timetables = await db.collection('generated_timetables')
      .find({})
      .sort({ generatedAt: -1 })
      .toArray()
    
    console.log(`Retrieved ${timetables.length} generated timetables`)
    
    return handleCORS(NextResponse.json(timetables))
  } catch (error) {
    console.error('Timetables retrieval error:', error)
    return handleCORS(NextResponse.json(
      { error: "Failed to retrieve timetables" },
      { status: 500 }
    ))
  }
}