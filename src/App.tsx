import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import './App.css'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { MyCoursesPage } from './pages/MyCoursesPage'
import { GradesPage } from './pages/GradesPage'
import { GradebookPage } from './pages/GradebookPage'
import { AttendancePage } from './pages/AttendancePage'
import { MyAttendancePage } from './pages/MyAttendancePage'
import { StartAttendancePage } from './pages/StartAttendancePage'
import { GiveAttendancePage } from './pages/GiveAttendancePage'
import { AttendanceReportPage } from './pages/AttendanceReportPage'
import { ExcuseRequestsPage } from './pages/ExcuseRequestsPage'
import { SectionsPage } from './pages/SectionsPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { MenuPage } from './pages/meals/MenuPage'
import { MyReservationsPage } from './pages/meals/MyReservationsPage'
import { QrScannerPage } from './pages/meals/QrScannerPage'
import { WalletPage } from './pages/WalletPage'
import { EventsPage } from './pages/events/EventsPage'
import { EventDetailPage } from './pages/events/EventDetailPage'
import { MyEventsPage } from './pages/events/MyEventsPage'
import { EventCheckInPage } from './pages/events/EventCheckInPage'
import { MySchedulePage } from './pages/schedule/MySchedulePage'
import { GenerateSchedulePage } from './pages/schedule/GenerateSchedulePage'
import { ClassroomReservationsPage } from './pages/reservations/ClassroomReservationsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AssignCourseToFacultyPage } from './pages/admin/AssignCourseToFacultyPage'

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
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
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NotificationsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CoursesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CourseDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyCoursesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GradesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gradebook/:sectionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GradebookPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AttendancePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-attendance"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyAttendancePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/start"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <StartAttendancePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/give/:sessionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GiveAttendancePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/session/:sessionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SessionDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/report/:sectionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AttendanceReportPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/excuse-requests"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExcuseRequestsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sections"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SectionsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Meal Service Pages */}
            <Route
              path="/meals/menu"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MenuPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/reservations"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyReservationsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/scan"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QrScannerPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WalletPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Event Management Pages */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EventsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EventDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyEventsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/checkin"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EventCheckInPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* Scheduling Pages */}
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MySchedulePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scheduling/generate"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GenerateSchedulePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClassroomReservationsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Analytics */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole={['admin', 'ADMIN']}>
                  <MainLayout>
                    <AdminAnalyticsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin - Hocalara Ders Atama */}
            <Route
              path="/admin/assign-courses"
              element={
                <ProtectedRoute requiredRole={['admin', 'ADMIN']}>
                  <MainLayout>
                    <AssignCourseToFacultyPage />
                  </MainLayout>
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
          theme={theme}
        />
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
