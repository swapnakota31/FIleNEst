const ensureProtocol = (value) => {
  const raw = String(value || '').trim()

  if (!raw) {
    return ''
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '')
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) {
    return `http://${raw}`
  }

  return `https://${raw}`
}

const detectDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname

    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api'
    }

    return `${window.location.origin}/api`
  }

  return 'http://localhost:5000/api'
}

const envApiBase = ensureProtocol(import.meta.env.VITE_API_BASE_URL)

export const API_BASE_URL = (envApiBase || detectDefaultApiBaseUrl()).replace(/\/+$/, '')
export const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`
export const FILES_API_BASE_URL = `${API_BASE_URL}/files`

export const getApiOrigin = () => {
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return new URL(API_BASE_URL).origin
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:5000'
}
