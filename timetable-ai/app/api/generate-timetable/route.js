import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
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

// AI Timetable Optimization Engine
class TimetableOptimizer {
  constructor(students, faculty, rooms, constraints) {
    this.students = students
    this.faculty = faculty
    this.rooms = rooms
    this.constraints = constraints
    this.timetable = []
    this.conflicts = []
  }

  // Core AI Rules Implementation
  validateRule1(studentId, timeSlot, roomId) {
    // Rule 1: A student cannot be in two places at once
    return !this.timetable.some(slot => 
      slot.students?.includes(studentId) && 
      slot.timeSlot === timeSlot && 
      slot.roomId !== roomId
    )
  }

  validateRule2(facultyId, timeSlot, roomId) {
    // Rule 2: A teacher cannot be in two places at once
    return !this.timetable.some(slot => 
      slot.facultyId === facultyId && 
      slot.timeSlot === timeSlot && 
      slot.roomId !== roomId
    )
  }

  validateRule3(roomId, timeSlot) {
    // Rule 3: A classroom cannot be used by two different classes at once
    return !this.timetable.some(slot => 
      slot.roomId === roomId && 
      slot.timeSlot === timeSlot
    )
  }

  calculateWorkloadBalance(facultyId) {
    // Rule 4: Make sure teachers have a balanced workload
    const assignedSlots = this.timetable.filter(slot => slot.facultyId === facultyId)
    const faculty = this.faculty.find(f => f.id === facultyId)
    const maxHours = faculty?.maxHours || 20
    
    return {
      currentHours: assignedSlots.length,
      maxHours,
      isBalanced: assignedSlots.length <= maxHours
    }
  }

  // Helper method to try scheduling a course at a specific slot
  tryScheduleCourseAtSlot(course, day, time, slotKey, usedSlots, timetable, facultyWorkload, courseIndex = 0, sessionNumber = 1) {
    // Find faculty who can teach this subject
    let availableFaculty = []
    if (course.type === 'elective') {
      availableFaculty = course.faculty.filter(f => {
        const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
        const facultyInfo = facultyWorkload[facultyId]
        return facultyInfo && facultyInfo.currentHours < facultyInfo.maxHours
      })
    } else {
      availableFaculty = this.faculty.filter(f => {
        const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
        const facultyInfo = facultyWorkload[facultyId]
        return facultyInfo && facultyInfo.currentHours < facultyInfo.maxHours
      })
    }

    if (availableFaculty.length === 0) {
      return false
    }

    // Find appropriate room
    const isTechnicalSubject = ['AI', 'ML', 'Data Science', 'Cyber Sec', 'IoT', 'Big Data', 'Networks', 'Databases', 'Cloud Computing', 'Computer Science'].some(tech => 
      course.name.toLowerCase().includes(tech.toLowerCase())
    )
    
    const suitableRooms = this.rooms.filter(room => {
      const roomType = (room.Type || room.type || '').toLowerCase()
      const roomName = (room.Name || room.name || '').toLowerCase()
      return isTechnicalSubject ? 
        (roomType.includes('lab') || roomName.includes('lab')) :
        (roomType.includes('classroom') || roomType.includes('lecture') || roomName.includes('lecture') || roomType.includes('class'))
    })

    const selectedRoom = suitableRooms.length > 0 ? 
      suitableRooms[Math.floor(Math.random() * suitableRooms.length)] :
      this.rooms[Math.floor(Math.random() * this.rooms.length)]

    // Find faculty who can teach this subject and is available
    const availableFacultyForSlot = availableFaculty.filter(f => {
      const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
      const facultyInfo = facultyWorkload[facultyId]
      
      // Check if faculty is already scheduled at this time
      const facultyAlreadyScheduled = timetable.some(slot => 
        slot.facultyId === facultyId &&
        slot.day === day &&
        slot.timeSlot === time
      )
      
      // Double-check that this faculty can actually teach this course
      const facultySubjects = f.subjects || f.Subjects || f.courses || ''
      const subjects = facultySubjects.split(',').map(s => s.trim()).filter(Boolean)
      const canTeachCourse = subjects.some(subject => 
        subject.toLowerCase().includes(course.name.toLowerCase()) || 
        course.name.toLowerCase().includes(subject.toLowerCase())
      )
      
      return !facultyAlreadyScheduled && facultyInfo && facultyInfo.currentHours < facultyInfo.maxHours && canTeachCourse
    })

    if (availableFacultyForSlot.length === 0) {
      return false
    }

    // Check room availability at this time slot
    const roomAlreadyBooked = timetable.some(slot => 
      (slot.roomId === (selectedRoom.id || selectedRoom['Room ID'] || selectedRoom.Room_ID)) &&
      slot.day === day &&
      slot.timeSlot === time
    )

    if (roomAlreadyBooked) {
      return false
    }

    const selectedFaculty = availableFacultyForSlot[Math.floor(Math.random() * availableFacultyForSlot.length)]
    const facultyId = selectedFaculty.id || selectedFaculty['Faculty ID'] || selectedFaculty.Faculty_ID

    // Create course code with session indicator
    const courseCode = course.name.replace(/\s+/g, '').substring(0, 6).toUpperCase() + (sessionNumber > 1 ? sessionNumber : '')

    timetable.push({
      id: uuidv4(),
      courseCode: courseCode,
      courseName: sessionNumber > 1 ? `${course.name} (Session ${sessionNumber})` : course.name,
      facultyId: facultyId,
      facultyName: selectedFaculty.Name || selectedFaculty.name || selectedFaculty.Faculty_Name,
      roomId: selectedRoom.id || selectedRoom['Room ID'] || selectedRoom.Room_ID,
      roomName: selectedRoom.Name || selectedRoom.name || selectedRoom.Room_Name,
      day: day,
      timeSlot: time,
      students: course.students.map(s => s.id || s['Student ID'] || s.Student_ID),
      studentCount: course.students.length,
      studentNames: course.students.map(s => s.Name || s.name || s.Student_Name),
      courseType: course.type
    })

    usedSlots.add(slotKey)
    facultyWorkload[facultyId].currentHours++
    console.log(`✅ Scheduled ${course.name}${sessionNumber > 1 ? ` (Session ${sessionNumber})` : ''} on ${day} at ${time} with ${selectedFaculty.Name || selectedFaculty.name} (${facultyWorkload[facultyId].currentHours}/${facultyWorkload[facultyId].maxHours} hours)`)
    
    return true
  }

