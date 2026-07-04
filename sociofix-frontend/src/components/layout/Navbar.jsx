import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name || user?.email}
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setMenuOpen(false)
                navigate('/profile')
              }}
            >
              <UserRound size={16} />
              My Profile
            </button>
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
