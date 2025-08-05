import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'

// Layout components
import Layout from './components/layout/Layout'

// Public pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TrackingPage from './pages/TrackingPage'
import GuestShipmentPage from './pages/GuestShipmentPage'

// Protected pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import DebugPage from './pages/admin/DebugPage'

// Context providers
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary-600 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'ADMINISTRATOR') {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
      </div>
    )
  }

  if (user) {
    if (user.role === 'ADMINISTRATOR') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/guest-shipment" 
              element={<GuestShipmentPage />} 
            />
            <Route 
              path="/tracking/:trackingNumber" 
              element={<TrackingPage />} 
            />

            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/debug" 
              element={
                <ProtectedRoute adminOnly>
                  <DebugPage />
                </ProtectedRoute>
              } 
            />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#10b981',
                  secondary: '#059669',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#ef4444',
                  secondary: '#dc2626',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
