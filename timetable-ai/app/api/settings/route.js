import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

let client
let db
let memorySettings = null

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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

const DEFAULT_SETTINGS = {
  profile: {
    name: 'Administrator',
    email: 'admin@example.com',
    phone: '',
    avatarUrl: ''
  },
  notifications: {
    email: true,
    inApp: true,
    frequency: 'daily' // immediate | hourly | daily | weekly
  },
  security: {
    twoFactorEnabled: false
  }
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  try {
    try {
      const database = await connectToMongo()
      const doc = await database.collection('settings').findOne({ scope: 'admin' })
      const settings = doc?.data || DEFAULT_SETTINGS
      return handleCORS(NextResponse.json(settings))
    } catch (_) {
      // Demo fallback
      if (!memorySettings) memorySettings = DEFAULT_SETTINGS
      return handleCORS(NextResponse.json(memorySettings))
    }
  } catch (e) {
    return handleCORS(NextResponse.json(DEFAULT_SETTINGS))
  }
}

export async function PUT(request) {
  try {
    const payload = await request.json()
    try {
      const database = await connectToMongo()
      await database.collection('settings').updateOne(
        { scope: 'admin' },
        { $set: { data: payload } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ success: true }))
    } catch (_) {
      memorySettings = payload
      return handleCORS(NextResponse.json({ success: true }))
    }
  } catch (e) {
    return handleCORS(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }))
  }
}

export async function PATCH(request) {
  try {
    const updates = await request.json()
    try {
      const database = await connectToMongo()
      const current = (await database.collection('settings').findOne({ scope: 'admin' }))?.data || DEFAULT_SETTINGS
      const next = { ...current, ...updates, profile: { ...current.profile, ...updates.profile }, notifications: { ...current.notifications, ...updates.notifications }, security: { ...current.security, ...updates.security } }
      await database.collection('settings').updateOne(
        { scope: 'admin' },
        { $set: { data: next } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ success: true }))
    } catch (_) {
      const current = memorySettings || DEFAULT_SETTINGS
      memorySettings = { ...current, ...updates, profile: { ...current.profile, ...updates.profile }, notifications: { ...current.notifications, ...updates.notifications }, security: { ...current.security, ...updates.security } }
      return handleCORS(NextResponse.json({ success: true }))
    }
  } catch (e) {
    return handleCORS(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }))
  }
}



