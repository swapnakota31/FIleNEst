import axios from 'axios'
import { FILES_API_BASE_URL } from '../config/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return {
    Authorization: `Bearer ${token}`
  }
}

export const uploadUserFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post(`${FILES_API_BASE_URL}/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getUserFiles = () => {
  return axios.get(FILES_API_BASE_URL, {
    headers: getAuthHeaders()
  })
}

export const getRecentUserFiles = () => {
  return axios.get(`${FILES_API_BASE_URL}/recent`, {
    headers: getAuthHeaders()
  })
}

export const softDeleteUserFile = (fileId) => {
  return axios.put(`${FILES_API_BASE_URL}/delete/${fileId}`, null, {
    headers: getAuthHeaders()
  })
}

export const getDeletedUserFiles = () => {
  return axios.get(`${FILES_API_BASE_URL}/deleted`, {
    headers: getAuthHeaders()
  })
}

export const restoreUserFile = (fileId) => {
  return axios.put(`${FILES_API_BASE_URL}/restore/${fileId}`, null, {
    headers: getAuthHeaders()
  })
}

export const permanentlyDeleteUserFile = (fileId) => {
  return axios.delete(`${FILES_API_BASE_URL}/permanent/${fileId}`, {
    headers: getAuthHeaders()
  })
}

export const getUserFileStats = () => {
  return axios.get(`${FILES_API_BASE_URL}/stats`, {
    headers: getAuthHeaders()
  })
}

export const shareUserFile = (fileId, expiryOption = 'none') => {
  return axios.put(`${FILES_API_BASE_URL}/share/${fileId}`, { expiryOption }, {
    headers: getAuthHeaders()
  })
}

export const unshareUserFile = (fileId) => {
  return axios.put(`${FILES_API_BASE_URL}/unshare/${fileId}`, null, {
    headers: getAuthHeaders()
  })
}

export const getSharedFileByToken = (token) => {
  return axios.get(`${FILES_API_BASE_URL}/public/${token}`)
}
