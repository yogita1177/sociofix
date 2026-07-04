import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { getComplaintById, updateComplaint } from '../api/complaints'
import Spinner, { FullPageSpinner } from '../components/common/Spinner'

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export default function EditComplaint() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { title: '', category: 'Plumbing', priority: 'medium', block: '', description: '' },
  })

  useEffect(() => {
    getComplaintById(complaintId)
      .then((res) => {
        const c = res.data
        reset({
          title: c.title || '',
          category: c.category || 'Plumbing',
          priority: (c.priority || 'medium').toLowerCase(),
          block: c.block || '',
          description: c.description || '',
        })
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Failed to load complaint.')
        navigate('/complaints')
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId])

  const onSubmit = async (data) => {
    try {
      await updateComplaint(complaintId, data)
      toast.success('Complaint updated successfully')
      navigate(`/complaints/${complaintId}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update complaint.')
    }
  }

  if (isLoading) return <FullPageSpinner label="Loading complaint…" />

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to={`/complaints/${complaintId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={15} />
        Back to complaint
      </Link>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Edit Complaint</h2>
        <p className="mt-1 text-sm text-slate-500">Update the details of your maintenance request.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select id="category" className="input" {...register('category', { required: true })}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select id="priority" className="input capitalize" {...register('priority', { required: true })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="block">
              Block / Building
            </label>
            <input id="block" type="text" className="input" {...register('block')} />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Please provide at least 10 characters' },
              })}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={`/complaints/${complaintId}`} className="btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Spinner size={16} className="text-white" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
