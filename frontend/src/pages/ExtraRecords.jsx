import { useEffect, useState } from 'react';
import { Heart, Hammer, Plus, Users, Check, X, Info, Search } from 'lucide-react';
import api from '../services/api';

export default function ExtraRecords() {
  const [activeTab, setActiveTab] = useState('Doação'); // 'Doação' ou 'Trabalho Extra'
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Formulário
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
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
    // Mapeia garantindo que todos os IDs sejam Numbers
    setSelectedMembers(members.map(m => Number(m.id)));
  }
};

  const toggleMember = (id) => {
    const targetId = Number(id);
    setSelectedMembers(prev => 
      prev.includes(targetId) ? prev.filter(mId => mId !== targetId) : [...prev, targetId]
    );
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
      setFormData({ ...formData, description: '', value: '' });
      loadData();
    } catch (err) {
      alert("Erro ao salvar registro.");
    }
  };

  // Filtros
  const filteredRecords = records.filter(r => 
    r.type === activeTab && 
    (r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.participants?.some(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER E NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          <button 
            onClick={() => setActiveTab('Doação')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'Doação' ? 'bg-red-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Heart size={16} /> Doações
          </button>
          <button 
            onClick={() => setActiveTab('Trabalho Extra')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'Trabalho Extra' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Hammer size={16} /> Trabalhos Extras
          </button>
        </div>

        <button 
          onClick={() => {
            setSelectedMembers([]);
            setShowModal(true);
          }}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </div>

      {/* ÁREA DE BUSCA */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-4">
        <Search className="text-slate-600 ml-2" size={20} />
        <input 
          type="text" 
          placeholder={`BUSCAR EM ${activeTab.toUpperCase()}S...`}
          className="bg-transparent border-none outline-none text-white w-full font-bold text-xs uppercase tracking-widest"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELA DE REGISTROS */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6">Participante(s)</th>
                <th className="p-6">Descrição</th>
                <th className="p-6 text-center">Data</th>
                <th className="p-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-6">
                    {r.participants?.length > 1 ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl"><Users size={16}/></div>
                        <div>
                          <p className="font-black text-white uppercase text-[11px]">Coletivo</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{r.participants.length} Membros</p>
                        </div>
                        <div className="group relative">
                          <Info size={14} className="text-slate-600 cursor-help ml-2" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black border border-slate-800 p-4 rounded-2xl w-48 shadow-2xl z-50">
                            {r.participants.map(p => (
                              <div key={p.id} className="text-[9px] text-slate-400 font-black uppercase py-1 border-b border-slate-900 last:border-0">• {p.full_name}</div>
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
                  <td className="p-6 text-slate-300 text-xs font-bold uppercase italic tracking-wider">{r.description}</td>
                  <td className="p-6 text-center text-slate-500 text-xs font-mono">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td className={`p-6 text-right font-mono font-black text-sm italic ${activeTab === 'Doação' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    R$ {Number(r.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="p-24 text-center text-slate-700 font-black uppercase text-[10px] tracking-[0.4em]">Sem registros encontrados</div>
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Registrar {activeTab}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecionar Membro(s)</label>
                  <button type="button" onClick={handleSelectAll} className="text-[9px] font-black text-red-500 uppercase px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    {selectedMembers.length === members.length ? 'Limpar' : 'Todos'}
                  </button>
                </div>
                <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto grid grid-cols-1 gap-2">
  {members.map(m => {
    const isSelected = selectedMembers.includes(Number(m.id));
    return (
      <div 
        key={m.id} 
        onClick={() => toggleMember(m.id)}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer select-none transition-all ${
          isSelected 
            ? 'bg-red-600/10 border-red-600/30 border' 
            : 'hover:bg-slate-800 border border-transparent'
        }`}
      >
        <span className={`text-[11px] font-black uppercase ${
          isSelected ? 'text-white' : 'text-slate-600'
        }`}>
          {m.full_name}
        </span>
        {isSelected && <Check size={14} className="text-red-500" />}
      </div>
    );
  })}
</div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Descrição</label>
                <input 
                  className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs uppercase focus:border-red-600 outline-none transition-all"
                  placeholder="EX: DOAÇÃO SEDE / REFORMA PORTÃO"
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Valor Unitário (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-emerald-500 font-mono font-black text-xl outline-none"
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Data</label>
                  <input 
                    type="date"
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={`w-full p-5 rounded-2xl font-black text-xs uppercase transition-all shadow-2xl active:scale-[0.98] ${activeTab === 'Doação' ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-amber-600 text-white hover:bg-amber-500'}`}>
                Confirmar {activeTab}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}