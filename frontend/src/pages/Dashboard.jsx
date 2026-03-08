import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, DollarSign, Calendar, LogOut, Heart, 
  LayoutDashboard, UserPlus 
} from 'lucide-react';
import api from '../services/api'; // Importe sua API dinâmica

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('@TDU:user'));

  // Função para buscar o número de solicitações pendentes
  async function fetchPendingCount() {
    try {
      const res = await api.get('/admin/solicitacoes-pendentes');
      setPendingCount(res.data.length);
    } catch (err) {
      console.error("Erro ao buscar contador", err);
    }
  }

  // Busca o contador ao carregar e a cada 30 segundos (opcional)
  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); 
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  const activeClass = (path) => 
    location.pathname === path 
      ? "bg-red-900/20 text-red-500 border-r-2 border-red-600" 
      : "text-slate-400 hover:text-white hover:bg-slate-800";

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-black text-red-600 tracking-tighter">7 CAVEIRAS</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Gestão de Terreiro</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition ${activeClass('/dashboard')}`}>
            <LayoutDashboard size={20} /> Início
          </Link>

          {/* LINK SOLICITAÇÕES COM BADGE DINÂMICO */}
          <Link 
            to="/dashboard/solicitacoes" 
            className={`flex items-center justify-between p-3 rounded-xl transition ${activeClass('/dashboard/solicitacoes')}`}
          >
            <div className="flex items-center gap-3">
              <UserPlus size={20} />
              <span>Solicitações</span>
            </div>
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
                {pendingCount}
              </span>
            )}
          </Link>
          
          <Link to="/dashboard/members" className={`flex items-center gap-3 p-3 rounded-xl transition ${activeClass('/dashboard/members')}`}>
            <Users size={20} /> Membros
          </Link>

          <Link to="/dashboard/finance" className={`flex items-center gap-3 p-3 rounded-xl transition ${activeClass('/dashboard/finance')}`}>
            <DollarSign size={20} /> Financeiro
          </Link>

          <Link to="/dashboard/calendar" className={`flex items-center gap-3 p-3 rounded-xl transition ${activeClass('/dashboard/calendar')}`}>
            <Calendar size={20} /> Agenda
          </Link>
          
          <Link to="/dashboard/records" className={`flex items-center gap-3 p-3 rounded-xl transition ${activeClass('/dashboard/records')}`}>
            <Heart size={20} /> Trabalhos e Doações
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 p-3 transition mt-auto border-t border-slate-800 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Sair do Sistema
        </button>
      </aside>

      {/* Área de Conteúdo Dinâmico */}
      <main className="flex-1 flex flex-col h-screen">
        <header className="px-8 py-4 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Painel Administrativo</span>
            <span className="text-sm font-medium text-slate-300">
              Axé, <b className="text-white">{user?.name}</b>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user?.role?.toUpperCase()}</p>
              <p className="text-[10px] text-slate-500">TDU7C-2026</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 text-white font-black">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>

          <footer className="mt-auto pt-8 pb-4 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 px-8 bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
                <span className="text-red-500 font-black text-xs italic">7C</span>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[8px] tracking-[0.2em] leading-none">Plataforma de Gestão</p>
                <h3 className="text-white font-black uppercase text-[10px] tracking-widest">TDU - 7 Caveiras</h3>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-slate-500 font-medium text-[9px] uppercase tracking-widest">
                Criado e Desenvolvido por
              </p>
              <p className="text-white font-black uppercase text-[12px] tracking-tighter mt-1 group cursor-default">
                <span className="text-red-600 animate-pulse">●</span> OMAR RODRIGUES <span className="text-slate-500 font-light mx-1">|</span> <span className="text-slate-300">Desenvolvedor</span>
              </p>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}