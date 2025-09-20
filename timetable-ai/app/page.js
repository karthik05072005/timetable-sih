'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, Brain, Calendar, Settings, Users, BookOpen, Building2, FileSpreadsheet, Menu, X, Download, Pencil, Trash2, Plus, LogOut } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { toast, Toaster } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    students: null,
    faculty: null,
    rooms: null
  })
  const [timetableData, setTimetableData] = useState(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [constraints, setConstraints] = useState({
    preventFacultyClashes: true,
    ensureRoomCapacity: true,
    minBreakTime: 10,
    balanceWorkload: true,
    workloadLevel: 1,
    preferredGirls: 2,
    minimizeEmptyPeriods: true,
    maxConsecutiveFaculty: 3
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState({ students: null, faculty: null, rooms: null })
  const [dataByType, setDataByType] = useState({ 
    students: [
      { id: 'S001', 'Student ID': 'S001', Name: 'Arjun Mehta', Class: '2nd', Section: 'A', Electives: 'AI, Data Science' },
      { id: 'S002', 'Student ID': 'S002', Name: 'Riya Sharma', Class: '2nd', Section: 'A', Electives: 'AI, Cyber Sec' },
      { id: 'S003', 'Student ID': 'S003', Name: 'Kiran Patel', Class: '2nd', Section: 'B', Electives: 'ML, IoT' },
      { id: 'S004', 'Student ID': 'S004', Name: 'Sneha Rao', Class: '2nd', Section: 'B', Electives: 'Data Science' },
      { id: 'S005', 'Student ID': 'S005', Name: 'Devansh Gupta', Class: '2nd', Section: 'A', Electives: 'Cyber Sec, IoT' }
    ],
    faculty: [
      { id: 'F001', 'Faculty ID': 'F001', Name: 'Dr. Anjali Nair', Subjects: 'Artificial Intelligence, ML', Availability: 'Mon-Fri 9am-4pm', 'Max Hours': '12' },
      { id: 'F002', 'Faculty ID': 'F002', Name: 'Prof. Rajesh Iyer', Subjects: 'Data Science, Big Data, Cyber Security', Availability: 'Mon-Fri 10am-5pm', 'Max Hours': '10' },
      { id: 'F003', 'Faculty ID': 'F003', Name: 'Dr. Kavita Joshi', Subjects: 'Cyber Security, Networks', Availability: 'Tue-Thu 9am-12pm', 'Max Hours': '8' },
      { id: 'F004', 'Faculty ID': 'F004', Name: 'Prof. Manoj Rao', Subjects: 'IoT, Embedded Systems', Availability: 'Mon-Wed 11am-3pm', 'Max Hours': '9' },
      { id: 'F005', 'Faculty ID': 'F005', Name: 'Dr. Sameer Kulkarni', Subjects: 'Database, Cloud Computing', Availability: 'Fri 9am-4pm', 'Max Hours': '6' }
    ],
    rooms: [
      { id: 'R101', 'Room ID': 'R101', Name: 'Lecture Hall A', Type: 'Classroom', Capacity: '60', Equipment: 'Projector, Whiteboard' },
      { id: 'R102', 'Room ID': 'R102', Name: 'Lecture Hall B', Type: 'Classroom', Capacity: '50', Equipment: 'Smart Board, AC' },
      { id: 'L201', 'Room ID': 'L201', Name: 'AI Lab', Type: 'Lab', Capacity: '40', Equipment: 'GPUs, Workstations' },
      { id: 'L202', 'Room ID': 'L202', Name: 'Cyber Sec Lab', Type: 'Lab', Capacity: '35', Equipment: 'Firewalls, Virtualization Servers' },
      { id: 'L203', 'Room ID': 'L203', Name: 'Data Science Lab', Type: 'Lab', Capacity: '45', Equipment: 'Python IDEs' }
    ]
  })
  const [dataLoading, setDataLoading] = useState(false)
  const [settings, setSettings] = useState(null)

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics')
      const data = await res.json()
      if (res.ok) {
        setMetrics({
          students: data.students,
          faculty: data.faculty,
          rooms: data.rooms
        })
      }
    } catch (e) {
      // Fallback to sample data counts if API fails
      setMetrics({
        students: dataByType.students.length,
        faculty: dataByType.faculty.length,
        rooms: dataByType.rooms.length
      })
    }
  }

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      setCurrentPage('dashboard')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && currentPage === 'dashboard') {
      fetchMetrics()
    }
  }, [isAuthenticated, currentPage])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const json = await res.json()
        if (res.ok) setSettings(json)
      } catch (_) {
        // Set default settings if API fails
        setSettings({
          profile: { name: 'Administrator', email: 'admin@example.com', phone: '', avatarUrl: '' },
          notifications: { email: true, inApp: true, frequency: 'daily' },
          security: { twoFactorEnabled: false }
        })
      }
    }
    // Load settings when authenticated, regardless of current page
    if (isAuthenticated) {
      loadSettings()
    }
  }, [isAuthenticated])

  // Data Management fetching
  const fetchTypeData = async (type) => {
    try {
      const res = await fetch(`/api/data?type=${type}`)
      const json = await res.json()
      if (res.ok && Array.isArray(json) && json.length > 0) {
        setDataByType(prev => ({ ...prev, [type]: json }))
      } else if (uploadedFiles[type]) {
        // Fallback to recently uploaded, unsaved data (demo mode)
        setDataByType(prev => ({ ...prev, [type]: uploadedFiles[type] }))
      }
      // If no data from API or uploads, keep the default sample data
    } catch (_) {
      // Keep default sample data on error
    }
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    await Promise.all([
      fetchTypeData('students'),
      fetchTypeData('faculty'),
      fetchTypeData('rooms')
    ])
    setDataLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated && currentPage === 'data-management') {
      fetchAllData()
    }
  }, [isAuthenticated, currentPage])

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('Login form submitted with:', loginData)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      console.log('Login response status:', response.status)
      const result = await response.json()
      console.log('Login response data:', result)
      
      if (response.ok) {
        localStorage.setItem('adminToken', result.token)
        setIsAuthenticated(true)
        setCurrentPage('dashboard')
        console.log('Login successful, redirecting to dashboard')
        toast.success('Login successful!')
      } else {
        console.log('Login failed:', result.error)
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed: ' + error.message)
    }
  }

  const handleLogout = () => {
    // Clear all local storage data
    localStorage.removeItem('adminToken')
    
    // Reset all state
    setIsAuthenticated(false)
    setCurrentPage('login')
    setSettings(null)
    setUploadedFiles({ students: null, faculty: null, rooms: null })
    setTimetableData(null)
    setMetrics({ students: 0, faculty: 0, rooms: 0 })
    
    toast.success('Logged out successfully!')
  }

  const handleFileUpload = async (files, type) => {
    if (!files.length) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('type', type)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (response.ok) {
        setUploadedFiles(prev => ({ ...prev, [type]: result.data }))
        toast.success(`${type} data uploaded successfully!`)
        // Refresh metrics after a successful upload
        fetchMetrics()
        // Also refresh data lists if on data management
        if (currentPage === 'data-management') {
          // Seed UI immediately with uploaded data without waiting for DB
          setDataByType(prev => ({ ...prev, [type]: result.data }))
          fetchTypeData(type)
        }
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const generateTimetable = async () => {
    // Use sample data if available, or uploaded files as fallback
    const studentsData = dataByType.students.length > 0 ? dataByType.students : uploadedFiles.students
    const facultyData = dataByType.faculty.length > 0 ? dataByType.faculty : uploadedFiles.faculty
    const roomsData = dataByType.rooms.length > 0 ? dataByType.rooms : uploadedFiles.rooms

    if (!studentsData || !facultyData || !roomsData) {
      toast.error('Please ensure all data (students, faculty, rooms) is available or upload required files')
      return
    }

    setGenerating(true)
    setGenerationProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      const response = await fetch('/api/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: studentsData,
          faculty: facultyData,
          rooms: roomsData,
          constraints
        })
      })
      const result = await response.json()
      
      clearInterval(progressInterval)
      setGenerationProgress(100)
      
      if (response.ok) {
        console.log('Generated timetable:', result.timetable)
        setTimetableData(result.timetable)
        toast.success('Timetable generated successfully!')
        setCurrentPage('view-timetable')
      } else {
        console.error('Generation failed:', result.error)
        toast.error(result.error || 'Generation failed')
      }
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Generation error:', error)
      toast.error('Generation failed: ' + error.message)
    } finally {
      setGenerating(false)
      setTimeout(() => setGenerationProgress(0), 1000)
    }
  }

  const exportToPDF = async () => {
    if (!timetableData) {
      toast.error('No timetable data to export')
      return
    }

    try {
      toast.info('Opening print dialog for PDF export...')
      
      // Use browser's print functionality for reliable PDF generation
      const printWindow = window.open('', '_blank', 'width=1200,height=800')
      const timetableHTML = generateTimetableForPrint(timetableData)
      
      printWindow.document.write(timetableHTML)
      printWindow.document.close()
      
      // Auto-trigger print dialog after content loads
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        toast.success('Print dialog opened! You can save as PDF from the print options or use Ctrl+P.')
      }, 1500)
      
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to open print dialog. Please try the Excel export instead.')
    }
  }

  // Helper function to generate HTML for printing
  const generateTimetableForPrint = (timetableData) => {
    const { schedule, summary } = timetableData
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timetable - Fall 2025</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #2563eb; margin-bottom: 10px; }
          .summary { margin-bottom: 20px; text-align: center; }
          .timetable { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .timetable th, .timetable td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 11px; }
          .timetable th { background-color: #2563eb; color: white; }
          .time-slot { background-color: #f1f5f9; font-weight: bold; }
          .course { background-color: #dbeafe; padding: 4px; margin: 2px 0; border-radius: 3px; }
          @media print { body { margin: 10px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Academic Timetable</h1>
          <div>B.Ed + FYUP • Fall 2025</div>
          <div>Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="summary">
          <strong>Summary:</strong> 
          ${summary?.totalSlots || 0} Total Classes | 
          ${summary?.conflictCount || 0} Conflicts | 
          ${summary?.optimizationScore || 0}% Optimization Score
        </div>
        
        <table class="timetable">
          <tr>
            <th>Time</th>
            ${days.map(day => `<th>${day}</th>`).join('')}
          </tr>
          ${timeSlots.map(time => `
            <tr>
              <td class="time-slot">${time}</td>
              ${days.map(day => {
                const daySchedule = schedule?.[day]?.[time] || []
                return `
                  <td>
                    ${daySchedule.map(slot => {
                    const courseData = slot.course || ''
                    const [courseCode, courseName] = courseData.includes(' - ') ? courseData.split(' - ') : [courseData, '']
                    return `
                      <div class="course">
                        <strong>${courseCode}</strong><br>
                        ${courseName}<br>
                        <small>${slot.faculty}<br>${slot.room}</small>
                      </div>
                    `
                  }).join('')}
                  </td>
                `
              }).join('')}
            </tr>
          `).join('')}
        </table>
        
        <div style="text-align: center; font-size: 12px; color: #666;">
          Generated by Timetable AI • Intelligent Timetable Generation System
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `
  }

  const exportToExcel = async () => {
    if (!timetableData) {
      toast.error('No timetable data to export')
      return
    }

    try {
      toast.info('Generating Excel file... This may take a moment.')
      
      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableData,
          metadata: {
            semester: 'Fall 2025',
            program: 'B.Ed + FYUP',
            year: new Date().getFullYear()
          }
        })
      })

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob()
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `timetable-fall-2025-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        
        toast.success('Excel file exported successfully!')
      } else {
        const errorData = await response.json()
        toast.error('Failed to export Excel: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export Excel: ' + error.message)
    }
  }

  const publishTimetable = async () => {
    if (!timetableData) {
      toast.error('No timetable data to publish')
      return
    }

    try {
      toast.info('Publishing timetable...')
      
      const response = await fetch('/api/publish-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableData,
          metadata: {
            semester: 'Fall 2025',
            program: 'B.Ed + FYUP',
            year: new Date().getFullYear(),
            publishedAt: new Date().toISOString(),
            publishedBy: settings?.profile?.name || 'Administrator'
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Timetable published successfully! Students and faculty can now access it.')
        console.log('Published timetable:', result)
      } else {
        const errorData = await response.json()
        toast.error('Failed to publish timetable: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish timetable: ' + error.message)
    }
  }

  // File dropzone components
  const FileUploadZone = ({ title, description, expectedColumns, onUpload, uploaded, type }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onUpload(files, type),
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv']
      },
      multiple: false
    })

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploaded ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {uploaded ? (
              <div>
                <p className="text-green-600 font-medium">✓ File uploaded successfully</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  {uploaded.length} records loaded
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop the file here' : 'Drop Excel file here or click to browse'}
                </p>
                <Button variant="outline" disabled={uploading}>
                  Choose File
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium">Expected columns:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {expectedColumns.map(col => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Toaster />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">TIMETABLE AI</span>
            </div>
            <CardTitle className="text-2xl">Intelligent Timetable Optimization System</CardTitle>
            <CardDescription>Administrator Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter any email (demo accepts any credentials)"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter any password (demo accepts any credentials)"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-sm">
                  Forgot Password?
                </Button>
              </div>
            </form>
          </CardContent>
          <div className="text-center pb-4">
            <p className="text-xs text-muted-foreground">© 2025 Smart Solutions</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-slate-900 text-white p-4 z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">TIMETABLE AI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          <Button
            variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage('dashboard')
              setSidebarOpen(false)
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentPage === 'data-management' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage('data-management')
              setSidebarOpen(false)
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Data Management
          </Button>
          <Button
            variant={currentPage === 'generate' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage('generate')
              setSidebarOpen(false)
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            Timetable Generation
          </Button>
          <Button
            variant={currentPage === 'view-timetable' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage('view-timetable')
              setSidebarOpen(false)
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Timetables
          </Button>
          <Button
            variant={currentPage === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage('settings')
              setSidebarOpen(false)
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>

        <div className="mt-8 border-t border-slate-700 pt-4">
          <div className="mb-2 text-xs text-slate-400 uppercase font-semibold tracking-wide">Account</div>
          <Button 
            variant="destructive" 
            onClick={handleLogout} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      } p-6`}>
        {/* Header with Sidebar Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden lg:block">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Mobile Logout Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {settings?.profile?.name || 'Administrator'}!</h1>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => setCurrentPage('generate')}>Generate Timetable</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mb-2"
                    onClick={() => setCurrentPage('generate')}
                  >
                    Generate Timetable
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.students ?? dataByType.students.length}</div>
                    <p className="text-sm text-muted-foreground">Students Available</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.faculty ?? dataByType.faculty.length}</div>
                    <p className="text-sm text-muted-foreground">Faculty Available</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.rooms ?? dataByType.rooms.length}</div>
                    <p className="text-sm text-muted-foreground">Rooms Available</p>
                  </div>
                </CardContent>
              </Card>

              {/* Removed Notifications and Recent Activity per request */}
            </div>

            {/* Data Management Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Upload Excel files to configure your timetable data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FileUploadZone
                    title="Students & Electives"
                    description="Upload Excel file with student data and elective subjects"
                    expectedColumns={['Student ID', 'Name', 'Class', 'Section', 'Electives']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.students}
                    type="students"
                  />
                  <FileUploadZone
                    title="Faculty & Subjects"
                    description="Upload Excel file with faculty data, subjects, and availability"
                    expectedColumns={['Faculty ID', 'Name', 'Subjects', 'Availability', 'Max Hours']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.faculty}
                    type="faculty"
                  />
                  <FileUploadZone
                    title="Classrooms & Labs"
                    description="Upload Excel file with classroom and lab data with capacity"
                    expectedColumns={['Room ID', 'Name', 'Type', 'Capacity', 'Equipment']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.rooms}
                    type="rooms"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'generate' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Generate Timetable</h1>
              <p className="text-muted-foreground">Configure AI optimization parameters and generate conflict-free timetables</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Academic Year</Label>
                    <Select defaultValue="fall-2025">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall-2025">Fall 2025</SelectItem>
                        <SelectItem value="spring-2025">Spring 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Select Semester</Label>
                    <Select defaultValue="bed-fyup">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bed-fyup">B.Ed + FYUP</SelectItem>
                        <SelectItem value="med">M.Ed</SelectItem>
                        <SelectItem value="itep">ITEP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Constraints & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Prevent all faculty clashes</Label>
                    <Switch 
                      checked={constraints.preventFacultyClashes}
                      onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, preventFacultyClashes: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ensure room capacity respected</Label>
                    <Switch 
                      checked={constraints.ensureRoomCapacity}
                      onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, ensureRoomCapacity: checked }))}
                    />
                  </div>
                  <div>
                    <Label>Minimum break time between (minutes): {constraints.minBreakTime}</Label>
                    <Slider
                      value={[constraints.minBreakTime]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, minBreakTime: value }))}
                      max={60}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Soft Constraints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Faculty Workload Balancing</Label>
                    <Switch 
                      checked={constraints.balanceWorkload}
                      onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, balanceWorkload: checked }))}
                    />
                  </div>
                  <div>
                    <Label>Workload Level: {constraints.workloadLevel}</Label>
                    <Slider
                      value={[constraints.workloadLevel]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, workloadLevel: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Preferred Language Teachers: {constraints.preferredGirls}</Label>
                    <Slider
                      value={[constraints.preferredGirls]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, preferredGirls: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Preferences removed per request */}
            </div>

            {generating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Brain className="h-6 w-6 animate-pulse text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Generating timetable... This may take a few minutes.</p>
                      <Progress value={generationProgress} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        AI Brain processing constraints and optimizing schedule...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={generateTimetable} disabled={generating} className="flex-1">
                {generating ? 'Generating...' : 'Generate Timetable'}
              </Button>
              <Button variant="outline">Save Draft</Button>
              <Button variant="outline">Reset Parameters</Button>
            </div>
          </div>
        )}

        {currentPage === 'view-timetable' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">View & Manage Timetables</h1>
                {timetableData && (
                  <p className="text-muted-foreground">
                    Generated timetable with {timetableData.summary?.totalSlots || 0} slots, 
                    {timetableData.summary?.conflictCount || 0} conflicts, 
                    {timetableData.summary?.optimizationScore || 0}% optimization score
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToPDF} disabled={!timetableData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
                <Button variant="outline" onClick={exportToExcel} disabled={!timetableData}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button onClick={publishTimetable} disabled={!timetableData} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Publish Timetable
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Select defaultValue="fall-2025">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall-2025">Fall 2025</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="bed-fyup">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bed-fyup">B.Ed + FYUP</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ {timetableData?.summary?.conflictCount === 0 ? 'No conflicts detected' : `${timetableData?.summary?.conflictCount} conflicts`}
                </Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-4 font-medium">Time</div>
                  <div className="p-4 font-medium border-l">Monday</div>
                  <div className="p-4 font-medium border-l">Tuesday</div>
                  <div className="p-4 font-medium border-l">Wednesday</div>
                  <div className="p-4 font-medium border-l">Thursday</div>
                  <div className="p-4 font-medium border-l">Friday</div>
                  <div className="p-4 font-medium border-l">Saturday</div>
                  <div className="p-4 font-medium border-l">Sunday</div>
                </div>
                
                {/* Generated timetable data */}
                {timetableData ? (
                  (() => {
                    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    
                    return timeSlots.map((time, i) => {
                      const slots = days.map(day => {
                        const daySchedule = timetableData.schedule?.[day]?.[time] || []
                        return daySchedule.map(slot => {
                          const title = slot.courseName || ''
                          const code = slot.courseCode || ''
                          const fac = slot.faculty || ''
                          const room = slot.room || ''
                          const parts = []
                          if (title) parts.push(title)
                          if (fac) parts.push(fac)
                          if (room) parts.push(room)
                          return parts.join(' • ')
                        }).join(', ')
                      })
                      
                      return (
                        <div key={i} className="grid grid-cols-8 border-b">
                          <div className="p-4 bg-muted/30 font-medium">{time}</div>
                          {slots.map((slot, j) => (
                            <div key={j} className="p-2 border-l min-h-16">
                              {slot && (
                                <div className={`p-2 rounded text-xs font-medium ${
                                  slot.includes('Lunch Break') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                  slot.includes('English') ? 'bg-blue-100 text-blue-800' :
                                  slot.includes('Mathematics') ? 'bg-green-100 text-green-800' :
                                  slot.includes('Science') ? 'bg-purple-100 text-purple-800' :
                                  slot.includes('History') ? 'bg-orange-100 text-orange-800' :
                                  slot.includes('Computer') ? 'bg-pink-100 text-pink-800' :
                                  slot.includes('Data Science') ? 'bg-indigo-100 text-indigo-800' :
                                  slot.includes('AI') || slot.includes('Artificial Intelligence') ? 'bg-cyan-100 text-cyan-800' :
                                  slot.includes('ML') || slot.includes('Machine Learning') ? 'bg-teal-100 text-teal-800' :
                                  slot.includes('Cyber') || slot.includes('Security') ? 'bg-red-100 text-red-800' :
                                  slot.includes('IoT') || slot.includes('Embedded') ? 'bg-emerald-100 text-emerald-800' :
                                  slot.includes('Database') || slot.includes('Cloud') ? 'bg-slate-100 text-slate-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {slot}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })
                  })()
                ) : (
                  <div className="col-span-8 p-8 text-center text-muted-foreground">
                    No timetable generated yet. Please generate a timetable first.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend and extra controls removed per request */}
          </div>
        )}

        {currentPage === 'data-management' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Data Management</h1>
              <p className="text-muted-foreground">Upload and manage your academic data</p>
            </div>

            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Manage Courses</CardTitle>
                      <Button disabled>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Add New Course
                      </Button>
                    </div>
                    <CardDescription>Course management and configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input placeholder="Search courses..." disabled />
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">Courses are static in this demo</p>
                        <p className="text-sm text-muted-foreground">
                          You can edit Students, Faculty, and Rooms data in their respective tabs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faculty">
                <EditableDraggableList
                  title="Faculty"
                  type="faculty"
                  records={dataByType.faculty}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('faculty')}
                />
              </TabsContent>

              <TabsContent value="students">
                <EditableDraggableList
                  title="Students"
                  type="students"
                  records={dataByType.students}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('students')}
                />
              </TabsContent>

              <TabsContent value="rooms">
                <EditableDraggableList
                  title="Rooms"
                  type="rooms"
                  records={dataByType.rooms}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('rooms')}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your profile, security, and notifications</p>
            </div>

            <SettingsPanel settings={settings} onSettingsUpdate={setSettings} />
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsPanel({ settings, onSettingsUpdate }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatarUrl: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [twoFA, setTwoFA] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, inApp: true, frequency: 'daily' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({ profile: false, security: false, notifications: false, password: false })

  useEffect(() => {
    if (settings) {
      setProfile(settings.profile || { name: '', email: '', phone: '', avatarUrl: '' })
      setTwoFA(!!settings.security?.twoFactorEnabled)
      setNotifications(settings.notifications || { email: true, inApp: true, frequency: 'daily' })
      setLoading(false)
    }
  }, [settings])

  const saveProfile = async () => {
    setSaving(prev => ({ ...prev, profile: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })
      if (response.ok) {
        toast.success('Profile updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, profile }))
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(prev => ({ ...prev, profile: false }))
    }
  }

  const saveSecurity = async () => {
    setSaving(prev => ({ ...prev, security: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ security: { twoFactorEnabled: twoFA } })
      })
      if (response.ok) {
        toast.success('Security updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, security: { ...prev.security, twoFactorEnabled: twoFA } }))
      } else {
        toast.error('Failed to update security')
      }
    } catch (error) {
      console.error('Security update error:', error)
      toast.error('Failed to update security')
    } finally {
      setSaving(prev => ({ ...prev, security: false }))
    }
  }

  const saveNotifications = async () => {
    setSaving(prev => ({ ...prev, notifications: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications })
      })
      if (response.ok) {
        toast.success('Notifications updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, notifications }))
      } else {
        toast.error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Notifications update error:', error)
      toast.error('Failed to update notifications')
    } finally {
      setSaving(prev => ({ ...prev, notifications: false }))
    }
  }

  const changePassword = async () => {
    if (!passwords.current) {
      toast.error('Current password is required')
      return
    }
    if (!passwords.next) {
      toast.error('New password is required')
      return
    }
    if (passwords.next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }
    
    setSaving(prev => ({ ...prev, password: true }))
    try {
      // In a real app, you'd validate current password and update it
      // For demo purposes, we'll just simulate the API call
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          security: { 
            ...settings?.security, 
            passwordChanged: true,
            lastPasswordChange: new Date().toISOString()
          } 
        })
      })
      
      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswords({ current: '', next: '', confirm: '' })
        // Update parent settings state
        onSettingsUpdate(prev => ({ 
          ...prev, 
          security: { 
            ...prev.security, 
            passwordChanged: true,
            lastPasswordChange: new Date().toISOString()
          } 
        }))
      } else {
        toast.error('Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(prev => ({ ...prev, password: false }))
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={profile.name || ''} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={profile.email || ''} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone || ''} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input value={profile.avatarUrl || ''} onChange={(e) => setProfile(p => ({ ...p, avatarUrl: e.target.value }))} />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving.profile}>
            {saving.profile ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Two-factor authentication and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable 2FA</Label>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
          <Button onClick={saveSecurity} variant="outline" disabled={saving.security}>
            {saving.security ? 'Saving...' : 'Save Security'}
          </Button>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords(ps => ({ ...ps, current: e.target.value }))} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={passwords.next} onChange={(e) => setPasswords(ps => ({ ...ps, next: e.target.value }))} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords(ps => ({ ...ps, confirm: e.target.value }))} />
            </div>
          </div>
          <Button onClick={changePassword} disabled={saving.password}>
            {saving.password ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Email and in-app notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications(n => ({ ...n, email: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>In-app Notifications</Label>
            <Switch checked={notifications.inApp} onCheckedChange={(v) => setNotifications(n => ({ ...n, inApp: v }))} />
          </div>
          <div>
            <Label>Frequency</Label>
            <Select value={notifications.frequency} onValueChange={(v) => setNotifications(n => ({ ...n, frequency: v }))}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={saveNotifications} disabled={saving.notifications}>
            {saving.notifications ? 'Saving...' : 'Save Notifications'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
// Editable and draggable list for Data Management
function EditableDraggableList({ title, type, records, loading, onReload }) {
  const [localRows, setLocalRows] = useState(records || [])
  const [dragIndex, setDragIndex] = useState(null)

  useEffect(() => {
    setLocalRows(records || [])
  }, [records])

  // Derive visible columns from first record
  const reserved = new Set(['id', 'type', 'uploadedAt', 'order'])
  const columns = localRows.length
    ? Object.keys(localRows[0]).filter(k => !reserved.has(k))
    : []

  const handleChange = async (rowId, key, value) => {
    setLocalRows(prev => prev.map(r => r.id === rowId ? { ...r, [key]: value } : r))
    try {
      await fetch('/api/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id: rowId, updates: { [key]: value } })
      })
      toast.success('Saved')
    } catch (_) {
      toast.error('Save failed')
    }
  }

  const handleDrop = async (toIndex) => {
    if (dragIndex == null || toIndex == null || dragIndex === toIndex) return
    const next = [...localRows]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(toIndex, 0, moved)
    setLocalRows(next)
    setDragIndex(null)
    try {
      await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, orderedIds: next.map(r => r.id) })
      })
      toast.success('Order updated')
    } catch (_) {
      toast.error('Reorder failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage {title}</CardTitle>
                            <div className="flex gap-2">
            <Button variant="outline" onClick={onReload} disabled={loading}>Refresh</Button>
                            </div>
                          </div>
        <CardDescription>Drag rows to reorder. Click any field to edit.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : localRows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No records found. Upload a file to get started.</div>
        ) : (
          <div className="overflow-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')} 120px` }}>
                <div className="p-2 text-xs uppercase text-muted-foreground">#</div>
                {columns.map(col => (
                  <div key={col} className="p-2 text-xs uppercase text-muted-foreground">{col}</div>
                ))}
                <div className="p-2 text-xs uppercase text-muted-foreground">Actions</div>
                      </div>
              {localRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid border-b items-center"
                  style={{ gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')} 120px` }}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(idx)}
                >
                  <div className="p-2 text-xs text-muted-foreground cursor-grab">{idx + 1}</div>
                  {columns.map(col => (
                    <EditableCell
                      key={col}
                      value={row[col] ?? ''}
                      onChange={(val) => handleChange(row.id, col, val)}
                    />
                  ))}
                  <div className="p-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onReload()}>
                        <Pencil className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        try {
                          await fetch(`/api/data?type=${type}&id=${row.id}`, { method: 'DELETE' })
                          setLocalRows(prev => prev.filter(r => r.id !== row.id))
                          toast.success('Deleted')
                        } catch (_) {
                          toast.error('Delete failed')
                        }
                      }}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
                  </CardContent>
                </Card>
  )
}

function EditableCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? '')

  useEffect(() => {
    setVal(value ?? '')
  }, [value])

  const commit = () => {
    setEditing(false)
    if (val !== value) onChange(val)
  }

  return (
    <div className="p-2">
      {editing ? (
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
          autoFocus
        />
      ) : (
        <div className="text-sm cursor-text" onClick={() => setEditing(true)}>
          {String(value ?? '')}
          </div>
        )}
    </div>
  )
}