import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/sessions', { email, password });
      localStorage.setItem('@TDU:token', response.data.token);
      localStorage.setItem('@TDU:user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Erro ao acessar. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TDU - 7 Caveiras</h1>
          <p className="text-slate-400">Gestão de Terreiro & Financeiro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="email" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="password" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95"
          >
            Entrar no Terreiro
          </button>
        </form>
      </div>
    </div>
  );
}