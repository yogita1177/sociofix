import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-primary-600 ${className}`}
      aria-label="Loading"
    />
  )
}

export function FullPageSpinner({ label = 'Loading SocioFix…' }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner size={32} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}
