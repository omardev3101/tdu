import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// ... seus outros imports

// 1. Crie este componente de proteção dinâmica
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@TDU:token');
  return token ? children : <Navigate to="/" />;
};
console.log("Autenticado:", isAuth);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/validate/:id" element={<MemberValidate />} />

        {/* 2. Aplique a proteção aqui */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        >
          <Route index element={<DashboardHome />} />
          <Route path="members" element={<Members />} />
          <Route path="finance" element={<Finance />} />
          <Route path="calendar" element={<Calendar />} />
         <Route path="records" element={<ExtraRecords />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;