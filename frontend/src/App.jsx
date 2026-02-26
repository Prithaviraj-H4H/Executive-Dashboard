import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'

function AppContent() {
  const { sessionId } = useDashboard()
  return sessionId ? <DashboardPage /> : <UploadPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium',
            style: { borderRadius: '10px' },
            success: { duration: 3000 },
            error: { duration: 5000 },
          }}
        />
      </DashboardProvider>
    </ThemeProvider>
  )
}
