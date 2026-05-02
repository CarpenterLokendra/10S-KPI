import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import LobbyBrowser from '@/pages/LobbyBrowser'
import LobbyRoom from '@/pages/LobbyRoom'
import CardShowcase from '@/pages/CardShowcase'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LANDING} replace />} />
      <Route path={ROUTES.LANDING} element={<Landing />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Protected routes */}
      <Route
        path={ROUTES.LOBBY_BROWSER}
        element={
          <ProtectedRoute>
            <LobbyBrowser />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LOBBY_ROOM}
        element={
          <ProtectedRoute>
            <LobbyRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/showcase"
        element={
          <ProtectedRoute>
            <CardShowcase />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  )
}

export default App
