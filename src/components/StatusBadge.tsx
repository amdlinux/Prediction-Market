// src/components/StatusBadge.tsx
export default function StatusBadge({
  status,
  outcome,
}: {
  status : string
  outcome?: string | null
}) {
  const styles: Record<string, string> = {
    OPEN    : 'bg-green-900/50  text-green-400  border-green-800',
    HALTED  : 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    RESOLVED: 'bg-blue-900/50   text-blue-400   border-blue-800',
    VOIDED  : 'bg-gray-800      text-gray-400   border-gray-700',
  }

  return (
    <span className={`
      text-xs font-semibold px-2 py-0.5 rounded-full border
      ${styles[status] ?? styles.OPEN}
    `}>
      {status}
      {outcome ? ` · ${outcome}` : ''}
    </span>
  )
}