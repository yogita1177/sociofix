const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  'in progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
  rejected: 'bg-red-100 text-red-700',
}

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

function formatLabel(value = '') {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusBadge({ status }) {
  const key = (status || '').toLowerCase()
  const style = STATUS_STYLES[key] || 'bg-slate-100 text-slate-600'
  return <span className={`badge ${style}`}>{formatLabel(status || 'Unknown')}</span>
}

export function PriorityBadge({ priority }) {
  const key = (priority || '').toLowerCase()
  const style = PRIORITY_STYLES[key] || 'bg-slate-100 text-slate-600'
  return <span className={`badge ${style}`}>{formatLabel(priority || 'Normal')}</span>
}
