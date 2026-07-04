import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ComplaintList from './pages/ComplaintList'
import ComplaintDetails from './pages/ComplaintDetails'
import CreateComplaint from './pages/CreateComplaint'
import EditComplaint from './pages/EditComplaint'
import NoticeBoard from './pages/NoticeBoard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '0.875rem',
            borderRadius: '0.5rem',
          },
          success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public-only routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complaints" element={<ComplaintList />} />
            <Route path="/complaints/new" element={<CreateComplaint />} />
            <Route path="/complaints/:complaintId" element={<ComplaintDetails />} />
            <Route path="/complaints/:complaintId/edit" element={<EditComplaint />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
