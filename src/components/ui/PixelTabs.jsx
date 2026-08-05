/**
 * Tabs de navegación (distinto de PixelSegmented: este es para cambiar
 * de "sección visible", con estilo de subrayado, no de botón lleno).
 * Uso:
 *   <PixelTabs
 *     tabs={[{ value: 'recursos', label: 'Recursos' }, { value: 'favoritos', label: 'Favoritos' }]}
 *     value={tab}
 *     onChange={setTab}
 *   />
 */
export function PixelTabs({ tabs = [], value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 border-b-2 border-deep ${className}`} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-4 -mb-0.5 transition-colors ${
              active
                ? 'border-brand text-deep'
                : 'border-transparent text-deep/50 hover:text-deep hover:border-deep/20'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
