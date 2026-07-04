import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UserRound, Mail, Home, ShieldCheck, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { isAdminUser } from '../utils/roles'
import { FullPageSpinner } from '../components/common/Spinner'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(user)
  const [isLoading, setIsLoading] = useState(!user)

  useEffect(() => {
    getCurrentUser()
      .then((res) => setProfile(res.data.data))
      .catch((err) => toast.error(err.response?.data?.detail || 'Failed to load profile.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <FullPageSpinner label="Loading profile…" />
  if (!profile) return null

  const admin = isAdminUser(profile)
  const initials = (profile.name || profile.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fields = [
    { label: 'Full name', value: profile.name, icon: UserRound },
    { label: 'Email address', value: profile.email, icon: Mail },
    { label: 'Flat / Unit number', value: profile.flat_number, icon: Home },
    { label: 'Role', value: admin ? 'Administrator' : 'Resident', icon: ShieldCheck },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Your account details on SocioFix.</p>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profile.name || 'Resident'}</h3>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        <div className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="btn-danger mt-8 w-full sm:w-auto">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}
