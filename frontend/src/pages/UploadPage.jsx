import { BarChart2 } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import ThemeToggle from '../components/ThemeToggle'

export default function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-dark-bg transition-colors">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-brand-blue" size={24} />
          <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-white">
            Executive BI Dashboard
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
            Upload your sales data
          </h1>
          <p className="text-slate-500 dark:text-dark-muted text-base">
            Drop a <span className="font-medium text-brand-blue">.csv</span> or{' '}
            <span className="font-medium text-brand-blue">.xlsx</span> file to generate
            executive-level insights instantly.
          </p>
        </div>

        <FileUpload />

        {/* Schema hint */}
        <div className="mt-8 w-full max-w-xl card p-4">
          <p className="label mb-2">Expected columns</p>
          <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed">
            Row ID · Order ID · Order Date · Ship Date · Ship Mode · Customer ID · Customer Name ·
            Segment · City · State · Country · Postal Code · Market · Region · Product ID ·
            Category · Sub-Category · Product Name · Sales · Quantity · Discount · Profit ·
            Shipping Cost · Order Priority
          </p>
        </div>
      </main>
    </div>
  )
}