  // Genetic Algorithm Implementation
  generateRandomTimetable() {
    // Updated time slots with lunch break at 1:00-1:30 PM, ending at 3:30 PM
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] // Ensure Friday is included
    const timetable = []
    const usedSlots = new Set() // Track used time slots to avoid conflicts
    const facultyWorkload = {} // Track faculty hours per week
    
    // Add lunch break slot to all days (1:00 PM - 1:30 PM)
    days.forEach(day => {
      timetable.push({
        id: `lunch-${day}`,
        courseCode: 'LUNCH',
        courseName: 'Lunch Break',
        facultyId: null,
        facultyName: null,
        roomId: null,
        roomName: null,
        day: day,
        timeSlot: '1:00 PM',
        students: [],
        studentCount: 0,
        studentNames: [],
        courseType: 'break'
      })
      usedSlots.add(`${day}-1:00 PM`)
    })

    console.log('📚 Using uploaded data:')
    console.log('Students:', this.students?.length || 0)
    console.log('Faculty:', this.faculty?.length || 0)
    console.log('Rooms:', this.rooms?.length || 0)

    if (this.students && this.students.length > 0 && this.faculty && this.faculty.length > 0 && this.rooms && this.rooms.length > 0) {
      // Initialize faculty workload tracking
      this.faculty.forEach(faculty => {
        const facultyId = faculty.id || faculty['Faculty ID'] || faculty.Faculty_ID
        const maxHours = parseInt(faculty['Max Hours'] || faculty.maxHours || 10) || 10
        facultyWorkload[facultyId] = {
          currentHours: 0,
          maxHours: maxHours,
          name: faculty.Name || faculty.name || faculty.Faculty_Name
        }
      })

      console.log('👨‍🏫 Faculty workload limits:', facultyWorkload)

      // Group students by their electives to create classes
      const electiveGroups = {}
      
      this.students.forEach(student => {
        const studentElectives = student.electives || student.Electives || student.subjects || ''
        const electives = studentElectives.split(',').map(e => e.trim()).filter(Boolean)
        
        electives.forEach(elective => {
          if (!electiveGroups[elective]) {
            electiveGroups[elective] = []
          }
          electiveGroups[elective].push(student)
        })
      })

      console.log('📚 Elective groups:', Object.keys(electiveGroups))

      // Create courses based ONLY on what faculty can actually teach
      const allCourses = []
      
      // Add elective courses - Schedule each elective multiple times per week
      Object.entries(electiveGroups).forEach(([elective, students]) => {
        // Find faculty who can teach this elective
        const availableFaculty = this.faculty.filter(f => {
          const facultySubjects = f.subjects || f.Subjects || f.courses || ''
          const subjects = facultySubjects.split(',').map(s => s.trim()).filter(Boolean)
          return subjects.some(subject => 
            subject.toLowerCase().includes(elective.toLowerCase()) || 
            elective.toLowerCase().includes(subject.toLowerCase())
          )
        })

        if (availableFaculty.length > 0) {
          // Add the base elective course
          allCourses.push({
            type: 'elective',
            name: elective,
            students: students,
            faculty: availableFaculty,
            priority: 0 // High priority
          })
        }
      })

      // Extract all unique subjects from faculty data
      const facultySubjects = new Set()
      this.faculty.forEach(f => {
        const subjects = (f.subjects || f.Subjects || f.courses || '').split(',').map(s => s.trim()).filter(Boolean)
        subjects.forEach(subject => {
          if (subject && subject !== 'General' && subject !== 'All') {
            facultySubjects.add(subject)
          }
        })
      })

      console.log('📚 Available faculty subjects:', Array.from(facultySubjects))
      
      // Also log faculty-subject mapping for debugging
      console.log('👨‍🏫 Faculty-Subject Mapping:')
      this.faculty.forEach(f => {
        const subjects = (f.subjects || f.Subjects || f.courses || '').split(',').map(s => s.trim()).filter(Boolean)
        console.log(`  ${f.Name || f.name || f.Faculty_Name}: ${subjects.join(', ')}`)
      })

      // Create courses based on faculty subjects (not hardcoded lists)
      Array.from(facultySubjects).forEach(subject => {
        // Find faculty who can teach this subject
        const availableFaculty = this.faculty.filter(f => {
          const facultySubjects = f.subjects || f.Subjects || f.courses || ''
          const subjects = facultySubjects.split(',').map(s => s.trim()).filter(Boolean)
          return subjects.some(facultySubject => 
            facultySubject.toLowerCase().includes(subject.toLowerCase()) || 
            subject.toLowerCase().includes(facultySubject.toLowerCase())
          )
        })

        if (availableFaculty.length > 0) {
          // Determine if this is a core subject based on common patterns
          const coreSubjectPatterns = ['mathematics', 'math', 'english', 'science', 'physics', 'chemistry', 'biology']
          const isCore = coreSubjectPatterns.some(pattern => subject.toLowerCase().includes(pattern))
          
          allCourses.push({
            type: isCore ? 'core' : 'subject',
            name: subject,
            students: this.students.slice(0, Math.min(isCore ? 25 : 20, this.students.length)),
            faculty: availableFaculty,
            priority: isCore ? 1 : 2
          })
        }
      })

      console.log(`📚 Total courses to schedule: ${allCourses.length}`)

      // Sort courses by priority (electives first, then core, then additional)
      allCourses.sort((a, b) => {
        // First sort by priority (0 = highest priority)
        if (a.priority !== b.priority) {
          return (a.priority || 0) - (b.priority || 0)
        }
        // Then sort by type as secondary criteria
        const priority = { 'elective': 1, 'core': 2, 'additional': 3 }
        return priority[a.type] - priority[b.type]
      })

      // Create a systematic schedule filling all days Monday-Friday
      const scheduleGrid = {}
      days.forEach(day => {
        scheduleGrid[day] = {}
        timeSlots.forEach(time => {
          scheduleGrid[day][time] = {
            faculty: null,
            room: null,
            course: null,
            students: []
          }
        })
      })

      // Schedule each course systematically across all days
      // Enhanced distribution to ensure Friday gets equal treatment
      console.log('🗓️ Starting systematic scheduling across all days...')
      
      // First pass: Schedule one session of each course across different days
      // Use round-robin to ensure all days including Friday get courses
      let dayRotation = 0
      allCourses.forEach((course, courseIndex) => {
        let scheduled = false
        let attempts = 0
        
        // Try all days starting with round-robin position
        while (!scheduled && attempts < days.length) {
          const dayIndex = (dayRotation + attempts) % days.length
          const day = days[dayIndex]
          
          // Try each time slot for this day
          for (let timeIndex = 0; timeIndex < timeSlots.length && !scheduled; timeIndex++) {
            const time = timeSlots[timeIndex]
            const slotKey = `${day}-${time}`
            
            if (!usedSlots.has(slotKey)) {
              if (this.tryScheduleCourseAtSlot(course, day, time, slotKey, usedSlots, timetable, facultyWorkload, courseIndex)) {
                scheduled = true
                console.log(`📅 Scheduled ${course.name} on ${day} (rotation position ${dayIndex})`)
              }
            }
          }
          attempts++
        }
        
        // Move to next day for round-robin distribution
        dayRotation = (dayRotation + 1) % days.length
      })
      
      // Second pass: Add additional sessions for important courses
      // Enhanced to ensure Friday gets equal coverage
      console.log('🔄 Second pass: Adding additional sessions...')
      const importantCourses = allCourses.filter(c => c.type === 'elective' || c.type === 'core')
      
      importantCourses.forEach((course, courseIndex) => {
        let additionalSessions = course.type === 'elective' ? 2 : 1 // 2 more for electives, 1 more for core
        let scheduledAdditional = 0
        
        // Start with Friday to ensure it gets priority in second pass
        const dayOrder = ['Friday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
        
        for (let dayIndex = 0; dayIndex < dayOrder.length && scheduledAdditional < additionalSessions; dayIndex++) {
          const day = dayOrder[dayIndex]
          
          for (let timeIndex = 0; timeIndex < timeSlots.length && scheduledAdditional < additionalSessions; timeIndex++) {
            const time = timeSlots[timeIndex]
            const slotKey = `${day}-${time}`
            
            if (!usedSlots.has(slotKey)) {
              if (this.tryScheduleCourseAtSlot(course, day, time, slotKey, usedSlots, timetable, facultyWorkload, courseIndex, scheduledAdditional + 1)) {
                scheduledAdditional++
                console.log(`📅 Added additional session for ${course.name} on ${day}`)
              }
            }
          }
        }
      })

      // Fill remaining empty slots with additional courses
      const remainingSlots = []
      days.forEach(day => {
        timeSlots.forEach(time => {
          const slotKey = `${day}-${time}`
          if (!usedSlots.has(slotKey)) {
            remainingSlots.push({ day, time, slotKey })
          }
        })
      })

      console.log(`📊 Remaining empty slots: ${remainingSlots.length}`)
      
      // Count slots per day to ensure Friday gets equal treatment
      const slotsPerDay = {}
      days.forEach(day => {
        slotsPerDay[day] = remainingSlots.filter(slot => slot.day === day).length
        console.log(`  ${day}: ${slotsPerDay[day]} empty slots`)
      })

      // Prioritize Friday slots if it has more empty slots
      const fridaySlots = remainingSlots.filter(slot => slot.day === 'Friday')
      const otherSlots = remainingSlots.filter(slot => slot.day !== 'Friday')
      const orderedSlots = [...fridaySlots, ...otherSlots]

      // Fill remaining slots with study periods, extra classes, or free time
      orderedSlots.forEach((slot, index) => {
        // Fill 85% of remaining slots to ensure full days
        if (index < orderedSlots.length * 0.85) {
          const studyActivities = [
            'Study Hall', 'Library Time', 'Tutorial Session', 'Lab Practice',
            'Group Discussion', 'Project Work', 'Review Session', 'Extra Practice',
            'Seminar', 'Workshop', 'Research Time', 'Assignment Work'
          ]
          
          const activity = studyActivities[Math.floor(Math.random() * studyActivities.length)]
          const availableFaculty = this.faculty.filter(f => {
            const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
            const facultyInfo = facultyWorkload[facultyId]
            return facultyInfo && facultyInfo.currentHours < facultyInfo.maxHours
          })
          
          if (availableFaculty.length > 0) {
            const selectedFaculty = availableFaculty[Math.floor(Math.random() * availableFaculty.length)]
            const facultyId = selectedFaculty.id || selectedFaculty['Faculty ID'] || selectedFaculty.Faculty_ID
            const selectedRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)]
            
            // Check if faculty is not already scheduled at this time
            const facultyAlreadyScheduled = timetable.some(tSlot => 
              tSlot.facultyId === facultyId &&
              tSlot.day === slot.day &&
              tSlot.timeSlot === slot.time
            )
            
            if (!facultyAlreadyScheduled) {
              timetable.push({
                id: uuidv4(),
                courseCode: activity.replace(/\s+/g, '').substring(0, 6).toUpperCase(),
                courseName: activity,
                facultyId: facultyId,
                facultyName: selectedFaculty.Name || selectedFaculty.name || selectedFaculty.Faculty_Name,
                roomId: selectedRoom.id || selectedRoom['Room ID'] || selectedRoom.Room_ID,
                roomName: selectedRoom.Name || selectedRoom.name || selectedRoom.Room_Name,
                day: slot.day,
                timeSlot: slot.time,
                students: this.students.slice(0, Math.min(10, this.students.length)).map(s => s.id || s['Student ID'] || s.Student_ID),
                studentCount: Math.min(10, this.students.length),
                studentNames: this.students.slice(0, Math.min(10, this.students.length)).map(s => s.Name || s.name || s.Student_Name),
                courseType: 'study'
              })
              
              usedSlots.add(slot.slotKey)
              facultyWorkload[facultyId].currentHours++
              console.log(`📚 Added ${activity} on ${slot.day} at ${slot.time}`)
            }
          }
        }
      })

