import { BarChart2, Upload, Download } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { getExportUrl } from '../services/api'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { sessionId, rowCount, reset, isLoading } = useDashboard()

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 md:px-6
      bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <BarChart2 className="text-brand-blue" size={22} />
        <span className="font-semibold text-base tracking-tight text-slate-800 dark:text-white">
          Executive BI Dashboard
        </span>
        {rowCount > 0 && (
          <span className="hidden sm:inline ml-2 text-xs bg-brand-blue/10 text-brand-blue font-medium px-2 py-0.5 rounded-full">
            {rowCount.toLocaleString()} rows
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isLoading && (
          <span className="text-xs text-slate-400 dark:text-dark-muted animate-pulse hidden sm:inline">
            Refreshing…
          </span>
        )}

        {sessionId && (
          <a
            href={getExportUrl(sessionId)}
            download="dashboard_data.csv"
            className="btn-secondary flex items-center gap-1.5"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </a>
        )}

        <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
          <Upload size={14} />
          <span className="hidden sm:inline">New File</span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  )
}
