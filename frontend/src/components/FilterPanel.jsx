import { useMemo } from 'react'
import Select from 'react-select'
import { RotateCcw, X } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { useTheme } from '../context/ThemeContext'

function useSelectStyles(isDark) {
  return useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        backgroundColor: isDark ? '#1E2130' : '#F8FAFC',
        borderColor: state.isFocused
          ? '#4F81BD'
          : isDark
          ? '#2D3142'
          : '#E2E8F0',
        boxShadow: state.isFocused ? '0 0 0 1px #4F81BD' : 'none',
        minHeight: '36px',
        fontSize: '13px',
        '&:hover': { borderColor: '#4F81BD' },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDark ? '#1A1D27' : '#FFFFFF',
        border: `1px solid ${isDark ? '#2D3142' : '#E2E8F0'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        zIndex: 100,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#4F81BD'
          : state.isFocused
          ? isDark ? '#2D3142' : '#F1F5F9'
          : 'transparent',
        color: state.isSelected ? '#fff' : isDark ? '#CBD5E1' : '#374151',
        fontSize: '13px',
        padding: '6px 12px',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: isDark ? '#2D3142' : '#EFF6FF',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: isDark ? '#CBD5E1' : '#1D4ED8',
        fontSize: '12px',
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: isDark ? '#94A3B8' : '#3B82F6',
        '&:hover': { backgroundColor: '#4F81BD', color: '#fff' },
      }),
      input: (base) => ({ ...base, color: isDark ? '#F1F5F9' : '#1E293B' }),
      placeholder: (base) => ({ ...base, color: isDark ? '#475569' : '#94A3B8', fontSize: '13px' }),
      singleValue: (base) => ({ ...base, color: isDark ? '#F1F5F9' : '#1E293B' }),
      clearIndicator: (base) => ({ ...base, color: isDark ? '#475569' : '#94A3B8', padding: '2px' }),
      dropdownIndicator: (base) => ({ ...base, color: isDark ? '#475569' : '#94A3B8', padding: '2px' }),
    }),
    [isDark]
  )
}

function toOptions(arr) {
  return (arr || []).map((v) => ({ value: v, label: v }))
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <p className="label">{label}</p>
      {children}
    </div>
  )
}

export default function FilterPanel({ onClose }) {
  const { filterOptions, activeFilters, applyFilters, resetFilters } = useDashboard()
  const { isDark } = useTheme()
  const styles = useSelectStyles(isDark)

  if (!filterOptions) return null

  const set = (key, values) =>
    applyFilters({ ...activeFilters, [key]: values.map((o) => o.value) })

  const setDate = (key, val) =>
    applyFilters({ ...activeFilters, [key]: val || null })

  // Available sub-categories based on selected categories
  const availableSubCats = useMemo(() => {
    const cats = activeFilters.category?.length
      ? activeFilters.category
      : filterOptions.categories
    return cats.flatMap((c) => filterOptions.sub_categories[c] || [])
  }, [activeFilters.category, filterOptions])

  // Available regions based on selected markets
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-dark-border">
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Filters</span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
            >
              <RotateCcw size={12} />
              Reset
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

      {/* Filter controls */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Date Range */}
        <FilterGroup label="Date Range">
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs text-slate-400 dark:text-dark-muted mb-1">From</p>
              <input
                type="date"
                min={filterOptions.date_range.min_date}
                max={filterOptions.date_range.max_date}
                value={activeFilters.date_start || ''}
                onChange={(e) => setDate('date_start', e.target.value)}
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
                onChange={(e) => setDate('date_end', e.target.value)}
                className="w-full text-xs rounded-md border border-slate-200 dark:border-dark-border
                  bg-slate-50 dark:bg-dark-card text-slate-700 dark:text-slate-200
                  px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>
        </FilterGroup>

        {/* Category */}
        <FilterGroup label="Category">
          <Select
            isMulti
            options={toOptions(filterOptions.categories)}
            value={toOptions(activeFilters.category)}
            onChange={(v) => set('category', v)}
            styles={styles}
            placeholder="All categories"
          />
        </FilterGroup>

        {/* Sub-Category */}
        <FilterGroup label="Sub-Category">
          <Select
            isMulti
            options={toOptions(availableSubCats)}
            value={toOptions(activeFilters.sub_category)}
            onChange={(v) => set('sub_category', v)}
            styles={styles}
            placeholder="All sub-categories"
          />
        </FilterGroup>

        {/* Market */}
        <FilterGroup label="Market">
          <Select
            isMulti
            options={toOptions(filterOptions.markets)}
            value={toOptions(activeFilters.market)}
            onChange={(v) => set('market', v)}
            styles={styles}
            placeholder="All markets"
          />
        </FilterGroup>

        {/* Region */}
        <FilterGroup label="Region">
          <Select
            isMulti
            options={toOptions(availableRegions)}
            value={toOptions(activeFilters.region)}
            onChange={(v) => set('region', v)}
            styles={styles}
            placeholder="All regions"
          />
        </FilterGroup>

        {/* Segment */}
        <FilterGroup label="Customer Segment">
          <Select
            isMulti
            options={toOptions(filterOptions.segments)}
            value={toOptions(activeFilters.segment)}
            onChange={(v) => set('segment', v)}
            styles={styles}
            placeholder="All segments"
          />
        </FilterGroup>

        {/* Ship Mode */}
        <FilterGroup label="Ship Mode">
          <Select
            isMulti
            options={toOptions(filterOptions.ship_modes)}
            value={toOptions(activeFilters.ship_mode)}
            onChange={(v) => set('ship_mode', v)}
            styles={styles}
            placeholder="All ship modes"
          />
        </FilterGroup>

        {/* Order Priority */}
        <FilterGroup label="Order Priority">
          <Select
            isMulti
            options={toOptions(filterOptions.order_priorities)}
            value={toOptions(activeFilters.order_priority)}
            onChange={(v) => set('order_priority', v)}
            styles={styles}
            placeholder="All priorities"
          />
        </FilterGroup>
      </div>
    </div>
  )
}
