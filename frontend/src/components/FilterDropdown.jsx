import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function FilterDropdown({ label, options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const isAllSelected = selected.length === 0
  const displayLabel = isAllSelected ? 'All' : `${selected.length} selected`

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border
          transition-all duration-150
          ${open
            ? 'border-brand-blue ring-1 ring-brand-blue bg-brand-blue/5'
            : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-blue'
          }
          text-slate-700 dark:text-slate-200
        `}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-slate-400 dark:text-dark-muted text-xs shrink-0">{label}</span>
          <span
            className={`font-medium truncate ${
              !isAllSelected ? 'text-brand-blue' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {displayLabel}
          </span>
        </span>
        <ChevronDown
          size={13}
          className={`ml-1.5 shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50
            bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border
            rounded-lg shadow-xl overflow-hidden"
        >
          {/* Select All row */}
          <button
            onClick={() => onChange([])}
            className="w-full flex items-center gap-2.5 px-3 py-2
              text-xs font-semibold text-slate-500 dark:text-dark-muted
              hover:bg-slate-50 dark:hover:bg-dark-border
              border-b border-slate-100 dark:border-dark-border"
          >
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0
                ${isAllSelected
                  ? 'bg-brand-blue border-brand-blue'
                  : 'border-slate-300 dark:border-slate-600'
                }`}
            >
              {isAllSelected && <Check size={9} strokeWidth={3} className="text-white" />}
            </span>
            All
          </button>

          {/* Option list */}
          <div className="max-h-48 overflow-y-auto">
            {options.map((opt) => {
              const isChecked = selected.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5
                    text-sm text-slate-700 dark:text-slate-200
                    hover:bg-slate-50 dark:hover:bg-dark-border text-left"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0
                      ${isChecked
                        ? 'bg-brand-blue border-brand-blue'
                        : 'border-slate-300 dark:border-slate-600'
                      }`}
                  >
                    {isChecked && <Check size={9} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="truncate">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
