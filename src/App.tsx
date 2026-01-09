import { Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/api'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NuevaInspeccionPage from './pages/NuevaInspeccionPage'
import RecepcionPage from './pages/RecepcionPage'
import PeritajePage from './pages/PeritajePage'
import PruebasPage from './pages/PruebasPage'
import HistorialPage from './pages/HistorialPage'
import DetallesInspeccionPage from './pages/DetallesInspeccionPage'
import SyncStatusIndicator from './components/SyncStatusIndicator'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspeccion/nueva"
          element={
            <PrivateRoute>
              <NuevaInspeccionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspeccion/:id/recepcion"
          element={
            <PrivateRoute>
              <RecepcionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspeccion/:id/peritaje"
          element={
            <PrivateRoute>
              <PeritajePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspeccion/:id/pruebas"
          element={
            <PrivateRoute>
              <PruebasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <PrivateRoute>
              <HistorialPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspeccion/:id/detalles"
          element={
            <PrivateRoute>
              <DetallesInspeccionPage />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* Indicador global de sincronización */}
      {authService.isAuthenticated() && <SyncStatusIndicator />}
    </div>
  )
}

export default App
