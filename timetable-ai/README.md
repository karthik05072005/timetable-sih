# Timetable AI - Intelligent Timetable Generation System

An AI-powered timetable generation system designed for educational institutions, specifically aligned with NEP 2020 for multidisciplinary education. This system uses advanced algorithms to create conflict-free timetables while optimizing for various constraints and preferences.

## Features

### 🤖 AI-Powered Optimization
- **Genetic Algorithm**: Uses evolutionary computation to find optimal timetable solutions
- **Conflict Resolution**: Automatically prevents faculty, student, and room conflicts
- **Constraint Satisfaction**: Handles hard and soft constraints for realistic scheduling
- **Workload Balancing**: Ensures fair distribution of teaching loads among faculty

### 📊 Data Management
- **Excel File Upload**: Support for .xlsx, .xls, and .csv file formats
- **Student Data**: Manage student information and elective subjects
- **Faculty Data**: Track faculty availability, subjects, and maximum hours
- **Room Management**: Handle classroom and lab capacity constraints

### 🎯 Advanced Configuration
- **Academic Periods**: Support for multiple semesters and academic years
- **Flexible Constraints**: Configurable rules for timetable generation
- **Real-time Validation**: Instant conflict detection and resolution
- **Export Options**: Generate PDF and Excel reports

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Interface**: Clean, modern design with shadcn/ui components
- **Real-time Feedback**: Progress indicators and status updates
- **Dark/Light Mode**: Built-in theme support

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **UI Components**: shadcn/ui, Radix UI
- **File Processing**: XLSX.js for Excel file handling
- **Authentication**: JWT-based authentication
- **Styling**: Tailwind CSS with custom design system

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Yarn package manager (recommended)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timetable-generation-2
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=timetable_ai

   # JWT Configuration
   JWT_SECRET=timetable-ai-secret-key-2024

   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000

   # Next.js Configuration
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas for cloud database
   ```

5. **Run the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Login
- Use any email and password combination for demo purposes
- The system will create a default admin account on first login

### 2. Upload Data
- Navigate to the Dashboard or Data Management section
- Upload Excel files containing:
  - **Students**: Student ID, Name, Class, Section, Electives
  - **Faculty**: Faculty ID, Name, Subjects, Availability, Max Hours
  - **Rooms**: Room ID, Name, Type, Capacity, Equipment

### 3. Configure Constraints
- Go to Timetable Generation section
- Set your preferences:
  - Prevent faculty clashes
  - Ensure room capacity
  - Minimum break time
  - Workload balancing
  - Advanced preferences

### 4. Generate Timetable
- Click "Generate Timetable" to start the AI optimization process
- Monitor progress in real-time
- View the generated timetable with conflict analysis

### 5. Export and Manage
- Export timetables to PDF or Excel
- Publish timetables for faculty and students
- Make adjustments and regenerate as needed

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/upload` - File upload and processing
- `POST /api/generate-timetable` - AI timetable generation
- `GET /api/data` - Retrieve uploaded data
- `GET /api/timetables` - Get generated timetables

## File Format Requirements

### Students Excel File
| Student ID | Name | Class | Section | Electives |
|------------|------|-------|---------|-----------|
| S001 | John Doe | B.Ed | A | English,Math |

### Faculty Excel File
| Faculty ID | Name | Subjects | Availability | Max Hours |
|------------|------|----------|--------------|-----------|
| F001 | Dr. Smith | English,Literature | Mon-Fri | 20 |

### Rooms Excel File
| Room ID | Name | Type | Capacity | Equipment |
|---------|------|------|----------|-----------|
| R001 | Room 301 | Classroom | 40 | Projector |

## AI Algorithm Details

The system uses a genetic algorithm approach:

1. **Initial Population**: Generates random timetable configurations
2. **Fitness Evaluation**: Scores each solution based on constraint violations
3. **Selection**: Keeps the best-performing solutions
4. **Crossover**: Combines successful solutions
5. **Mutation**: Introduces random changes for diversity
6. **Evolution**: Repeats until optimal solution is found

### Constraint Types

**Hard Constraints (Must be satisfied):**
- No student can be in two places at once
- No faculty can teach two classes simultaneously
- No room can host multiple classes at the same time

**Soft Constraints (Optimized for):**
- Faculty workload balancing
- Room capacity utilization
- Minimizing empty periods
- Break time requirements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## Roadmap

- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] Integration with existing school management systems
- [ ] Mobile app development
- [ ] Real-time collaboration features
- [ ] Advanced AI models for better optimization

---

**Built with ❤️ for educational institutions**

