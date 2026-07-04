import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/complaints': 'Complaints',
  '/complaints/new': 'File a Complaint',
  '/notices': 'Notice Board',
  '/profile': 'My Profile',
}

function resolveTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/complaints/') && pathname.endsWith('/edit')) return 'Edit Complaint'
  if (pathname.startsWith('/complaints/')) return 'Complaint Details'
  return 'SocioFix'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={resolveTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
