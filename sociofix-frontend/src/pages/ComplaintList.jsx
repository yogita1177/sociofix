import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusCircle, Search, FileText, Trash2, Eye, Pencil, SlidersHorizontal, X } from 'lucide-react'
import { getMyComplaints, getAllComplaints, deleteComplaint } from '../api/complaints'
import { useAuth } from '../context/AuthContext'
import { isAdminUser } from '../utils/roles'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge'

const STATUS_OPTIONS = ['all', 'pending', 'in_progress', 'resolved', 'rejected']
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'urgent']
const CATEGORY_OPTIONS = ['all', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Other']

const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  category: 'all',
  block: '',
  date: '',
  search: '',
}

export default function ComplaintList() {
  const { user } = useAuth()
  const admin = isAdminUser(user)

  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Admins query the society-wide endpoint with server-side filters.
  // Residents fetch their own complaints and filter client-side.
  useEffect(() => {
    let active = true
    setIsLoading(true)

    const request = admin
      ? getAllComplaints(filters)
      : getMyComplaints()

    request
      .then((res) => {
        if (active) {
          setComplaints(Array.isArray(res.data.data) ? res.data.data : [])
    }
  })
      .catch((err) => toast.error(err.response?.data?.detail || 'Failed to load complaints.'))
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, filters.status, filters.priority, filters.category, filters.block, filters.date, filters.search])

  const displayedComplaints = useMemo(() => {
    if (admin) return complaints
    // Client-side filtering for the resident "my complaints" view.
    return complaints.filter((c) => {
      const matchesStatus = filters.status === 'all' || (c.status || '').toLowerCase() === filters.status
      const matchesPriority = filters.priority === 'all' || (c.priority || '').toLowerCase() === filters.priority
      const matchesCategory = filters.category === 'all' || c.category === filters.category
      const matchesBlock = !filters.block || (c.block || '').toLowerCase().includes(filters.block.toLowerCase())
      const matchesDate = !filters.date || (c.created_at || c.date || '').slice(0, 10) === filters.date
      const matchesSearch =
        !filters.search ||
        c.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.category?.toLowerCase().includes(filters.search.toLowerCase())
      return matchesStatus && matchesPriority && matchesCategory && matchesBlock && matchesDate && matchesSearch
    })
  }, [admin, complaints, filters])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteComplaint(deleteTarget.id || deleteTarget._id)
      toast.success('Complaint deleted')
      setComplaints((prev) => prev.filter((c) => (c.id || c._id) !== (deleteTarget.id || deleteTarget._id)))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete complaint.')
    } finally {
      setIsDeleting(false)
    }
  }

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const clearFilters = () => setFilters(DEFAULT_FILTERS)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && !(key === 'search')
  ).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {admin ? 'All Complaints' : 'My Complaints'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {admin
              ? 'Review and manage maintenance issues across the society.'
              : "Track and manage maintenance issues you've raised."}
          </p>
        </div>
        <Link to="/complaints/new" className="btn-primary shrink-0">
          <PlusCircle size={17} />
          File a Complaint
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or category…"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary shrink-0 ${activeFilterCount > 0 ? 'border-primary-400 bg-primary-50' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label">Status</label>
              <select className="input capitalize" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input capitalize" value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p === 'all' ? 'All priorities' : p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All categories' : c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Block</label>
              <input
                type="text"
                placeholder="e.g. A"
                className="input"
                value={filters.block}
                onChange={(e) => updateFilter('block', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={filters.date}
                onChange={(e) => updateFilter('date', e.target.value)}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end lg:col-span-5">
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600">
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      ) : displayedComplaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description={
            complaints.length === 0
              ? "No complaints have been filed yet."
              : 'Try adjusting your search or filters.'
          }
          action={
            complaints.length === 0 && (
              <Link to="/complaints/new" className="btn-primary">
                <PlusCircle size={16} />
                File a Complaint
              </Link>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Block</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {displayedComplaints.map((c) => {
              const id = c.id || c._id
              return (
                <li key={id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-4">
                    <Link to={`/complaints/${id}`} className="font-medium text-slate-800 hover:text-primary-600">
                      {c.title}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{c.description}</p>
                  </div>
                  <div className="text-sm text-slate-600 sm:col-span-2">{c.category || '—'}</div>
                  <div className="sm:col-span-2">
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <div className="sm:col-span-2">
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-sm text-slate-500 sm:col-span-1">{c.block || '—'}</div>
                  <div className="flex items-center gap-1 sm:col-span-1 sm:justify-end">
                    <Link
                      to={`/complaints/${id}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600"
                      aria-label="View"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      to={`/complaints/${id}/edit`}
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this complaint?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        isProcessing={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
