import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { path: '/dashboard/members', icon: Users, label: 'Membros' },
    { path: '/dashboard/finance', icon: DollarSign, label: 'Financeiro' },
    { path: '/dashboard/calendar', icon: CalendarIcon, label: 'Calendário' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('@TDU:token');
    navigate('/');
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Logo / Nome do Sistema */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <div>
            <h1 className="text-white font-black tracking-tighter text-xl uppercase">TDU System</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-red-600/10 text-red-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-white'} />
                <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-sm uppercase"
        >
          <LogOut size={22} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}