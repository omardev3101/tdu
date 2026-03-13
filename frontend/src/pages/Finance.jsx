import { useEffect, useState } from 'react';
import { DollarSign, Search, Plus, CheckCircle, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Finance() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Carregar dados do backend
  const loadData = async () => {
    try {
      setLoading(true);
      // Rota alinhada com a segurança do backend
      const res = await api.get('/contributions');
      setContributions(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar financeiro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Função para Gerar Mensalidades
  const handleGenerate = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (!window.confirm(`Gerar mensalidades de ${month}/${year} para todos os membros ativos?`)) return;

    try {
      // Usando rota protegida para geração
      const res = await api.post('/contributions/generate', { month, year });
      alert(res.data.message || "Mensalidades geradas com sucesso! Axé.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao gerar mensalidades. Verifique se já foram geradas.");
    }
  };

  // 3. Função para Dar Baixa (Pagamento)
  const handlePay = async (id) => {
    if (!window.confirm("Confirmar recebimento deste pagamento?")) return;

    try {
      // Rota para processar pagamento
      await api.put(`/contributions/${id}/pay`, { paymentMethod: 'Pix' });
      loadData();
    } catch (err) {
      alert("Erro ao processar pagamento no servidor.");
    }
  };

  // 4. Cálculos de Resumo
  const totalPaid = contributions
    .filter(c => c.status === 'Pago')
    .reduce((acc, c) => acc + Number(c.value), 0);
  
  const totalPending = contributions
    .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
    .reduce((acc, c) => acc + Number(c.value), 0);

  // 5. Filtro de busca (Membro pode vir como 'member' ou 'Member')
  const filteredContributions = contributions.filter(c => {
    const memberData = c.member || c.Member;
    return memberData?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Gestão Financeira</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Tesouraria TDU 7 Caveiras</p>
        </div>
        <button 
          onClick={handleGenerate}
          className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-red-900/20"
        >
          <Plus size={18} /> Gerar Mensalidades
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl">
          <TrendingUp className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform" size={140} />
          <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest block mb-2">Arrecadação Total</span>
          <p className="text-5xl font-black text-emerald-500">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] relative overflow-hidden group border-l-amber-500/30 shadow-2xl">
          <AlertCircle className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform" size={140} />
          <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest block mb-2">Saldo em Aberto</span>
          <p className="text-5xl font-black text-amber-500">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-black/20 flex items-center gap-4">
          <Search className="text-slate-600" size={20} />
          <input 
            type="text" 
            placeholder="BUSCAR IRMÃO DA CORRENTE..." 
            className="bg-transparent border-none outline-none text-white w-full font-black uppercase text-xs tracking-widest"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Membro</th>
                <th className="p-6">Referência</th>
                <th className="p-6">Valor</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <Loader2 className="animate-spin text-red-600 mx-auto" size={40} />
                  </td>
                </tr>
              ) : filteredContributions.map(c => {
                const memberData = c.member || c.Member;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-white uppercase text-sm">{memberData?.full_name || 'Irmão não identificado'}</div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase italic">{memberData?.category}</div>
                    </td>
                    <td className="p-6 text-slate-400 text-xs font-bold uppercase italic">{c.description}</td>
                    <td className="p-6 font-mono text-white font-black text-sm">
                      R$ {Number(c.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border shadow-inner ${
                          c.status === 'Pago' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                        }`}>
                          {c.status === 'Pago' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                          {c.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {c.status !== 'Pago' && (
                        <button 
                          onClick={() => handlePay(c.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                        >
                          Dar Baixa
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredContributions.length === 0 && !loading && (
            <div className="p-24 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-800/50 rounded-[24px] flex items-center justify-center text-slate-700 border border-slate-800">
                <Search size={40} />
              </div>
              <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">Nenhum registro financeiro encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}