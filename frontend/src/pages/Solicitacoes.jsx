import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 

const Solicitacoes = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarPendentes = async () => {
    try {
      setLoading(true);
      // Rota alinhada com seu routes.js
      const res = await api.get('/admin/solicitacoes-pendentes');
      setPendentes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao buscar solicitações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPendentes();
  }, []);

  const handleAprovar = async (id, nome) => {
    if (window.confirm(`Deseja aprovar ${nome}? Você será redirecionado para configurar o acesso e o financeiro.`)) {
      try {
        // 1. Chamada ao backend para mudar status para 'Ativo'
        await api.put(`/admin/aprovar/${id}`);
        
        // 2. Navega para a página de configuração do membro recém-aprovado
        navigate(`/dashboard/members/${id}`); 
        
      } catch (err) {
        console.error(err);
        alert("Erro ao aprovar membro no banco de dados.");
      }
    }
  };

  const handleDescartar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja DESCARTAR a solicitação de ${nome}?`)) {
      try {
        await api.delete(`/admin/descartar/${id}`);
        carregarPendentes();
      } catch (err) {
        alert("Erro ao descartar.");
      }
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Fila de Aprovação</h1>
          <p className="text-slate-500 text-sm font-medium italic mt-1">"A casa acolhe, a diretoria organiza."</p>
        </div>
        <div className="bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full">
          <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
            {pendentes.length} Pendentes
          </span>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-500 text-[10px] uppercase tracking-[0.25em]">
                <th className="p-6 font-black">Nome do Irmão(ã)</th>
                <th className="p-6 font-black">Categoria</th>
                <th className="p-6 font-black text-center">Entrada</th>
                <th className="p-6 font-black text-right">Decisão</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-800/30">
              {loading ? (
                 <tr>
                    <td colSpan="4" className="p-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-red-600" size={40} />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 animate-pulse">Sincronizando Axé...</span>
                      </div>
                    </td>
                 </tr>
              ) : pendentes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-24 text-center">
                    <Clock className="mx-auto mb-4 text-slate-800" size={48} />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tudo em dia. Nenhuma solicitação.</p>
                  </td>
                </tr>
              ) : (
                pendentes.map(membro => (
                  <tr key={membro.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight text-sm">
                          {membro.full_name}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">{membro.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="bg-slate-950 text-slate-400 text-[9px] px-3 py-1 rounded-lg border border-slate-800 uppercase font-black tracking-tighter">
                        {membro.category}
                      </span>
                    </td>
                    <td className="p-6 text-center text-slate-500 text-xs tabular-nums font-medium">
                      {/* Suporte para createdAt ou created_at */}
                      {membro.createdAt || membro.created_at 
                        ? new Date(membro.createdAt || membro.created_at).toLocaleDateString('pt-BR') 
                        : '---'}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleAprovar(membro.id, membro.full_name)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                        >
                          <UserCheck size={14} /> Aprovar
                        </button>
                        
                        <button 
                          onClick={() => handleDescartar(membro.id, membro.full_name)}
                          className="flex items-center gap-2 bg-slate-800/40 hover:bg-red-600/20 hover:text-red-500 text-slate-500 px-4 py-3 rounded-2xl border border-transparent hover:border-red-600/30 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-slate-700 uppercase font-black tracking-[0.3em] text-center">
        TDU 7 Caveiras - Gestão de Terreiro
      </p>
    </div>
  );
};

export default Solicitacoes;