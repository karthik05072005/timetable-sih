import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

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

// Parse Excel file
async function parseExcelFile(buffer, type) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  
  return data.map((row, index) => ({
    id: uuidv4(),
    ...row,
    uploadedAt: new Date(),
    type
  }))
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    let dbInstance = null
    try {
      dbInstance = await connectToMongo()
    } catch (connErr) {
      console.warn('MongoDB connection failed, proceeding with demo mode:', connErr?.message)
    }
    
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type')
    
    console.log('File upload request for type:', type)
    
    // Validate required fields
    if (!file) {
      return handleCORS(NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      ))
    }
    
    if (!type) {
      return handleCORS(NextResponse.json(
        { error: "File type is required" },
        { status: 400 }
      ))
    }
    
    // Validate file type
    const allowedTypes = ['students', 'faculty', 'rooms']
    if (!allowedTypes.includes(type)) {
      return handleCORS(NextResponse.json(
        { error: "Invalid file type. Allowed types: students, faculty, rooms" },
        { status: 400 }
      ))
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return handleCORS(NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      ))
    }
    
    // Validate file extension
    const allowedExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      return handleCORS(NextResponse.json(
        { error: "Invalid file format. Allowed formats: .xlsx, .xls, .csv" },
        { status: 400 }
      ))
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsedData = await parseExcelFile(buffer, type)
    
    // Validate parsed data
    if (!parsedData || parsedData.length === 0) {
      return handleCORS(NextResponse.json(
        { error: "No data found in the uploaded file" },
        { status: 400 }
      ))
    }
    
    console.log(`Parsed ${parsedData.length} records for ${type}`)
    
    // Save to database if available, otherwise just return the data
    if (dbInstance) {
      const collectionName = `${type}_data`
      await dbInstance.collection(collectionName).deleteMany({}) // Clear existing data
      await dbInstance.collection(collectionName).insertMany(parsedData)
      console.log(`Saved ${parsedData.length} records to ${collectionName} collection`)
    } else {
      console.log(`Demo mode: ${parsedData.length} records processed for ${type} (not saved to DB)`)
    }
    
    return handleCORS(NextResponse.json({
      message: `${type} data uploaded successfully`,
      data: parsedData,
      count: parsedData.length
    }))
  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return handleCORS(NextResponse.json(
        { error: "File validation failed" },
        { status: 400 }
      ))
    }
    
    if (error.name === 'MongoError') {
      return handleCORS(NextResponse.json(
        { error: "Database operation failed" },
        { status: 503 }
      ))
    }
    
    if (error.message.includes('Invalid file format')) {
      return handleCORS(NextResponse.json(
        { error: "Invalid file format. Please upload a valid Excel file" },
        { status: 400 }
      ))
    }
    
    return handleCORS(NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    ))
  }
}