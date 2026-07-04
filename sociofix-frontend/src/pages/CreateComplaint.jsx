import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { createComplaint } from '../api/complaints'
import Spinner from '../components/common/Spinner'

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Plumbing',
      priority: 'medium',
      block: '',
      flat_number: '',
      description: '',
      image: null,
    },
  })

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("block", data.block);
      formData.append("flat_number", data.flat_number);

      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }

      const res = await createComplaint(formData);

      console.log(res);

      toast.success("Complaint filed successfully");

      navigate("/complaints");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
        err.message ||
        "Failed to file complaint."
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} />
        Back to complaints
      </Link>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">File a New Complaint</h2>
        <p className="mt-1 text-sm text-slate-500">
          Describe the maintenance issue and we'll route it to the right team.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Leaking pipe in basement"
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
            <input
              id="block"
              type="text"
              placeholder="e.g. A"
              className="input"
              {...register('block')}
            />
          </div>

          <div>
            <label className="label">Flat Number</label>

            <input
              className="input"
              {...register('flat_number')}
              placeholder="101"
            />
          </div>

          <div>
           <label className="label">Complaint Image</label>

           <input
            type="file"
            accept="image/*"
            className="input"
            {...register('image')}
            onChange={(e) => {
              register('image').onChange(e)

              if (e.target.files[0]) {
                setPreview(URL.createObjectURL(e.target.files[0]))
      }
    }}
  />

  {preview && (
    <img
      src={preview}
      alt="Preview"
      className="mt-3 h-40 rounded-lg border object-cover"
    />
  )}
</div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Provide as much detail as possible…"
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Please provide at least 10 characters' },
              })}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/complaints" className="btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Spinner size={16} className="text-white" />}
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
