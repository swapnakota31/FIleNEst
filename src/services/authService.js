import axios from 'axios'
import { AUTH_API_BASE_URL } from '../config/api'

export const signupUser = (userData) => {
  return axios.post(`${AUTH_API_BASE_URL}/signup`, userData)
}

export const loginUser = (userData) => {
  return axios.post(`${AUTH_API_BASE_URL}/login`, userData)
}

export const getProfile = (token) => {
  return axios.get(`${AUTH_API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const forgotPassword = (email) => {
  return axios.post(`${AUTH_API_BASE_URL}/forgot-password`, { email })
}

export const resetPassword = (token, newPassword) => {
  return axios.post(`${AUTH_API_BASE_URL}/reset-password/${token}`, { newPassword })
}
