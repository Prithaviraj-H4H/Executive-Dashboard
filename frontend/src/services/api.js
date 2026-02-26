import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: BASE_URL })

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail
    return Promise.reject(new Error(detail || 'An unexpected error occurred.'))
  }
)

export async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchDashboard(sessionId, filters) {
  const { data } = await client.post('/api/dashboard', {
    session_id: sessionId,
    ...filters,
  })
  return data
}

export function getExportUrl(sessionId) {
  return `${BASE_URL}/api/export/${sessionId}`
}
