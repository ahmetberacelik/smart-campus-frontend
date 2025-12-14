import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import './App.css'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CoursesPage } from './pages/CoursesPage'
import { MyCoursesPage } from './pages/MyCoursesPage'
import { GradesPage } from './pages/GradesPage'
import { AttendancePage } from './pages/AttendancePage'
import { SectionsPage } from './pages/SectionsPage'

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <DashboardPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <ProfilePage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <CoursesPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <MyCoursesPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <GradesPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <AttendancePage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sections"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="app-main">
                        <SectionsPage />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
