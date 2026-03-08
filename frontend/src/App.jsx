import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import DashboardHome from './pages/DashboardHome';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import MemberValidate from './pages/MemberValidate';
import ExtraRecords from './pages/ExtraRecords';
import FormSolicitacao from './pages/FormSolicitacao'; // Importado corretamente
import Solicitacoes from './pages/Solicitacoes';

// Função para verificar autenticação em tempo real
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@TDU:token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROTAS PÚBLICAS (Acesso sem Login) --- */}
        <Route path="/" element={<Login />} />
        
        {/* Rota para os filhos da casa preencherem o cadastro pelo celular */}
        <Route path="/solicitacao" element={<FormSolicitacao />} />
        
        {/* Rota de validação de membro (útil para QR Code ou consulta rápida) */}
        <Route path="/validar" element={<MemberValidate />} />

        {/* --- ROTAS PRIVADAS (Requerem Login) --- */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Sub-rotas do Dashboard (carregam dentro do Outlet do Dashboard) */}
          <Route index element={<DashboardHome />} />
          <Route path="members" element={<Members />} />
          <Route path="solicitacoes" element={<Solicitacoes />} /> {/* Nova Rota */}
          <Route path="finance" element={<Finance />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="records" element={<ExtraRecords />} />
        </Route>

        {/* Redirecionamento Global para segurança */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;