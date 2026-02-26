import { createContext, useContext, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { uploadFile, fetchDashboard } from '../services/api'

const DashboardContext = createContext(null)

const EMPTY_FILTERS = {
  date_start: null,
  date_end: null,
  category: [],
  sub_category: [],
  market: [],
  region: [],
  segment: [],
  ship_mode: [],
  order_priority: [],
}

export function DashboardProvider({ children }) {
  const [sessionId, setSessionId] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [charts, setCharts] = useState([])
  const [filterOptions, setFilterOptions] = useState(null)
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)
  const [rowCount, setRowCount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef(null)

  const upload = async (file) => {
    setIsUploading(true)
    try {
      const data = await uploadFile(file)
      setSessionId(data.session_id)
      setKpis(data.kpis)
      setCharts(data.charts)
      setFilterOptions(data.filter_options)
      setRowCount(data.row_count)
      setActiveFilters(EMPTY_FILTERS)
      toast.success(`Loaded ${data.row_count.toLocaleString()} rows successfully`)
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please check the file format.')
    } finally {
      setIsUploading(false)
    }
  }

  const applyFilters = (updatedFilters) => {
    setActiveFilters(updatedFilters)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const data = await fetchDashboard(sessionId, updatedFilters)
        setKpis(data.kpis)
        setCharts(data.charts)
      } catch (err) {
        toast.error(err.message || 'Failed to apply filters.')
      } finally {
        setIsLoading(false)
      }
    }, 400)
  }

  // Called when user clicks a chart element — toggles a filter value
  const applyChartFilter = (filterKey, value) => {
    if (!filterKey) return
    const current = activeFilters[filterKey] || []
    const already = current.includes(value)
    const updated = {
      ...activeFilters,
      [filterKey]: already ? current.filter((v) => v !== value) : [...current, value],
    }
    applyFilters(updated)
  }

  const resetFilters = () => applyFilters(EMPTY_FILTERS)

  const reset = () => {
    setSessionId(null)
    setKpis(null)
    setCharts([])
    setFilterOptions(null)
    setActiveFilters(EMPTY_FILTERS)
    setRowCount(0)
  }

  return (
    <DashboardContext.Provider
      value={{
        sessionId,
        kpis,
        charts,
        filterOptions,
        activeFilters,
        rowCount,
        isUploading,
        isLoading,
        upload,
        applyFilters,
        applyChartFilter,
        resetFilters,
        reset,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)
