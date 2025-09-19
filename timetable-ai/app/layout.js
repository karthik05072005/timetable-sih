import './globals.css'

export const metadata = {
  title: 'Timetable AI - Intelligent Timetable Generation System',
  description: 'AI-Based Timetable Generation System aligned with NEP 2020 for Multidisciplinary Education',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}