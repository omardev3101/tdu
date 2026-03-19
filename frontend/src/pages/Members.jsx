import { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Pencil, Trash2, ShieldCheck, Scroll, Loader2, MoreHorizontal } from 'lucide-react';
import MemberModal from '../components/MemberModal';
import MemberCard from '../components/MemberCard';

const API_URL = import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); 
  const [selectedForCard, setSelectedForCard] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      setMembers([]); 
      const response = await api.get('/admin/members');
      setMembers(response.data);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddMember() {
    setSelectedMember(null);
    setIsModalOpen(true);
  }

  function handleEditMember(member) {
    setSelectedMember(member);
    setIsModalOpen(true);
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return '---';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  async function handleDelete(id) {
    if (window.confirm('Deseja realmente excluir este membro do TDU?')) {
      try {
        await api.delete(`/admin/members/${id}`);
        loadMembers();
      } catch (error) {
        alert("Erro ao excluir membro.");
      }
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2 text-white uppercase italic tracking-tighter">
            <ShieldCheck className="text-red-600" /> Membros da Corrente
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest">Gerenciamento interno TDU</p>
        </div>
        
        <button 
          onClick={handleAddMember}
          className="w-full sm:w-auto bg-red-700 hover:bg-red-600 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition shadow-xl active:scale-95 text-white font-black text-xs uppercase tracking-widest"
        >
          <UserPlus size={18} /> Novo Membro
        </button>
      </div>

      {/* Container da Tabela / Cards */}
      <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* VIEW DESKTOP: Tabela (Visível em telas md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/40 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Membro</th>
                <th className="px-6 py-5">Categoria</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-lg">
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url.startsWith('http') 
                              ? member.photo_url 
                              : `${API_URL.replace(/\/$/, '')}/uploads/${member.photo_url}`} 
                            alt=""
                            className="w-full h-full object-cover z-10 relative"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center text-slate-600 font-black uppercase text-base">
                          {member.full_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-black text-slate-100 uppercase text-sm tracking-tighter">{member.full_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-bold">{formatarCPF(member.document_cpf)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-black uppercase tracking-widest">
                    {member.category}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                      member.status === 'Ativo' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {member.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedForCard(member)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition" title="Carteirinha"><Scroll size={18} /></button>
                      <button onClick={() => handleEditMember(member)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-xl transition" title="Editar"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW MOBILE: Lista de Cards (Visível abaixo de md) */}
        <div className="md:hidden divide-y divide-slate-800/50">
          {members.map(member => (
            <div key={member.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-xl">
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url.startsWith('http') 
                        ? member.photo_url 
                        : `${API_URL.replace(/\/$/, '')}/uploads/${member.photo_url}`} 
                      className="w-full h-full object-cover z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="absolute text-slate-600 font-black text-xl uppercase">{member.full_name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white uppercase text-sm truncate tracking-tighter">{member.full_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">{member.category}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${member.status === 'Ativo' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>{member.status || 'Pendente'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-slate-800">
                 <div className="text-[10px] text-slate-500 font-mono font-bold">{formatarCPF(member.document_cpf)}</div>
                 <div className="flex gap-1">
                    <button onClick={() => setSelectedForCard(member)} className="p-3 text-emerald-400 bg-emerald-400/5 rounded-xl"><Scroll size={18} /></button>
                    <button onClick={() => handleEditMember(member)} className="p-3 text-blue-400 bg-blue-400/5 rounded-xl"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(member.id)} className="p-3 text-red-500 bg-red-500/5 rounded-xl"><Trash2 size={18} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading ou Vazio */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Sincronizando Corrente...</span>
          </div>
        ) : members.length === 0 && (
          <div className="p-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest">Nenhum membro encontrado.</div>
        )}
      </div>

      <MemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={loadMembers} memberData={selectedMember} />
      <MemberCard member={selectedForCard} isOpen={!!selectedForCard} onClose={() => setSelectedForCard(null)} />
    </div>
  );
}