import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { AchievementUnlockProvider } from './components/profile/AchievementUnlockAnimation.jsx'
import { ChallengeCompleteProvider } from './components/social/ChallengeCompleteBanner.jsx'

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

