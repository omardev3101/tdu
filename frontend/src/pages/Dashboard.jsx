import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, DollarSign, Calendar, LogOut, Heart, 
  LayoutDashboard, UserPlus, Handshake 
} from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo-tdu.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingAgreements, setPendingAgreements] = useState(0); // Novo estado
  const user = JSON.parse(localStorage.getItem('@TDU:user'));

  // Função centralizada de busca de notificações
  async function fetchBadges() {
    try {
      const [requestsRes, agreementsRes] = await Promise.all([
        api.get('/admin/solicitacoes-pendentes'),
        api.get('/agreements') // Buscamos todos os acordos
      ]);
      
      setPendingRequests(requestsRes.data.length);
      
      // Filtramos apenas os que não foram aceitos (termsAccepted: false)
      const pendingTerms = agreementsRes.data.filter(a => !a.termsAccepted).length;
      setPendingAgreements(pendingTerms);
      
    } catch (err) {
      console.error("Erro ao buscar contadores", err);
    }
  }

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000); 
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  const activeClass = (path) => 
    location.pathname === path 
      ? "bg-red-900/20 text-red-500 border-r-2 border-red-600 shadow-[inset_0_0_15px_rgba(220,38,38,0.1)]" 
      : "text-slate-400 hover:text-white hover:bg-slate-800/50";

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col">
        <div className="mb-10 text-center">
          <div className="mb-2">
  <div className="mb-2">
  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.2)]">
    <img 
      src={logo} 
      alt="Logo TDU" 
      className="w-16 h-16 object-contain" 
    />
  </div>
</div>
</div>
          <h2 className="text-2xl font-black text-red-600 tracking-tighter italic">7 CAVEIRAS</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Gestão de Terreiro</p>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard')}`}>
            <LayoutDashboard size={18} /> Início
          </Link>

          {/* SOLICITAÇÕES */}
          <Link to="/dashboard/solicitacoes" className={`flex items-center justify-between p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/solicitacoes')}`}>
            <div className="flex items-center gap-3">
              <UserPlus size={18} /> Solicitações
            </div>
            {pendingRequests > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-lg shadow-red-900/40 animate-pulse">
                {pendingRequests}
              </span>
            )}
          </Link>
          
          <Link to="/dashboard/members" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/members')}`}>
            <Users size={18} /> Membros
          </Link>

          <Link to="/dashboard/finance" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/finance')}`}>
            <DollarSign size={18} /> Financeiro
          </Link>

          {/* ACORDOS COM BADGE DE TERMOS PENDENTES */}
          <Link to="/dashboard/agreements" className={`flex items-center justify-between p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/agreements')}`}>
            <div className="flex items-center gap-3">
              <Handshake size={18} /> Acordos
            </div>
            {pendingAgreements > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-lg shadow-emerald-900/40">
                {pendingAgreements}
              </span>
            )}
          </Link>

          <Link to="/dashboard/calendar" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/calendar')}`}>
            <Calendar size={18} /> Agenda
          </Link>
          
          <Link to="/dashboard/records" className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeClass('/dashboard/records')}`}>
            <Heart size={18} /> Doações
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 p-4 transition-all mt-auto border-t border-slate-800 group font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Sair do Sistema
        </button>
      </aside>

      {/* Conteúdo Principal (sem alterações aqui para manter a lógica do Outlet) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-8 py-4 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Admin Panel v2.6</span>
            <span className="text-sm font-medium text-slate-300 italic">
              Axé, <b className="text-white not-italic">{user?.name}</b>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{user?.role}</p>
              <p className="text-[9px] text-slate-600 font-bold tracking-widest">TDU7C-2026</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-950 rounded-xl flex items-center justify-center shadow-2xl shadow-red-900/20 text-white font-black italic border border-red-500/20">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
            <Outlet />
        </section>
      </main>
    </div>
  );
}