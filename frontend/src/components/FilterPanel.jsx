import { useMemo, useState } from 'react'
import { RotateCcw, X, Calendar, SlidersHorizontal } from 'lucide-react'
import { subDays, subMonths, startOfYear, format, parseISO } from 'date-fns'
import { useDashboard } from '../context/DashboardContext'
import FilterDropdown from './FilterDropdown'

const DATE_PRESETS = [
  { key: 'all',    label: 'All'    },
  { key: '7D',     label: '7D'     },
  { key: '30D',    label: '30D'    },
  { key: '3M',     label: '3M'     },
  { key: '6M',     label: '6M'     },
  { key: 'YTD',    label: 'YTD'    },
  { key: '1Y',     label: '1Y'     },
  { key: 'custom', label: 'Custom' },
]

function getPresetRange(key, maxDateStr) {
  const maxDate = parseISO(maxDateStr)
  switch (key) {
    case '7D':  return { start: subDays(maxDate, 6),    end: maxDate }
    case '30D': return { start: subDays(maxDate, 29),   end: maxDate }
    case '3M':  return { start: subMonths(maxDate, 3),  end: maxDate }
    case '6M':  return { start: subMonths(maxDate, 6),  end: maxDate }
    case 'YTD': return { start: startOfYear(maxDate),   end: maxDate }
    case '1Y':  return { start: subMonths(maxDate, 12), end: maxDate }
    default:    return null
  }
}

export default function FilterPanel({ onClose }) {
  const { filterOptions, activeFilters, applyFilters, resetFilters } = useDashboard()
  const [activePreset, setActivePreset] = useState('all')

  if (!filterOptions) return null

  const set = (key, values) => applyFilters({ ...activeFilters, [key]: values })

  const handlePreset = (presetKey) => {
    setActivePreset(presetKey)
    if (presetKey === 'all') {
      applyFilters({ ...activeFilters, date_start: null, date_end: null })
      return
    }
    if (presetKey === 'custom') return // just reveal the inputs

    const range = getPresetRange(presetKey, filterOptions.date_range.max_date)
    if (range) {
      applyFilters({
        ...activeFilters,
        date_start: format(range.start, 'yyyy-MM-dd'),
        date_end: format(range.end, 'yyyy-MM-dd'),
      })
    }
  }

  const handleCustomDate = (key, val) => {
    setActivePreset('custom')
    applyFilters({ ...activeFilters, [key]: val || null })
  }

  // Cascading: sub-categories follow selected categories
  const availableSubCats = useMemo(() => {
    const cats = activeFilters.category?.length
      ? activeFilters.category
      : filterOptions.categories
    return cats.flatMap((c) => filterOptions.sub_categories[c] || [])
  }, [activeFilters.category, filterOptions])

  // Cascading: regions follow selected markets
  const availableRegions = useMemo(() => {
    const mkts = activeFilters.market?.length
      ? activeFilters.market
      : filterOptions.markets
    return mkts.flatMap((m) => filterOptions.regions[m] || [])
  }, [activeFilters.market, filterOptions])

  const hasActive = Object.values(activeFilters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true)
  )

  return (
    <div className="flex flex-col h-full">
      {/* ── Panel header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-dark-border">
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Filters</span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={() => { resetFilters(); setActivePreset('all') }}
              className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
            >
              <RotateCcw size={12} />
              Reset all
            </button>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-border text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── DATE RANGE ───────────────────────────────── */}
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar size={13} className="text-brand-blue" />
            <p className="label">Date Range</p>
          </div>

          {/* Quick preset pills */}
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-md border transition-colors
                  ${activePreset === p.key
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-brand-blue hover:text-brand-blue bg-white dark:bg-dark-card'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date inputs — visible only when Custom preset is active */}
          {activePreset === 'custom' && (
            <div className="flex gap-2 mt-3">
              <div className="flex-1">
                <p className="text-xs text-slate-400 dark:text-dark-muted mb-1">From</p>
                <input
                  type="date"
                  min={filterOptions.date_range.min_date}
                  max={filterOptions.date_range.max_date}
                  value={activeFilters.date_start || ''}
                  onChange={(e) => handleCustomDate('date_start', e.target.value)}
                  className="w-full text-xs rounded-md border border-slate-200 dark:border-dark-border
                    bg-slate-50 dark:bg-dark-card text-slate-700 dark:text-slate-200
                    px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 dark:text-dark-muted mb-1">To</p>
                <input
                  type="date"
                  min={filterOptions.date_range.min_date}
                  max={filterOptions.date_range.max_date}
                  value={activeFilters.date_end || ''}
                  onChange={(e) => handleCustomDate('date_end', e.target.value)}
                  className="w-full text-xs rounded-md border border-slate-200 dark:border-dark-border
                    bg-slate-50 dark:bg-dark-card text-slate-700 dark:text-slate-200
                    px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── DIVIDER ──────────────────────────────────── */}
        <div className="mx-4 border-t border-slate-200 dark:border-dark-border" />

        {/* ── DIMENSION FILTERS ────────────────────────── */}
        <div className="px-4 pt-4 pb-6 space-y-2.5">
          <div className="flex items-center gap-1.5 mb-3">
            <SlidersHorizontal size={13} className="text-brand-blue" />
            <p className="label">Dimensions</p>
          </div>

          <FilterDropdown
            label="Category"
            options={filterOptions.categories}
            selected={activeFilters.category || []}
            onChange={(values) => set('category', values)}
          />
          <FilterDropdown
            label="Sub-Category"
            options={availableSubCats}
            selected={activeFilters.sub_category || []}
            onChange={(values) => set('sub_category', values)}
          />
          <FilterDropdown
            label="Market"
            options={filterOptions.markets}
            selected={activeFilters.market || []}
            onChange={(values) => set('market', values)}
          />
          <FilterDropdown
            label="Region"
            options={availableRegions}
            selected={activeFilters.region || []}
            onChange={(values) => set('region', values)}
          />
          <FilterDropdown
            label="Segment"
            options={filterOptions.segments}
            selected={activeFilters.segment || []}
            onChange={(values) => set('segment', values)}
          />
          <FilterDropdown
            label="Ship Mode"
            options={filterOptions.ship_modes}
            selected={activeFilters.ship_mode || []}
            onChange={(values) => set('ship_mode', values)}
          />
          <FilterDropdown
            label="Priority"
            options={filterOptions.order_priorities}
            selected={activeFilters.order_priority || []}
            onChange={(values) => set('order_priority', values)}
          />
        </div>

      </div>
    </div>
  )
}
