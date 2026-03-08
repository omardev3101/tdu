import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import api from '../services/api'; 

const Solicitacoes = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPendentes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/solicitacoes-pendentes');
      setPendentes(res.data);
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
    if (window.confirm(`Confirmar a entrada de ${nome} na casa?`)) {
      try {
        await api.put(`/admin/aprovar/${id}`);
        alert(`${nome} agora é um membro ativo!`);
        carregarPendentes();
      } catch (err) {
        alert("Erro ao aprovar membro.");
      }
    }
  };

  // NOVA FUNÇÃO: Descartar solicitação
  const handleDescartar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja DESCARTAR a solicitação de ${nome}?\nIsso apagará os dados permanentemente.`)) {
      try {
        await api.delete(`/admin/descartar/${id}`);
        alert(`Solicitação de ${nome} removida.`);
        carregarPendentes();
      } catch (err) {
        console.error(err);
        alert("Erro ao descartar solicitação.");
      }
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      {/* Header da Página */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Solicitações</h1>
          <p className="text-slate-500 text-sm font-medium">Membros aguardando aprovação da diretoria</p>
        </div>
        <div className="bg-red-900/20 border border-red-900/30 px-4 py-1 rounded-full shadow-lg shadow-red-900/10">
          <span className="text-red-500 text-xs font-black uppercase tracking-widest">
            {pendentes.length} Pendentes
          </span>
        </div>
      </div>

      {/* Tabela Estilo Dark TDU */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 text-[10px] uppercase tracking-[0.25em]">
                <th className="p-5 font-black">Nome do Filho(a)</th>
                <th className="p-5 font-black">WhatsApp</th>
                <th className="p-5 font-black">Categoria</th>
                <th className="p-5 font-black">Data de Envio</th>
                <th className="p-5 font-black text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-800/50">
              {loading ? (
                 <tr>
                   <td colSpan="5" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                     Sincronizando com a casa...
                   </td>
                 </tr>
              ) : pendentes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <Clock className="mx-auto mb-4 text-slate-800" size={48} />
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">O terreiro está em dia. Ninguém na fila.</p>
                  </td>
                </tr>
              ) : (
                pendentes.map(membro => (
                  <tr key={membro.id} className="hover:bg-red-600/[0.02] transition-colors group">
                    <td className="p-5 font-bold text-white group-hover:text-red-500 transition-colors">{membro.full_name}</td>
                    <td className="p-5 text-slate-400 font-medium">{membro.phone_whatsapp}</td>
                    <td className="p-5">
                      <span className="bg-slate-950 text-slate-400 text-[9px] px-2.5 py-1 rounded border border-slate-800 uppercase font-black tracking-tighter">
                        {membro.category}
                      </span>
                    </td>
                    <td className="p-5 text-slate-500 text-xs tabular-nums">
                      {new Date(membro.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleAprovar(membro.id, membro.full_name)}
                          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white px-4 py-2 rounded-xl border border-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <UserCheck size={14} /> Aprovar
                        </button>
                        
                        {/* BOTÃO ATUALIZADO */}
                        <button 
                          onClick={() => handleDescartar(membro.id, membro.full_name)}
                          className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <UserX size={14} /> Descartar
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
    </div>
  );
};

export default Solicitacoes;