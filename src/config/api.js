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

const normalizeApiBaseUrl = (value) => {
  const withProtocol = ensureProtocol(value)

  if (!withProtocol) {
    return ''
  }

  const url = new URL(withProtocol)

  if (url.pathname === '/' || url.pathname === '') {
    url.pathname = '/api'
  }

  return url.toString().replace(/\/+$/, '')
}

const PRODUCTION_API_FALLBACK = 'https://filenest-backend-kk8m.onrender.com/api'

const detectDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname

    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api'
    }

    // In deployed frontend environments, always prefer backend host.
    return PRODUCTION_API_FALLBACK
  }

  return PRODUCTION_API_FALLBACK
}

const envApiBase = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

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
