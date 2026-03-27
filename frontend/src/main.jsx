import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { AchievementUnlockProvider } from './components/profile/AchievementUnlockAnimation.jsx'
import { ChallengeCompleteProvider } from './components/social/ChallengeCompleteBanner.jsx'

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    const key = '__vite_chunk_reload_once__'
    if (sessionStorage.getItem(key) === '1') {
      return
    }
    sessionStorage.setItem(key, '1')
    window.location.reload()
  })

  window.addEventListener('pageshow', () => {
    sessionStorage.removeItem('__vite_chunk_reload_once__')
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AchievementUnlockProvider>
        <ChallengeCompleteProvider>
          <AppRouter />
        </ChallengeCompleteProvider>
      </AchievementUnlockProvider>
    </ToastProvider>
  </StrictMode>,
)

