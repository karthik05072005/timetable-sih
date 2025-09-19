import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    const db = client.db(process.env.DB_NAME)
    await client.close()
    
    return NextResponse.json({ 
      message: "Test API endpoint working",
      mongodb: "Connected successfully",
      mongoUrl: process.env.MONGO_URL ? "Set" : "Not set",
      dbName: process.env.DB_NAME ? "Set" : "Not set"
    })
  } catch (error) {
    return NextResponse.json({ 
      message: "Test API endpoint working",
      mongodb: "Connection failed",
      error: error.message
    })
  }
}