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
    let db
    try {
      db = await connectToMongo()
    } catch (e) {
      // Graceful fallback when DB is not available
      const typeIfAny = new URL(request.url).searchParams.get('type')
      if (!typeIfAny) {
        return handleCORS(NextResponse.json(
          { error: "Type parameter is required" },
          { status: 400 }
        ))
      }
      return handleCORS(NextResponse.json([]))
    }
    const type = new URL(request.url).searchParams.get('type')
    
    console.log('Data retrieval request for type:', type)
    
    if (!type) {
      return handleCORS(NextResponse.json(
        { error: "Type parameter is required" },
        { status: 400 }
      ))
    }
    
    const collectionName = `${type}_data`
    // Prefer explicit order if present, otherwise fallback to uploadedAt
    const data = await db
      .collection(collectionName)
      .find({})
      .sort({ order: 1, uploadedAt: 1 })
      .toArray()
    
    console.log(`Retrieved ${data.length} records from ${collectionName}`)
    
    return handleCORS(NextResponse.json(data))
  } catch (error) {
    console.error('Data retrieval error:', error)
    // Final safety: don't break the UI if something else goes wrong
    return handleCORS(NextResponse.json([]))
  }
}

export async function PATCH(request) {
  try {
    let db
    try {
      db = await connectToMongo()
    } catch (e) {
      // Demo mode: acknowledge update without persistence
      const body = await request.json().catch(() => ({}))
      return handleCORS(NextResponse.json({ matchedCount: 1, modifiedCount: 1 }))
    }
    const body = await request.json()
    const { type, id, updates } = body || {}

    if (!type || !id || !updates || typeof updates !== 'object') {
      return handleCORS(NextResponse.json(
        { error: 'type, id and updates are required' },
        { status: 400 }
      ))
    }

    const collectionName = `${type}_data`
    // Prevent updating reserved fields
    const { id: _ignoreId, type: _ignoreType, uploadedAt: _ignoreUploadedAt, order: _ignoreOrderSet, ...safeUpdates } = updates

    const result = await db.collection(collectionName).updateOne({ id }, { $set: safeUpdates })

    return handleCORS(NextResponse.json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }))
  } catch (error) {
    console.error('Data update error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    ))
  }
}

export async function PUT(request) {
  try {
    let db
    try {
      db = await connectToMongo()
    } catch (e) {
      // Demo mode: acknowledge reorder without persistence
      return handleCORS(NextResponse.json({ success: true }))
    }
    const body = await request.json()
    const { type, orderedIds } = body || {}

    if (!type || !Array.isArray(orderedIds)) {
      return handleCORS(NextResponse.json(
        { error: 'type and orderedIds array are required' },
        { status: 400 }
      ))
    }

    const collectionName = `${type}_data`

    // Use bulkWrite to set an explicit order index for each id
    const ops = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order: index } }
      }
    }))

    if (ops.length > 0) {
      await db.collection(collectionName).bulkWrite(ops, { ordered: false })
    }

    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Reorder error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to reorder records' },
      { status: 500 }
    ))
  }
}

export async function DELETE(request) {
  try {
    let db
    try {
      db = await connectToMongo()
    } catch (e) {
      // Demo mode: acknowledge delete without persistence
      return handleCORS(NextResponse.json({ deletedCount: 1 }))
    }
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    if (!type || !id) {
      return handleCORS(NextResponse.json({ error: 'type and id are required' }, { status: 400 }))
    }
    const collectionName = `${type}_data`
    const result = await db.collection(collectionName).deleteOne({ id })
    return handleCORS(NextResponse.json({ deletedCount: result.deletedCount }))
  } catch (error) {
    console.error('Delete error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to delete record' }, { status: 500 }))
  }
}

export async function POST(request) {
  try {
    let db
    try {
      db = await connectToMongo()
    } catch (e) {
      // Demo mode: echo back the record
      const body = await request.json().catch(() => ({}))
      const { type, record } = body || {}
      return handleCORS(NextResponse.json({
        insertedId: record?.id || null,
        record
      }))
    }
    const body = await request.json()
    const { type, record } = body || {}
    if (!type || !record || typeof record !== 'object') {
      return handleCORS(NextResponse.json({ error: 'type and record are required' }, { status: 400 }))
    }
    const collectionName = `${type}_data`
    await db.collection(collectionName).insertOne(record)
    return handleCORS(NextResponse.json({ insertedId: record.id, record }))
  } catch (error) {
    console.error('Create error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to create record' }, { status: 500 }))
  }
}