import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import DashboardHome from './pages/DashboardHome';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import MemberValidate from './pages/MemberValidate';
import ExtraRecords from './pages/ExtraRecords';
import FormSolicitacao from './pages/FormSolicitacao'; 
import Solicitacoes from './pages/Solicitacoes';
import ConfigurarMembro from './pages/ConfigurarMembro';
import Agreements from './pages/Agreements';

// Função para verificar autenticação
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@TDU:token');
  return token ? children : <Navigate to="/" />;
};



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/" element={<Login />} />
        
        {/* Cadastro público para os filhos (Biometria Facial) */}
        <Route path="/solicitacao" element={<FormSolicitacao />} />
        
        {/* Validação rápida / QR Code */}
        <Route path="/validar" element={<MemberValidate />} />

        {/* --- ROTAS PRIVADAS (Dashboard) --- */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* IMPORTANTE: Sub-rotas não devem começar com "/" 
              Elas são relativas ao pai (/dashboard)
          */}
          <Route index element={<DashboardHome />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<ConfigurarMembro />} /> {/* Corrigido: removida a "/" */}
          <Route path="solicitacoes" element={<Solicitacoes />} />
          <Route path="finance" element={<Finance />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="records" element={<ExtraRecords />} />
          <Route path="agreements" element={<Agreements />} />
        </Route>

        {/* Redirecionamento Global */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;