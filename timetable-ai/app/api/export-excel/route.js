import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { MongoClient } from 'mongodb'

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

// Generate Excel data from timetable
function generateExcelData(timetableData, metadata = {}) {
  const { schedule, summary } = timetableData
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Create summary sheet data
  const summaryData = [
    ['Academic Timetable'],
    [`Program: ${metadata.program || 'B.Ed + FYUP'}`],
    [`Semester: ${metadata.semester || 'Fall 2025'}`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['Summary Statistics'],
    ['Total Classes', summary?.totalSlots || 0],
    ['Conflicts', summary?.conflictCount || 0],
    ['Optimization Score', `${summary?.optimizationScore || 0}%`],
    []
  ]

  // Create timetable sheet data
  const timetableSheetData = []
  
  // Header row
  const headerRow = ['Time', ...days]
  timetableSheetData.push(headerRow)
  
  // Data rows
  timeSlots.forEach(time => {
    const row = [time]
    
    days.forEach(day => {
      const daySchedule = schedule?.[day]?.[time] || []
      const cellContent = daySchedule.map(slot => 
        `${slot.course} (${slot.faculty}, ${slot.room})`
      ).join('\\n')
      row.push(cellContent)
    })
    
    timetableSheetData.push(row)
  })

  // Create detailed classes sheet
  const detailedData = [
    ['Course Code', 'Course Name', 'Faculty', 'Room', 'Day', 'Time', 'Students']
  ]

  // Extract all scheduled classes
  Object.entries(schedule).forEach(([day, timeSlots]) => {
    Object.entries(timeSlots).forEach(([time, slots]) => {
      slots.forEach(slot => {
        const [courseCode, courseName] = slot.course.split(' - ')
        detailedData.push([
          courseCode || slot.course,
          courseName || '',
          slot.faculty,
          slot.room,
          day,
          time,
          slot.students || 0
        ])
      })
    })
  })

  return {
    summary: summaryData,
    timetable: timetableSheetData,
    detailed: detailedData
  }
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const { timetableData, metadata, timetableId } = await request.json()
    
    console.log('📊 Starting Excel generation for timetable')
    
    let finalTimetableData = timetableData
    
    // If timetableId is provided, fetch from database
    if (timetableId && !timetableData) {
      try {
        const db = await connectToMongo()
        const timetableRecord = await db.collection('generated_timetables').findOne({ id: timetableId })
        
        if (timetableRecord) {
          finalTimetableData = timetableRecord.timetable
          console.log('📋 Retrieved timetable from database')
        } else {
          throw new Error('Timetable not found in database')
        }
      } catch (dbError) {
        console.warn('Database error, using provided data:', dbError.message)
      }
    }
    
    if (!finalTimetableData) {
      return handleCORS(NextResponse.json(
        { error: "No timetable data provided" },
        { status: 400 }
      ))
    }
    
    // Generate Excel data
    const excelData = generateExcelData(finalTimetableData, metadata)
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Add summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(excelData.summary)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Add timetable sheet
    const timetableSheet = XLSX.utils.aoa_to_sheet(excelData.timetable)
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 12 }, // Time column
      ...Array(7).fill({ wch: 25 }) // Day columns
    ]
    timetableSheet['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable')
    
    // Add detailed classes sheet
    const detailedSheet = XLSX.utils.aoa_to_sheet(excelData.detailed)
    const detailedColWidths = [
      { wch: 15 }, // Course Code
      { wch: 25 }, // Course Name
      { wch: 20 }, // Faculty
      { wch: 15 }, // Room
      { wch: 12 }, // Day
      { wch: 12 }, // Time
      { wch: 10 }  // Students
    ]
    detailedSheet['!cols'] = detailedColWidths
    
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Classes')
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    })
    
    console.log('✅ Excel file generated successfully')
    
    // Return Excel file as response
    const filename = `timetable-${metadata?.semester || 'academic'}-${new Date().toISOString().split('T')[0]}.xlsx`
    
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    })
    
    return handleCORS(response)
    
  } catch (error) {
    console.error('❌ Excel generation error:', error)
    
    return handleCORS(NextResponse.json(
      { error: "Failed to generate Excel file: " + error.message },
      { status: 500 }
    ))
  }
}