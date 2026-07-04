import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <CompassIcon size={26} className="text-primary-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  )
}
