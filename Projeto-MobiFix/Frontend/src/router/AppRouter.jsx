import { BrowserRouter, Routes, Navigate, Route, Outlet } from 'react-router-dom'
import HomePage from '../pages/public/HomePage.jsx'
import HomeClientePage from '../pages/client/HomeClientePage.jsx'
import Trotinetes from '../pages/client/MinhasTrotinetesPage.jsx'
import Faturas from '../pages/client/FaturasPage.jsx'
import AgendarDiagnostico from '../pages/client/AgendarDiagnosticoPage.jsx'
import Catalogo from '../pages/client/CatalogoPecasPage.jsx'
import AcompanharReparacoes from '../pages/client/AcompanharReparacoesPage.jsx'
import VendaDireta from '../pages/operator/VendaDiretaPage.jsx'
import Layout from '../pages/operator/Layout.jsx'
import TrotinetesProntas from '../pages/operator/TrotinetesProntasPage.jsx'
import PecasReservadas from '../pages/operator/PecasReservadas.jsx'
import RececaoEncomendas from '../pages/operator/RececaoEncomendasPage.jsx'
import FaturasOperator from '../pages/operator/FaturasPage.jsx'
import RepairsLayout from '../pages/mechanic/RepairsLayout.jsx'
import Dashboard from '../pages/mechanic/Dashboard.jsx'
import Repairs from '../pages/mechanic/Repairs.jsx'
import AdminLayout from '../pages/admin/AdminLayout.jsx'
import StockOrders from '../pages/admin/EncomendasStock.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import UserManagement from '../pages/admin/GestaoUsers.jsx'
import Promotions from '../pages/admin/Promocoes.jsx'
import LoginPage from '../pages/staff/LoginPage.jsx'
import AuthPage from '../pages/public/AuthPage.jsx'
import PecasDashboard from '../pages/admin/PecasManagement.jsx'
import IntervencoesCatalogoManagement from '../pages/admin/IntervencoesCatalogoManagement.jsx'

// Extrai o payload do JWT sem biblioteca externa
function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = parseJwt(token);
  return payload?.cargo ?? null;
}

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = getUserRole();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`Acesso negado: role "${userRole}" não está em [${allowedRoles}]`);
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/staff" element={<LoginPage/>} />

        <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
          <Route path="/FixNRide/" element={<HomeClientePage/>} />
          <Route path="/FixNRide/trotinetes" element={<Trotinetes/>} />
          <Route path="/FixNRide/faturas" element={<Faturas/>} />
          <Route path="/FixNRide/agendar" element={<AgendarDiagnostico/>} />
          <Route path="/FixNRide/catalogo" element={<Catalogo/>} />
          <Route path="/FixNRide/reparacoes" element={<AcompanharReparacoes/>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OPERADOR', 'ADMINISTRADOR']} />}>
          <Route path="/FixNSell" element={<Layout />}>
            <Route path="vendadireta" element={<VendaDireta />} />
            <Route path="trotinetes-prontas" element={<TrotinetesProntas />} />
            <Route path="pecas-reservadas" element={<PecasReservadas />} />
            <Route path="rececao-encomendas" element={<RececaoEncomendas />} />
            <Route path="faturas" element={<FaturasOperator />} />
            <Route index element={<VendaDireta />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['MECANICO', 'ADMINISTRADOR']} />}>
          <Route path="/FixNRepair/" element={<RepairsLayout />}>
            <Route path="diagnosticos" element={<Dashboard />}/>
            <Route path="reparacoes" element={<Repairs />} />
            <Route index element={<Dashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
          <Route path="/FixNManage/" element={<AdminLayout/>}>
            <Route path="encomendas" element={<StockOrders/>}/>
            <Route path="dashboard" element={<AdminDashboard/>}/>
            <Route path="users" element={<UserManagement/>}/>
            <Route path="promocoes" element={<Promotions/>}/>
            <Route path="pecas" element={<PecasDashboard/>}/>
            <Route path="intervencoes" element={<IntervencoesCatalogoManagement/>}/>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}