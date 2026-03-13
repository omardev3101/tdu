import { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Pencil, Trash2, ShieldCheck, Scroll, Loader2 } from 'lucide-react';
import MemberModal from '../components/MemberModal';
import MemberCard from '../components/MemberCard';

// Definição da URL da API (Render ou Local)
const API_URL = import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); 
  const [selectedForCard, setSelectedForCard] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      const response = await api.get('/admin/members'); // Ajustado para sua rota protegida
      setMembers(response.data);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
    } finally {
      setLoading(false);
    }
  }

  // Abre modal para criação
  function handleAddMember() {
    setSelectedMember(null);
    setIsModalOpen(true);
  }

  // Abre modal para edição
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
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-red-600" /> Membros da Corrente
          </h1>
          <p className="text-slate-400 text-sm">Gerenciamento interno TDU - 7 Caveiras</p>
        </div>
        
        <button 
          onClick={handleAddMember}
          className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg active:scale-95 text-white font-bold"
        >
          <UserPlus size={20} /> Novo Membro
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Membro</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-800">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Miniatura da foto na tabela com tratamento de URL dinâmica */}
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
  {member.photo_url ? (
    <img 
      src={member.photo_url.startsWith('http') ? member.photo_url : `${API_URL}/uploads/${member.photo_url}`} 
      className="w-full h-full object-cover z-10"
      alt=""
      // Se a imagem falhar, escondemos ela para mostrar a inicial que está atrás
      onError={(e) => { e.target.style.display = 'none'; }} 
    />
  ) : null}
  
  {/* Esta letra fica "atrás" da imagem e só aparece se a imagem não carregar */}
  <span className="absolute text-slate-500 font-black uppercase text-xs">
    {member.full_name ? member.full_name.charAt(0) : '?'}
  </span>
</div>
                    <div>
                      <div className="font-medium text-slate-200">{member.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                        {formatarCPF(member.document_cpf)}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                  {member.category}
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    member.status === 'Ativo' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {member.status || 'Pendente'}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {/* Botão da Carteirinha */}
                    <button 
                      onClick={() => setSelectedForCard(member)}
                      className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition"
                      title="Imprimir Carteirinha"
                    >
                      <Scroll size={18} />
                    </button>

                    {/* Botão Editar */}
                    <button 
                      onClick={() => handleEditMember(member)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                      title="Editar Perfil"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Botão Excluir */}
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Loading ou Vazio */}
        {loading ? (
          <div className="p-20 text-center text-slate-500 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <span className="animate-pulse">Sincronizando dados...</span>
          </div>
        ) : members.length === 0 && (
          <div className="p-20 text-center text-slate-500">
            Nenhum membro encontrado.
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <MemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={loadMembers} 
        memberData={selectedMember} 
      />

      {/* Modal da Carteirinha Digital */}
      <MemberCard 
        member={selectedForCard} 
        isOpen={!!selectedForCard} 
        onClose={() => setSelectedForCard(null)} 
      />
    </div>
  );
}