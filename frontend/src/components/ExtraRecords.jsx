import { useEffect, useState } from 'react';
import { Heart, Hammer, Plus, Users, Check, X, Info } from 'lucide-react';
import api from '../services/api';

export default function ExtraRecords() {
  const [activeTab, setActiveTab] = useState('Doação');
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estados do Formulário
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, memRes] = await Promise.all([
        api.get('/extra-records'),
        api.get('/members')
      ]);
      setRecords(recRes.data);
      setMembers(memRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.id));
    }
  };

  const toggleMember = (id) => {
  const targetId = Number(id); // Sempre garanta que é número

  setSelectedMembers(prev => {
    // Verifica se já está selecionado
    const exists = prev.find(mId => Number(mId) === targetId);
    
    if (exists) {
      return prev.filter(mId => Number(mId) !== targetId);
    } else {
      return [...prev, targetId];
    }
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return alert("Selecione ao menos um membro.");

    try {
      await api.post('/extra-records', { 
        ...formData, 
        type: activeTab,
        memberIds: selectedMembers 
      });
      setShowModal(false);
      setSelectedMembers([]);
      loadData();
    } catch (err) {
      alert("Erro ao salvar registro.");
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('Doação')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'Doação' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Heart size={16} /> Doações
          </button>
          <button 
            onClick={() => setActiveTab('Trabalho Extra')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'Trabalho Extra' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Hammer size={16} /> Trabalhos Extras
          </button>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
        >
          <Plus size={18} /> Novo Registro
        </button>
      </div>

      {/* Tabela de Registros */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6">Participante(s)</th>
                <th className="p-6">Descrição / Motivo</th>
                <th className="p-6">Data</th>
                <th className="p-6 text-right">Valor Individual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {records.filter(r => r.type === activeTab).map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-6">
                    {r.participants?.length > 1 ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg"><Users size={14}/></div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase text-[11px]">Trabalho Coletivo</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{r.participants.length} Membros</span>
                        </div>
                        {/* Tooltip simples ou info */}
                        <div className="group relative ml-2">
                            <Info size={14} className="text-slate-700 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black p-3 rounded-xl border border-slate-800 w-48 shadow-2xl z-10">
                                {r.participants.map(p => (
                                    <div key={p.id} className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-800 py-1 last:border-0">
                                        • {p.full_name}
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    ) : (
                      <span className="font-black text-white uppercase text-xs">
                        {r.participants?.[0]?.full_name || 'Anônimo'}
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-slate-400 text-xs font-bold uppercase italic tracking-wider">{r.description}</td>
                  <td className="p-6 text-slate-500 text-xs font-mono">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-6 text-right font-mono text-emerald-500 font-black text-sm italic">
                    R$ {Number(r.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Multi-Seleção */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Registrar {activeTab}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Membros com Scroll */}
              <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vincular a:</label>
                    <button type="button" onClick={handleSelectAll} className="text-[9px] font-black text-red-500 uppercase px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        {selectedMembers.length === members.length ? 'Limpar Todos' : 'Selecionar Todos'}
                    </button>
                </div>
                <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto grid grid-cols-1 gap-2 custom-scrollbar">
                    {members.map(m => (
                        <div 
                            key={m.id} 
                            onClick={() => toggleMember(m.id)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedMembers.includes(m.id) ? 'bg-red-600/10 border border-red-600/30' : 'hover:bg-slate-800 border border-transparent'}`}
                        >
                            <span className={`text-[11px] font-black uppercase ${selectedMembers.includes(m.id) ? 'text-white' : 'text-slate-500'}`}>{m.full_name}</span>
                            {selectedMembers.includes(m.id) && <Check size={14} className="text-red-500" />}
                        </div>
                    ))}
                </div>
                <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest italic">{selectedMembers.length} selecionados</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Descrição</label>
                <input 
                  className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs uppercase focus:border-red-600 outline-none transition-all placeholder:text-slate-800"
                  placeholder="Ex: Doação churrasco / Mutirão pintura"
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Valor Unitário (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-emerald-500 font-mono font-black text-lg outline-none focus:border-emerald-600"
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Data</label>
                  <input 
                    type="date"
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs outline-none focus:border-red-600"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full p-5 rounded-2xl font-black text-xs uppercase bg-white text-black hover:bg-slate-200 transition-all shadow-2xl active:scale-[0.98]">
                Finalizar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}