import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Megaphone, Pin, PlusCircle, Pencil, Trash2, X, Calendar } from 'lucide-react'
import { getNotices, getPinnedNotices, createNotice, updateNotice, deleteNotice } from '../api/notices'
import { useAuth } from '../context/AuthContext'
import { isAdminUser } from '../utils/roles'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'

function formatDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return null
  }
}

function NoticeFormModal({ open, initialValues, onClose, onSaved }) {
  const isEdit = !!initialValues
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues || { title: '', content: '', pinned: false },
  })

  useEffect(() => {
    reset(initialValues || { title: '', content: '', pinned: false })
  }, [initialValues, reset])

  if (!open) return null

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateNotice(initialValues.id || initialValues._id, data)
        toast.success('Notice updated')
      } else {
        await createNotice(data)
        toast.success('Notice posted')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save notice.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl sm:p-7">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Edit Notice' : 'Post a New Notice'}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="notice-title">
              Title
            </label>
            <input
              id="notice-title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="notice-content">
              Content
            </label>
            <textarea
              id="notice-content"
              rows={4}
              className={`input resize-none ${errors.content ? 'input-error' : ''}`}
              {...register('content', { required: 'Content is required' })}
            />
            {errors.content && <p className="error-text">{errors.content.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              {...register('is_pinned')}
            />
            Pin this notice to the top
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Spinner size={16} className="text-white" />}
              {isEdit ? 'Save Changes' : 'Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NoticeBoard() {
  const { user } = useAuth()
  const admin = isAdminUser(user)

  const [notices, setNotices] = useState([])
  const [pinnedNotices, setPinnedNotices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formState, setFormState] = useState({ open: false, notice: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchNotices = () => {
    setIsLoading(true)
    Promise.all([getNotices(), getPinnedNotices()])
      .then(([allRes, pinnedRes]) => {
        setNotices(
          Array.isArray(allRes.data.data) ? allRes.data.data : []
        )
        setPinnedNotices(
          Array.isArray(pinnedRes.data.data) ? pinnedRes.data.data : []
      )
      })
      .catch((err) => toast.error(err.response?.data?.detail || 'Failed to load notices.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const pinnedIds = new Set(pinnedNotices.map((n) => n.id || n._id))
  const unpinnedNotices = notices.filter((n) => !pinnedIds.has(n.id || n._id))

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteNotice(deleteTarget.id || deleteTarget._id)
      toast.success('Notice deleted')
      setDeleteTarget(null)
      fetchNotices()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete notice.')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderNoticeCard = (notice, pinned) => {
    const id = notice.id || notice._id
    const date = formatDate(notice.created_at || notice.date)
    return (
      <div key={id} className={`card p-5 ${pinned ? 'border-primary-200 bg-primary-50/40' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              {pinned ? <Pin size={16} /> : <Megaphone size={16} />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{notice.title}</h3>
              {date && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={12} />
                  {date}
                </p>
              )}
            </div>
          </div>
          {admin && (
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setFormState({ open: true, notice })}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600"
                aria-label="Edit notice"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => setDeleteTarget(notice)}
                className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete notice"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {notice.content || notice.description}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notice Board</h2>
          <p className="mt-1 text-sm text-slate-500">Announcements and updates from your society.</p>
        </div>
        {admin && (
          <button onClick={() => setFormState({ open: true, notice: null })} className="btn-primary shrink-0">
            <PlusCircle size={17} />
            Post Notice
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      ) : notices.length === 0 && pinnedNotices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices yet"
          description="Society announcements will appear here once posted."
        />
      ) : (
        <div className="space-y-6">
          {pinnedNotices.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Pin size={14} />
                Pinned
              </h3>
              <div className="space-y-3">{pinnedNotices.map((n) => renderNoticeCard(n, true))}</div>
            </div>
          )}

          {unpinnedNotices.length > 0 && (
            <div className="space-y-3">
              {pinnedNotices.length > 0 && (
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">All Notices</h3>
              )}
              <div className="space-y-3">{unpinnedNotices.map((n) => renderNoticeCard(n, false))}</div>
            </div>
          )}
        </div>
      )}

      <NoticeFormModal
        open={formState.open}
        initialValues={formState.notice}
        onClose={() => setFormState({ open: false, notice: null })}
        onSaved={() => {
          setFormState({ open: false, notice: null })
          fetchNotices()
        }}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this notice?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        isProcessing={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
