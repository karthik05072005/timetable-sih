# AI Timetable Generation System - SIH Project

A comprehensive AI-powered timetable generation system built with Next.js for educational institutions. This project features genetic algorithm optimization, modern UI/UX design, and comprehensive data management capabilities.

## 🚀 Live Demo

Deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/karthik05072005/timetable-sih)

## ✨ Features

- **AI-Powered Generation**: Advanced genetic algorithm for optimal timetable creation
- **Modern UI/UX**: Clean, intuitive interface with responsive design
- **Comprehensive Management**: Complete CRUD operations for students, faculty, and rooms
- **Smart Constraints**: Configurable scheduling constraints and preferences
- **Multiple Export Options**: PDF, Excel, and publish functionality
- **Sample Data**: Pre-loaded demo data for immediate testing
- **Lunch Break Integration**: Intelligent break scheduling
- **Real-time Preview**: Instant timetable visualization

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT with demo mode
- **File Processing**: XLSX.js for Excel handling
- **Export**: jsPDF, Puppeteer for PDF generation
- **UI Components**: Radix UI, Shadcn/ui
- **Optimization**: Genetic Algorithm implementation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (optional - demo mode works without DB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karthik05072005/timetable-sih.git
   cd timetable-sih
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configurations:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=timetable_ai
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Login

- **Email**: Any email (demo@example.com)
- **Password**: Any password (demo123)

*The application includes demo mode that works without database setup*

## 📁 Project Structure

```
timetable-sih/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── export-excel/  # Excel export functionality
│   │   ├── export-pdf/    # PDF export functionality
│   │   └── publish-timetable/ # Timetable publishing
│   ├── page.js           # Main application interface
│   └── layout.js         # Root layout
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   └── utils.js          # Utility functions
├── docs/                 # Documentation
├── tests/                # Test files
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `timetable_ai` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |

### Deployment

#### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables**:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: `production`
3. **Deploy automatically on push**

#### Other Platforms

- **Build command**: `npm run build`
- **Start command**: `npm start`
- **Node version**: 18+

## 📊 Usage Guide

### 1. Data Management
- **Upload Excel files** or use **sample data**
- **Edit, add, or delete** records directly in the interface
- **Manage students, faculty, and rooms** with full CRUD operations

### 2. Timetable Generation
- **Configure constraints** (max hours, lunch break, etc.)
- **Set preferences** using intuitive sliders
- **Generate timetable** with AI optimization
- **Preview results** in real-time

### 3. Export Options
- **Export to PDF**: High-quality printable format
- **Export to Excel**: Structured spreadsheet format
- **Publish Timetable**: Save and share with notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/karthik05072005/timetable-sih/issues)
3. Create a [new issue](https://github.com/karthik05072005/timetable-sih/issues/new)

## 🏆 SIH 2024

This project was developed for Smart India Hackathon 2024, focusing on solving real-world problems in educational scheduling through innovative AI solutions.

---

**Built with ❤️ for SIH 2024**


