import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function FileUpload() {
  const { upload, isUploading } = useDashboard()

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) upload(accepted[0])
    },
    [upload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-10
        flex flex-col items-center gap-4 transition-all duration-200
        ${isDragActive
          ? 'border-brand-blue bg-brand-blue/5 scale-[1.01]'
          : 'border-slate-300 dark:border-dark-border hover:border-brand-blue hover:bg-brand-blue/5'}
        ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <>
          <div className="w-12 h-12 rounded-full border-4 border-brand-blue border-t-transparent animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Processing your file…</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
            {isDragActive ? (
              <UploadCloud size={32} className="text-brand-blue" />
            ) : (
              <FileSpreadsheet size={32} className="text-brand-blue" />
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
              {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-sm text-slate-400 dark:text-dark-muted">
              Supports .csv, .xlsx, .xls
            </p>
          </div>
        </>
      )}
    </div>
  )
}
