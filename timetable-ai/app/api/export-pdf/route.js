import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
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

// Generate HTML template for timetable
function generateTimetableHTML(timetableData, metadata = {}) {
  const { schedule, summary } = timetableData
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Timetable - ${metadata.semester || 'Academic'} ${metadata.year || new Date().getFullYear()}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #fff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
          font-size: 28px;
          color: #2563eb;
          margin-bottom: 10px;
        }
        
        .header .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .header .meta {
          font-size: 14px;
          color: #9ca3af;
        }
        
        .summary {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        
        .summary-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .timetable-container {
          margin: 0 auto;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .timetable {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        
        .timetable th {
          background-color: #2563eb;
          color: white;
          padding: 12px 8px;
          text-align: center;
          font-weight: 600;
          border: 1px solid #1d4ed8;
        }
        
        .timetable th.time-header {
          background-color: #1e40af;
          width: 100px;
        }
        
        .timetable td {
          padding: 8px 6px;
          border: 1px solid #d1d5db;
          vertical-align: top;
          height: 80px;
          position: relative;
        }
        
        .timetable td.time-slot {
          background-color: #f1f5f9;
          font-weight: 600;
          text-align: center;
          color: #374151;
        }
        
        .course-slot {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 4px;
          margin-bottom: 2px;
          font-size: 9px;
          line-height: 1.2;
        }
        
        .course-code {
          font-weight: bold;
          color: #1e40af;
          display: block;
          margin-bottom: 2px;
        }
        
        .course-name {
          color: #374151;
          display: block;
          margin-bottom: 2px;
        }
        
        .course-details {
          color: #6b7280;
          font-size: 8px;
        }
        
        .course-slot.english { background-color: #dbeafe; border-color: #3b82f6; }
        .course-slot.mathematics { background-color: #dcfce7; border-color: #22c55e; }
        .course-slot.science { background-color: #f3e8ff; border-color: #8b5cf6; }
        .course-slot.history { background-color: #fed7aa; border-color: #f97316; }
        .course-slot.computer { background-color: #fce7f3; border-color: #ec4899; }
        .course-slot.ai { background-color: #e0f2fe; border-color: #0891b2; }
        .course-slot.default { background-color: #f3f4f6; border-color: #6b7280; }
        
        .legend {
          margin-top: 30px;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        
        .legend h3 {
          margin-bottom: 15px;
          color: #374151;
          font-size: 16px;
        }
        
        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          padding: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          .header { margin-bottom: 20px; }
          .summary { margin-bottom: 20px; }
          .legend { margin-top: 20px; }
          .footer { margin-top: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Academic Timetable</h1>
        <div class="subtitle">${metadata.program || 'B.Ed + FYUP'} • ${metadata.semester || 'Fall 2025'}</div>
        <div class="meta">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${summary?.totalSlots || 0}</div>
          <div class="summary-label">Total Classes</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${summary?.conflictCount || 0}</div>
          <div class="summary-label">Conflicts</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${summary?.optimizationScore || 0}%</div>
          <div class="summary-label">Optimization Score</div>
        </div>
      </div>
      
      <div class="timetable-container">
        <table class="timetable">
          <thead>
            <tr>
              <th class="time-header">Time</th>
              ${days.map(day => `<th>${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${timeSlots.map(time => `
              <tr>
                <td class="time-slot">${time}</td>
                ${days.map(day => {
                  const daySchedule = schedule?.[day]?.[time] || []
                  return `
                    <td>
                      ${daySchedule.map(slot => {
                        const courseType = slot.course.toLowerCase().includes('english') ? 'english' :
                                         slot.course.toLowerCase().includes('math') ? 'mathematics' :
                                         slot.course.toLowerCase().includes('science') ? 'science' :
                                         slot.course.toLowerCase().includes('history') ? 'history' :
                                         slot.course.toLowerCase().includes('computer') || slot.course.toLowerCase().includes('ai') ? 'ai' :
                                         'default'
                        
                        return `
                          <div class="course-slot ${courseType}">
                            <span class="course-code">${slot.course.split(' - ')[0]}</span>
                            <span class="course-name">${slot.course.split(' - ')[1] || slot.course}</span>
                            <span class="course-details">${slot.faculty} • ${slot.room}</span>
                          </div>
                        `
                      }).join('')}
                    </td>
                  `
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="legend">
        <h3>Subject Categories</h3>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #dbeafe;"></div>
            <span>English & Literature</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #dcfce7;"></div>
            <span>Mathematics</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #f3e8ff;"></div>
            <span>Science</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #fed7aa;"></div>
            <span>History & Social Studies</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #e0f2fe;"></div>
            <span>Computer Science & AI</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #f3f4f6;"></div>
            <span>Other Subjects</span>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Generated by Timetable AI • Intelligent Timetable Generation System</p>
        <p>This timetable was optimized using advanced AI algorithms to minimize conflicts and maximize efficiency.</p>
      </div>
    </body>
    </html>
  `
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  let browser = null
  let page = null
  
  try {
    const { timetableData, metadata, timetableId } = await request.json()
    
    console.log('🖨️ Starting PDF generation for timetable')
    
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
    
    // Generate HTML
    const html = generateTimetableHTML(finalTimetableData, metadata)
    console.log('📄 HTML template generated successfully')
    
    // Launch Puppeteer with enhanced Windows-optimized settings
    console.log('🚀 Launching browser...')
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 120000,
      protocolTimeout: 120000,
      ignoreDefaultArgs: ['--disable-extensions']
    })
    
    console.log('📖 Creating new page...')
    page = await browser.newPage()
    
    // Set viewport and other page settings
    await page.setViewport({ width: 1200, height: 800 })
    
    // Set content with extended timeout
    console.log('📝 Setting page content...')
    await page.setContent(html, { 
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
      timeout: 60000
    })
    
    // Wait a bit more to ensure rendering is complete
    await page.waitForTimeout(2000)
    
    // Generate PDF with enhanced options
    console.log('🖨️ Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 60000
    })
    
    console.log('✅ PDF generated successfully, closing browser...')
    
    // Close page and browser properly
    if (page && !page.isClosed()) {
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
    browser = null
    page = null
    
    console.log('✅ PDF generation completed successfully')
    
    // Return PDF as response
    const filename = `timetable-${metadata?.semester || 'academic'}-${new Date().toISOString().split('T')[0]}.pdf`
    
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
    
    return handleCORS(response)
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    
    // Close page and browser if still open
    try {
      if (page && !page.isClosed()) {
        await page.close()
      }
    } catch (pageCloseError) {
      console.error('Error closing page:', pageCloseError)
    }
    
    try {
      if (browser) {
        await browser.close()
      }
    } catch (browserCloseError) {
      console.error('Error closing browser:', browserCloseError)
    }
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate PDF"
    if (error.message.includes('Target closed') || error.message.includes('browser') || error.message.includes('puppeteer')) {
      errorMessage = "PDF generation service temporarily unavailable. Please try again later."
    } else if (error.message.includes('timeout')) {
      errorMessage = "PDF generation timed out. Please try with a smaller timetable."
    } else if (error.message.includes('Protocol error')) {
      errorMessage = "PDF service connection error. Please refresh the page and try again."
    } else {
      errorMessage = "Failed to generate PDF: " + error.message
    }
    
    return handleCORS(NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    ))
  }
}