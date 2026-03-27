import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, CalendarDays } from 'lucide-react'
import { getProfile } from '../services/authService'

function Profile() {
  const { user, setUser } = useOutletContext()
  const [profile, setProfile] = useState(user)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setIsLoading(false)
      return
    }

    getProfile(token)
      .then((response) => {
        const profileData = response.data.user || response.data
        setProfile(profileData)
        setUser(profileData)
        localStorage.setItem('user', JSON.stringify(profileData))
      })
      .catch(() => {
        const savedUser = localStorage.getItem('user')
        setProfile(savedUser ? JSON.parse(savedUser) : null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [setUser])

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : 'Not available'

  const initial = profile?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <motion.section
      className="dashboard-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <article className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{initial}</div>
          <div>
            <h3>
              <User size={18} /> Profile Details
            </h3>
            <p className="profile-subtext">Your account information</p>
          </div>
        </div>

        {isLoading ? <p>Loading profile...</p> : null}

        {!isLoading ? (
          <div className="profile-details">
            <div className="profile-detail-item">
              <span>
                <User size={15} /> Name
              </span>
              <strong>{profile?.name || 'Not available'}</strong>
            </div>
            <div className="profile-detail-item">
              <span>
                <Mail size={15} /> Email
              </span>
              <strong>{profile?.email || 'Not available'}</strong>
            </div>
            <div className="profile-detail-item">
              <span>
                <CalendarDays size={15} /> Joined
              </span>
              <strong>{joinedDate}</strong>
            </div>
          </div>
        ) : null}
      </article>
    </motion.section>
  )
}

export default Profile
