import { Users, DollarSign, AlertCircle, ChevronLeft, ChevronRight, MessageSquare, Trash2, Database, Download, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardHome() {
  const [stats, setStats] = useState({ 
    members: 0, 
    active: 0, 
    monthlyIncome: 0,
    pendingMonth: 0,
    pendingTotal: 0 
  });
  const [debtRanking, setDebtRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadStats() {
      try {
        const [membersRes, financeRes] = await Promise.all([
          api.get('/members'),
          api.get('/contributions')
        ]);

        const today = new Date();
        const currentMonth = today.getUTCMonth();
        const currentYear = today.getUTCFullYear();
        const firstDayOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 1));

        let income = 0;
        let pendingMonthVal = 0;
        let pendingTotalVal = 0;
        const membersDebt = {};

        // 1. Processar Saldo Retroativo (Dívida de Ficha vinda da tabela Members)
        membersRes.data.forEach(m => {
          const retroValue = Number(m.balance_retroactive) || 0;
          if (retroValue > 0) {
            pendingTotalVal += retroValue;
            const name = m.full_name || 'Não Identificado';
            
            if (!membersDebt[name]) {
              membersDebt[name] = { 
                name, 
                total: 0, 
                count: 0, 
                phone: m.phone_whatsapp 
              };
            }
            membersDebt[name].total += retroValue;
            // count inicial é 0 para identificar que é Saldo Anterior
          }
        });

        // 2. Processar Contribuições (Mensalidades geradas no sistema)
        financeRes.data.forEach(c => {
          const dueDate = new Date(c.due_date);
          const utcDueDate = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));
          
          const isCurrentMonth = utcDueDate.getUTCMonth() === currentMonth && utcDueDate.getUTCFullYear() === currentYear;
          const isPastMonth = utcDueDate < firstDayOfCurrentMonth;
          const val = Number(c.value) || 0;

          if (c.status === 'Pago') {
            if (isCurrentMonth) income += val;
          } else if (c.status === 'Pendente' || c.status === 'Atrasado') {
            if (isCurrentMonth) {
              pendingMonthVal += val;
            } else if (isPastMonth) {
              pendingTotalVal += val;
            }

            const memberName = c.member?.full_name || 'Não Identificado';
            if (!membersDebt[memberName]) {
              membersDebt[memberName] = { 
                name: memberName, 
                total: 0, 
                count: 0, 
                phone: c.member?.phone_whatsapp 
              };
            }
            membersDebt[memberName].total += val;
            membersDebt[memberName].count += 1; // Soma quantidade de mensalidades
          }
        });

        setStats({ 
          members: membersRes.data.length, 
          active: membersRes.data.filter(m => m.status === 'Ativo').length, 
          monthlyIncome: income,
          pendingMonth: pendingMonthVal,
          pendingTotal: pendingTotalVal 
        });
        
        // Ordena por maior dívida total
        setDebtRanking(Object.values(membersDebt).sort((a, b) => b.total - a.total));
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleManualBackup = async () => {
    try {
      const response = await api.get('/system/backup-download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tdu_backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erro ao processar backup.");
    }
  };

  const handleResetFinanceiro = async () => {
    if (window.confirm("⚠️ Deletar TODAS as mensalidades para teste?")) {
      try {
        await api.delete('/contributions/reset');
        window.location.reload();
      } catch (err) { alert("Erro ao limpar."); }
    }
  };

  const handleNotify = (m) => {
    const msg = `Olá ${m.name}, o TDU - 7 Caveiras informa débitos de R$ ${m.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em sua ficha. Por favor, regularize com a tesouraria.`;
    window.open(`https://wa.me/55${m.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalPages = Math.ceil(debtRanking.length / itemsPerPage);
  const currentItems = debtRanking.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-8 text-white font-black animate-pulse uppercase tracking-[0.3em]">Sincronizando Fichas...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Gestão Operacional</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">TDU - 7 Caveiras</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleResetFinanceiro} className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-[10px] font-black text-red-500 uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
            <Trash2 size={14} /> Reset Financeiro
          </button>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest font-mono shadow-xl italic">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Grid de Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <span className="text-slate-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Membros Ativos</span>
          <div className="text-4xl font-black text-white">{stats.active}</div>
          <Users className="absolute -right-2 -bottom-2 text-slate-800/20 transition-transform group-hover:scale-110" size={70} />
        </div>
        
        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl border-l-emerald-600/50">
          <span className="text-emerald-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Receita Mensal</span>
          <div className="text-4xl font-black text-white">R$ {stats.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl border-l-amber-500/50">
          <span className="text-amber-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Aberto no Mês</span>
          <div className="text-4xl font-black text-white">R$ {stats.pendingMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] border border-blue-900 shadow-2xl flex justify-between items-center group border-l-blue-600">
          <div>
            <span className="text-blue-500 font-black text-[10px] uppercase block mb-1 flex items-center gap-2 tracking-widest">
              <ShieldCheck size={12} /> Segurança
            </span>
            <div className="text-xl font-black text-white italic uppercase tracking-tighter">Dados Protegidos</div>
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Backup Diário Ativo</p>
          </div>
          <button onClick={handleManualBackup} className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Dívida Total Destacada */}
      <div className="bg-slate-900 p-6 rounded-[32px] border border-red-900 shadow-2xl border-l-red-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-red-500 font-black text-[10px] uppercase block mb-1 tracking-[0.2em]">Dívida Acumulada Total</span>
          <div className="text-5xl font-black text-red-500 font-mono tracking-tighter animate-pulse">
            R$ {stats.pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right hidden md:block">
           <Database size={40} className="text-red-900/30" />
        </div>
      </div>

      {/* Ranking de Pendências */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
          <h3 className="text-white font-black uppercase text-sm flex items-center gap-2 tracking-widest italic">
            <AlertCircle size={18} className="text-red-600" /> Cobrança Prioritária
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-20 hover:bg-slate-700 transition-colors" disabled={currentPage === 1}><ChevronLeft size={16}/></button>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-20 hover:bg-slate-700 transition-colors" disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={16}/></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Membro</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center tracking-widest">Origem / Parcelas</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-right tracking-widest">Débito Total</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentItems.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold tracking-tighter italic uppercase">Ranking: {((currentPage - 1) * itemsPerPage) + i + 1}º</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border shadow-inner uppercase ${item.count > 0 ? 'bg-amber-600/10 text-amber-500 border-amber-600/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                      {item.count > 0 ? `${item.count} ${item.count === 1 ? 'Parcela' : 'Parcelas'}` : 'Saldo Anterior'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-sm font-black text-red-500 font-mono italic">
                      R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => handleNotify(item)} className="p-3 bg-emerald-600/10 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-90">
                      <MessageSquare size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {debtRanking.length === 0 && (
            <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.4em] text-xs">
              Corrente em dia
            </div>
          )}
        </div>
      </div>
    </div>
  );
}