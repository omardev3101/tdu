import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, DollarSign, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ConfigurarMembro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('acesso');
  const [loading, setLoading] = useState(true);
  const [membro, setMembro] = useState(null);

  // Estado atualizado com balance_retroactive
  const [config, setConfig] = useState({
    password: '',
    monthly_fee: '100.00',
    due_day: '10',
    balance_retroactive: '0.00', // Novo campo para valores em aberto
    access_level: 'Membro'
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const res = await api.get(`/admin/members/${id}`);
        setMembro(res.data);
      } catch (err) {
        alert("Erro ao carregar dados do membro.");
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/admin/configurar-membro/${id}`, config);
      alert("Membro configurado e ativado com sucesso! Axé.");
      navigate('/dashboard/solicitacoes'); // Caminho completo corrigido
    } catch (err) {
      alert("Erro ao salvar configurações.");
    }
  };

  if (loading) return <div className="p-20 text-center text-white font-black tracking-widest animate-pulse">CARREGANDO DADOS...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> Voltar para solicitações
      </button>

      {/* HEADER DO PERFIL */}
      <div className="flex items-center gap-6 mb-10 bg-slate-900/20 p-6 rounded-[32px] border border-slate-800/50">
        <div className="w-24 h-24 rounded-full border-2 border-red-600 overflow-hidden shadow-xl shadow-red-900/20">
          <img 
            src={membro?.photo_url ? `http://localhost:3000/uploads/${membro.photo_url}` : 'https://via.placeholder.com/150'} 
            alt="Membro" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{membro?.full_name}</h1>
          <div className="flex gap-2 mt-1">
            <span className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">{membro?.category}</span>
            <span className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.2em]">| ID: {id}</span>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('acesso')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'acesso' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ShieldCheck size={16} /> Acesso ao Sistema
        </button>
        <button 
          onClick={() => setActiveTab('financeiro')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'financeiro' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <DollarSign size={16} /> Gestão Financeira
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 backdrop-blur-xl mb-8 shadow-2xl">
        {activeTab === 'acesso' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">E-mail de Login (Inalterável)</label>
              <input type="text" value={membro?.email} disabled className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-slate-500 cursor-not-allowed font-medium" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Definir Senha Temporária</label>
              <input 
                type="password" 
                placeholder="Ex: TDU@2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-red-600 outline-none transition-colors" 
                onChange={(e) => setConfig({...config, password: e.target.value})}
              />
              <p className="text-[9px] text-slate-600 mt-2 italic">* O membro poderá alterar esta senha no primeiro acesso.</p>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Valor da Mensalidade (R$)</label>
                <input 
                  type="number" 
                  value={config.monthly_fee}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-red-600 outline-none transition-colors font-bold" 
                  onChange={(e) => setConfig({...config, monthly_fee: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Dia de Vencimento</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-red-600 outline-none transition-colors font-bold appearance-none"
                  value={config.due_day}
                  onChange={(e) => setConfig({...config, due_day: e.target.value})}
                >
                  <option value="5">Todo dia 05</option>
                  <option value="10">Todo dia 10</option>
                  <option value="15">Todo dia 15</option>
                  <option value="20">Todo dia 20</option>
                </select>
              </div>
            </div>

            {/* CAMPO DE VALORES EM ABERTO ANTERIOR */}
            <div className="pt-4 border-t border-slate-800/50">
              <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-2 mb-2 tracking-widest">
                <AlertCircle size={14} /> Saldo Devedor Retroativo (R$)
              </label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-amber-600/5 border border-amber-600/20 rounded-xl px-4 py-4 text-amber-500 focus:border-amber-600 outline-none transition-colors font-mono font-bold" 
                onChange={(e) => setConfig({...config, balance_retroactive: e.target.value})}
              />
              <p className="text-[9px] text-slate-600 mt-2 uppercase font-bold tracking-tighter">
                Este valor será somado ao primeiro débito do membro no sistema.
              </p>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-emerald-900/40 active:scale-[0.98]"
      >
        <Save size={18} /> Finalizar Configuração e Ativar
      </button>
    </div>
  );
};

export default ConfigurarMembro;