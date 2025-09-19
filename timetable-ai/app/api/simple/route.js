import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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

export async function GET() {
  try {
    const db = await connectToMongo()
    return NextResponse.json({ message: "Timetable AI Backend Ready" })
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const db = await connectToMongo()
    const body = await request.json()
    return NextResponse.json({ message: "POST request received", data: body })
  } catch (error) {
    return NextResponse.json({ error: "Request processing failed" }, { status: 500 })
  }
}