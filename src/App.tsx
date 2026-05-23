import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './lib/utils'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Caja      from './pages/Caja'
import Servicios from './pages/Servicios'
import Gastos    from './pages/Gastos'
import Historial from './pages/Historial'
import Reportes  from './pages/Reportes'

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index         element={<Dashboard />} />
          <Route path="caja"      element={<Caja />}      />
          <Route path="servicios" element={<Servicios />} />
          <Route path="gastos"    element={<Gastos />}    />
          <Route path="historial" element={<Historial />} />
          <Route path="reportes"  element={<Reportes />}  />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
