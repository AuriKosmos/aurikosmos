export function AuriNote({ line }) {
  if (!line) return null
  return (
    <div className="flex items-start gap-2 bg-white border-2 border-deep/20 p-3">
      <img src="./auri-cara.png" alt="" className="w-6 h-6 shrink-0 object-contain mt-0.5" aria-hidden="true" />
      <p className="text-sm text-deep/70 italic">{line}</p>
    </div>
  )
}
