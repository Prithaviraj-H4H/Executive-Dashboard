import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        bg-slate-100 hover:bg-slate-200 dark:bg-dark-border dark:hover:bg-slate-600
        text-slate-600 dark:text-slate-300 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
