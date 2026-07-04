import { AlertTriangle, X } from 'lucide-react'
import Spinner from './Spinner'

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isProcessing}>
            {isProcessing && <Spinner size={16} className="text-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