      console.log(`📊 Faculty workload summary:`)
      Object.entries(facultyWorkload).forEach(([facultyId, workload]) => {
        console.log(`  ${workload.name}: ${workload.currentHours}/${workload.maxHours} hours`)
      })
    }

    console.log(`📅 Generated ${timetable.length} timetable slots`)
    console.log(`📊 Time slots used: ${usedSlots.size} out of ${days.length * timeSlots.length} available`)
    return timetable
  }

  // Fitness function for genetic algorithm
  calculateFitness(timetable) {
    let fitness = 1000
    const conflicts = []

    // Check all AI rules and apply penalties
    timetable.forEach(slot => {
      // Rule violations decrease fitness
      if (!this.validateRule1(slot.students[0], slot.timeSlot, slot.roomId)) {
        fitness -= 100
        conflicts.push({ type: 'student_clash', slot })
      }
      
      if (!this.validateRule2(slot.facultyId, slot.timeSlot, slot.roomId)) {
        fitness -= 100
        conflicts.push({ type: 'faculty_clash', slot })
      }
      
      if (!this.validateRule3(slot.roomId, slot.timeSlot)) {
        fitness -= 100
        conflicts.push({ type: 'room_clash', slot })
      }

      // Workload balance
      const workload = this.calculateWorkloadBalance(slot.facultyId)
      if (!workload.isBalanced) {
        fitness -= 50
      }

      // Soft constraints
      if (this.constraints.ensureRoomCapacity) {
        const room = this.rooms.find(r => r.id === slot.roomId)
        if (room && slot.studentCount > room.capacity) {
          fitness -= 25
        }
      }
    })

    return { fitness, conflicts }
  }

  // Main optimization algorithm
  optimize() {
    console.log('🤖 Starting AI Timetable Optimization...')
    
    // Generate initial population
    const populationSize = 10 // Reduced for faster testing
    let population = []
    
    for (let i = 0; i < populationSize; i++) {
      population.push(this.generateRandomTimetable())
    }

    // Evolution loop (simplified genetic algorithm)
    const generations = 20 // Reduced for faster testing
    let bestTimetable = null
    let bestFitness = -Infinity

    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness for each individual
      const evaluated = population.map(timetable => {
        const result = this.calculateFitness(timetable)
        return { timetable, fitness: result.fitness, conflicts: result.conflicts }
      })

      // Find best solution
      evaluated.sort((a, b) => b.fitness - a.fitness)
      
      if (evaluated[0].fitness > bestFitness) {
        bestFitness = evaluated[0].fitness
        bestTimetable = evaluated[0].timetable
        this.conflicts = evaluated[0].conflicts
      }

      // Early termination if perfect solution found
      if (bestFitness >= 1000) {
        console.log(`✅ Perfect solution found in generation ${gen}`)
        break
      }

      // Selection and crossover (simplified)
      const top50Percent = evaluated.slice(0, Math.floor(populationSize / 2))
      population = top50Percent.map(individual => individual.timetable)
      
      // Add mutations for diversity
      while (population.length < populationSize) {
        const parent = top50Percent[Math.floor(Math.random() * top50Percent.length)]
        const mutated = this.mutate(JSON.parse(JSON.stringify(parent.timetable)))
        population.push(mutated)
      }
    }

    console.log(`🎯 Optimization complete. Best fitness: ${bestFitness}`)
    
    this.timetable = bestTimetable || population[0]
    return this.formatTimetableOutput()
  }

  mutate(timetable) {
    // Simple mutation: change random slot's time or room
    if (timetable.length > 0) {
      const randomSlot = Math.floor(Math.random() * timetable.length)
      const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
      timetable[randomSlot].timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
    }
    return timetable
  }

  formatTimetableOutput() {
    const schedule = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    days.forEach(day => {
      schedule[day] = {}
    })

    this.timetable.forEach(slot => {
      if (!schedule[slot.day][slot.timeSlot]) {
        schedule[slot.day][slot.timeSlot] = []
      }
      schedule[slot.day][slot.timeSlot].push({
        courseCode: slot.courseCode,
        courseName: slot.courseName,
        faculty: slot.facultyName,
        room: slot.roomName,
        students: slot.studentCount
      })
    })

    return {
      schedule,
      conflicts: this.conflicts,
      summary: {
        totalSlots: this.timetable.length,
        conflictCount: this.conflicts.length,
        optimizationScore: this.conflicts.length === 0 ? 100 : Math.max(0, 100 - (this.conflicts.length * 10))
      }
    }
  }
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
    
    const { students, faculty, rooms, constraints } = await request.json()
    
    console.log('🚀 Starting AI Timetable Generation with constraints:', constraints)
    console.log(`📊 Input data: ${students?.length || 0} students, ${faculty?.length || 0} faculty, ${rooms?.length || 0} rooms`)
    
    // Log sample data to debug
    if (students && students.length > 0) {
      console.log('📚 Sample student data:', students[0])
    }
    if (faculty && faculty.length > 0) {
      console.log('👨‍🏫 Sample faculty data:', faculty[0])
    }
    if (rooms && rooms.length > 0) {
      console.log('🏫 Sample room data:', rooms[0])
    }
    
    // Initialize AI Optimizer
    const optimizer = new TimetableOptimizer(students, faculty, rooms, constraints)
    
    // Run AI optimization algorithm
    const result = optimizer.optimize()
    
    // Save generated timetable if DB available
    const timetableRecord = {
      id: uuidv4(),
      timetable: result,
      constraints,
      generatedAt: new Date(),
      semester: 'Fall 2025',
      program: 'B.Ed + FYUP'
    }
    
    if (dbInstance) {
      await dbInstance.collection('generated_timetables').insertOne(timetableRecord)
      console.log('✅ Timetable generation completed successfully and saved to database')
    } else {
      console.log('✅ Timetable generation completed successfully (demo mode - not saved to DB)')
    }
    
    console.log(`📈 Results: ${result.summary.totalSlots} slots, ${result.summary.conflictCount} conflicts, ${result.summary.optimizationScore}% score`)
    
    return handleCORS(NextResponse.json({
      success: true,
      timetable: result,
      id: timetableRecord.id,
      message: 'Timetable generated successfully using AI optimization'
    }))
  } catch (error) {
    console.error('❌ Timetable generation error:', error)
    return handleCORS(NextResponse.json(
      { error: "Failed to generate timetable" },
      { status: 500 }
    ))
  }
}