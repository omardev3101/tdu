import { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Search, Filter, Plus } from 'lucide-react';
import api from '../services/api';

export default function FinancialDashboard() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadData = async () => {
    try {
      const response = await api.get('/contributions');
      setContributions(response.data);
    } catch (err) {
      alert('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayment = async (id) => {
    if (!confirm('Confirmar recebimento desta mensalidade?')) return;
    try {
      await api.put(`/contributions/${id}/pay`, { paymentMethod: 'Dinheiro' });
      loadData(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao processar pagamento');
    }
  };

  // Cálculos de Resumo
  const totalPaid = contributions.filter(c => c.status === 'Pago').reduce((acc, c) => acc + Number(c.value), 0);
  const totalPending = contributions.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + Number(c.value), 0);

  const filteredData = contributions.filter(c => 
    c.member?.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    c.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
      {/* Header & Resumo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Financeiro</h1>
          <p className="text-slate-500">Controle de mensalidades - Vencimento dia 20</p>
        </div>
        
        <button className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition active:scale-95">
          <Plus size={20} /> GERAR MENSALIDADES DO MÊS
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase">Total Recebido</span>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-black text-white">R$ {totalPaid.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase">Pendente (Mês Atual)</span>
            <AlertCircle className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-black text-white">R$ {totalPending.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl border-l-4 border-l-red-600">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase">Status Geral</span>
            <DollarSign className="text-red-500" size={20} />
          </div>
          <p className="text-xl font-bold text-white">Dia 20: Próximo Vencimento</p>
        </div>
      </div>

      {/* Filtro e Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por membro ou descrição..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-600 transition"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{item.member?.fullName}</div>
                    <div className="text-xs text-slate-500">{item.member?.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{item.description}</td>
                  <td className="px-6 py-4 text-sm">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">R$ {Number(item.value).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status !== 'Pago' && (
                      <button 
                        onClick={() => handlePayment(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
                      >
                        BAIXAR PAGAMENTO
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}