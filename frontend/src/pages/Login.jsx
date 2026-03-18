import { useState } from 'react';
import api from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

// 1. Importe o seu logo (certifique-se de que o caminho está correto)
import logo from '../assets/logo-tdu.png'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/sessions', { email, password });
      
      localStorage.setItem('@TDU:token', response.data.token);
      localStorage.setItem('@TDU:user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erro ao acessar. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        
        <div className="text-center mb-8">
          {/* --- BLOCO DO LOGO COM FUNDO BRANCO --- */}
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)] border-2 border-slate-800">
              <img 
                src={logo} 
                alt="Logo TDU" 
                className="w-20 h-20 object-contain" 
              />
            </div>
          </div>
          {/* -------------------------------------- */}

          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">
            TDU - 7 Caveiras
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
            Painel Administrativo
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="email" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-600 transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="password" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-600 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
          >
            Entrar no TDU 7 Caveiras
          </button>
        </form>
        
        <p className="text-center text-slate-600 text-[10px] uppercase mt-8 tracking-widest font-bold">
          Segurança e Fundamento © 2026
        </p>
      </div>
    </div>
  );
}