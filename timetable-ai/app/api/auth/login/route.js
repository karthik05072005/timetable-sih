import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'timetable-ai-secret-key'

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    let dbInstance = null
    try {
      dbInstance = await connectToMongo()
    } catch (connErr) {
      console.warn('MongoDB connection failed, proceeding with fallback admin for demo:', connErr?.message)
    }
    const body = await request.json()
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return handleCORS(NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ))
    }
    
    const { email, password } = body
    
    // Validate required fields
    if (!email || !password) {
      return handleCORS(NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      ))
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return handleCORS(NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      ))
    }
    
    console.log('Login attempt for:', email)
    
    // Check if admin exists, if not create default admin (with DB when available)
    let admin = null
    if (dbInstance) {
      admin = await dbInstance.collection('admins').findOne({ email })
      if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        admin = {
          id: uuidv4(),
          email: 'admin@timetable.ai',
          password: hashedPassword,
          name: 'Dr. Sharma',
          role: 'administrator',
          createdAt: new Date()
        }
        await dbInstance.collection('admins').insertOne(admin)
        console.log('Created default admin user')
      }
    } else {
      // Fallback admin (no DB)
      admin = {
        id: uuidv4(),
        email: 'admin@timetable.ai',
        name: 'Dr. Sharma',
        role: 'administrator'
      }
    }

    // For demo purposes, accept any email/password combination
    if (email && password) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      console.log('Login successful for:', admin.name)
      
      return handleCORS(NextResponse.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }))
    }

    return handleCORS(NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    ))

  } catch (error) {
    console.error('Login error:', error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return handleCORS(NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      ))
    }
    
    if (error.name === 'MongoError') {
      return handleCORS(NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      ))
    }
    
    return handleCORS(NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    ))
  }
}