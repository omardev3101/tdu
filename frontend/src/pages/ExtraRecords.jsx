import { useEffect, useState } from 'react';
import { Heart, Hammer, Plus, Users, Check, X, Info, Search, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ExtraRecords() {
  const [activeTab, setActiveTab] = useState('Doação'); 
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para seleção híbrida
  const [externalName, setExternalName] = useState('');
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
        api.get('/admin/members')
      ]);
      setRecords(recRes.data || []);
      setMembers(memRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 1. Ajuste a função de seleção (Removendo o "Number" para ser compatível com qualquer ID)
const toggleMember = (id) => {
  // Se clicar em um membro, limpamos o campo de nome externo para não dar conflito
  setExternalName(''); 
  
  setSelectedMembers(prev => {
    const isSelected = prev.includes(id);
    if (isSelected) {
      return prev.filter(mId => mId !== id);
    } else {
      return [...prev, id];
    }
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação: Precisa de um nome externo OU pelo menos um membro selecionado
    if (!externalName.trim() && selectedMembers.length === 0) {
      return alert("Por favor, digite um nome ou selecione um membro da casa.");
    }

    try {
      const dataToSend = {
        ...formData,
        value: parseFloat(formData.value),
        type: activeTab,
        memberIds: selectedMembers,
        external_donor: externalName.trim() || null 
      };

      await api.post('/extra-records', dataToSend);
      
      setShowModal(false);
      setSelectedMembers([]);
      setExternalName('');
      setFormData({ 
        description: '', 
        value: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      loadData();
      alert("Registro salvo com sucesso! Axé.");
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar registro.");
    }
  };

  const filteredRecords = records.filter(r => 
    r.type === activeTab && 
    (r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.external_donor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.participants?.some(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-slate-200">
      
      {/* HEADER E NAVEGAÇÃO */}
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
            setExternalName('');
            setShowModal(true);
          }}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </div>

      {/* BUSCA */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-4 shadow-lg">
        <Search className="text-slate-600 ml-2" size={20} />
        <input 
          type="text" 
          placeholder={`BUSCAR EM ${activeTab.toUpperCase()}S...`}
          className="bg-transparent border-none outline-none text-white w-full font-bold text-xs uppercase tracking-widest"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6">Doador / Participante</th>
                <th className="p-6">Descrição</th>
                <th className="p-6 text-center">Data</th>
                <th className="p-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-500">
                    <Loader2 className="animate-spin text-red-600 mx-auto mb-2" size={40} />
                    Carregando registros...
                  </td>
                </tr>
              ) : filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-6">
                    {r.external_donor ? (
                       <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-400 uppercase text-xs">{r.external_donor}</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Externo</span>
                       </div>
                    ) : r.participants?.length > 1 ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl"><Users size={16}/></div>
                        <div>
                          <p className="font-black text-white uppercase text-[11px]">Coletivo</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{r.participants.length} Membros</p>
                        </div>
                      </div>
                    ) : (
                      <span className="font-black text-white uppercase text-xs">
                        {r.participants?.[0]?.full_name || 'Não identificado'}
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
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Registrar {activeTab}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SEÇÃO HÍBRIDA DE IDENTIFICAÇÃO */}
              // 2. No seu JSX, dentro do Modal, substitua a seção de seleção por esta:
<div className="space-y-4">
  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
    Quem realizou o {activeTab}?
  </label>
  
  {/* CAMPO PARA QUEM É DE FORA */}
  <input 
    type="text"
    placeholder="NOME DE PESSOA DE FORA (OPCIONAL)"
    className="w-full bg-black/60 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs uppercase focus:border-red-600 outline-none transition-all"
    value={externalName}
    onChange={(e) => {
      setExternalName(e.target.value);
      if(e.target.value) setSelectedMembers([]); // Desmarca membros se digitar nome
    }}
  />

  <div className="flex items-center gap-4 text-slate-800 py-2">
    <div className="h-px bg-slate-800 flex-1"></div>
    <span className="text-[8px] font-black uppercase tracking-tighter">Ou selecione da casa</span>
    <div className="h-px bg-slate-800 flex-1"></div>
  </div>

  {/* LISTA DE MEMBROS (O COMBO) */}
  <div className="bg-black/40 border border-slate-800 rounded-2xl p-2 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
    {members.length === 0 ? (
      <div className="p-4 text-center text-[10px] text-slate-600 uppercase font-black italic">
        Carregando filhos da casa...
      </div>
    ) : (
      members.map(m => {
        const isSelected = selectedMembers.includes(m.id);
        return (
          <div 
            key={m.id} 
            onClick={() => toggleMember(m.id)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer mb-1 transition-all border ${
              isSelected 
                ? 'bg-red-600/20 border-red-600/40 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                : 'hover:bg-slate-800 border-transparent'
            }`}
          >
            <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-white' : 'text-slate-500'}`}>
              {m.full_name}
            </span>
            {isSelected && <Check size={14} className="text-red-500" strokeWidth={3} />}
          </div>
        );
      })
    )}
  </div>
</div>
              {/* DESCRIÇÃO E VALORES */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Descrição</label>
                <input 
                  className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white font-bold text-xs uppercase focus:border-red-600 outline-none transition-all"
                  placeholder="EX: DOAÇÃO PARA O CAFÉ / AJUDA REFORMA"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Valor (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-emerald-500 font-mono font-black text-xl outline-none"
                    value={formData.value}
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

              <button 
                type="submit" 
                className={`w-full p-5 rounded-2xl font-black text-xs uppercase transition-all shadow-2xl active:scale-[0.98] ${activeTab === 'Doação' ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-amber-600 text-white hover:bg-amber-500'}`}
              >
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}