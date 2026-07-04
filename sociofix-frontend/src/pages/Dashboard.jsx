import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Megaphone,
  Pin,
  ArrowRight,
  PlusCircle,
  PieChart,
} from 'lucide-react'
import { getDashboardStats } from '../api/dashboard'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import { StatusBadge } from '../components/common/StatusBadge'

const STAT_CARDS = [
  { key: 'total_complaints', label: 'Total Complaints', icon: FileText, color: 'bg-primary-50 text-primary-600' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { key: 'in_progress', label: 'In Progress', icon: AlertTriangle, color: 'bg-blue-50 text-blue-600' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
]

const SECONDARY_CARDS = [
  { key: 'overdue_complaints', label: 'Overdue', icon: Flame, color: 'bg-red-50 text-red-600' },
  { key: 'high_priority_complaints', label: 'High Priority', icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
  { key: 'total_notices', label: 'Total Notices', icon: Megaphone, color: 'bg-slate-100 text-slate-600' },
  { key: 'pinned_notices', label: 'Pinned Notices', icon: Pin, color: 'bg-primary-50 text-primary-600' },
]

const CATEGORY_BAR_COLORS = [
  'bg-primary-600',
  'bg-blue-400',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-slate-400',
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDashboardStats()
      .then((res) => {
        if (active) setStats(res.data.data)
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Could not load dashboard data.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} />
      </div>
    )
  }

  const recentComplaints = stats?.recent_complaints || []
  const recentNotices = stats?.recent_notices || []
  const categoryBreakdown = stats?.complaints_by_category || {}
  const categoryEntries = Object.entries(categoryBreakdown)
  const maxCategoryCount = Math.max(1, ...categoryEntries.map(([, count]) => count))

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening in your society today.
          </p>
        </div>
        <Link to="/complaints/new" className="btn-primary shrink-0">
          <PlusCircle size={17} />
          File a Complaint
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{stats?.[key] ?? 0}</p>
            <p className="mt-0.5 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECONDARY_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card flex items-center gap-3 p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon size={17} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{stats?.[key] ?? 0}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Complaints</h3>
            <Link to="/complaints" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentComplaints.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No complaints yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentComplaints.slice(0, 5).map((c) => (
                <li key={c.id || c._id}>
                  <Link
                    to={`/complaints/${c.id || c._id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.category}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Complaints by Category</h3>
            <PieChart size={17} className="text-slate-400" />
          </div>
          {categoryEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No category data available.</p>
          ) : (
            <ul className="space-y-3">
              {categoryEntries.map(([category, count], idx) => (
                <li key={category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${CATEGORY_BAR_COLORS[idx % CATEGORY_BAR_COLORS.length]}`}
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Latest Notices</h3>
          <Link to="/notices" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentNotices.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No notices posted yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentNotices.slice(0, 4).map((n) => (
              <li key={n.id || n._id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Megaphone size={15} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">{n.content || n.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
