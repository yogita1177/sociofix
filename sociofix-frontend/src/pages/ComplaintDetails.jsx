import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Tag,
  Calendar,
  History,
  UserRound,
} from 'lucide-react'
import {
  getComplaintById,
  deleteComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
} from '../api/complaints'
import { useAuth } from '../context/AuthContext'
import { isAdminUser } from '../utils/roles'
import Spinner, { FullPageSpinner } from '../components/common/Spinner'
import ConfirmModal from '../components/common/ConfirmModal'
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge'

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'rejected']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

export default function ComplaintDetails() {
  const { complaintId } = useParams()
  const { user } = useAuth()
  const admin = isAdminUser(user)
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [priorityUpdating, setPriorityUpdating] = useState(false)

  const fetchComplaint = () => {
    setIsLoading(true)
    getComplaintById(complaintId)
      .then((res) => setComplaint(res.data.data))
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Failed to load complaint.')
        navigate('/complaints')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchComplaint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteComplaint(complaintId)
      toast.success('Complaint deleted')
      navigate('/complaints')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete complaint.')
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    setStatusUpdating(true)
    try {
      const res = await updateComplaintStatus(complaintId, newStatus)
      setComplaint(res.data.data?.id ? res.data.data : { ...complaint, status: newStatus })
      toast.success('Status updated')
      fetchComplaint()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value
    setPriorityUpdating(true)
    try {
      const res = await updateComplaintPriority(complaintId, newPriority)
      setComplaint(res.data.data?.id ? res.data.data : { ...complaint, priority: newPriority })
      toast.success('Priority updated')
      fetchComplaint()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update priority.')
    } finally {
      setPriorityUpdating(false)
    }
  }

  if (isLoading) return <FullPageSpinner label="Loading complaint…" />
  if (!complaint) return null

  const id = complaint.id || complaint._id
  const history = complaint.history || []

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} />
        Back to complaints
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link to={`/complaints/${id}/edit`} className="btn-secondary">
              <Pencil size={15} />
              Edit
            </Link>
            <button onClick={() => setConfirmDelete(true)} className="btn-danger">
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {complaint.description}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Tag size={16} className="text-slate-400" />
            <span>{complaint.category || '—'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <MapPin size={16} className="text-slate-400" />
            <span>{complaint.block ? `Block ${complaint.block}` : '—'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>{formatDateTime(complaint.created_at || complaint.date)}</span>
          </div>
        </div>

        {admin && (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <label className="label">Update status</label>
              <div className="relative">
                <select
                  className="input capitalize"
                  value={(complaint.status || '').toLowerCase()}
                  onChange={handleStatusChange}
                  disabled={statusUpdating}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {statusUpdating && (
                  <Spinner size={15} className="absolute right-9 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
            <div>
              <label className="label">Update priority</label>
              <div className="relative">
                <select
                  className="input capitalize"
                  value={(complaint.priority || '').toLowerCase()}
                  onChange={handlePriorityChange}
                  disabled={priorityUpdating}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
                {priorityUpdating && (
                  <Spinner size={15} className="absolute right-9 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <History size={18} className="text-primary-600" />
          <h3 className="font-semibold text-slate-900">History</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No status history recorded yet.</p>
        ) : (
          <ol className="relative border-l border-slate-200 pl-6">
            {history
              .slice()
              .reverse()
              .map((item, idx) => (
                <li key={idx} className="mb-6 last:mb-0">
                  <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-600 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">{formatDateTime(item.timestamp)}</span>
                  </div>
                  {item.actor && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <UserRound size={12} />
                      {item.actor}
                    </p>
                  )}
                  {item.note && <p className="mt-1 text-sm text-slate-600">{item.note}</p>}
                </li>
              ))}
          </ol>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete this complaint?"
        description={`"${complaint.title}" will be permanently removed.`}
        confirmLabel="Delete"
        isProcessing={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
