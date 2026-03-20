import { Users, AlertCircle, ChevronLeft, ChevronRight, MessageSquare, Trash2, Download, ShieldCheck, ArrowUpCircle, Heart, Hammer, BadgeDollarSign } from 'lucide-react';
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
  const [recentEntries, setRecentEntries] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- AÇÕES ---
  const handleResetFinanceiro = async () => {
    if (window.confirm("⚠️ Deseja deletar TODAS as mensalidades?")) {
      try {
        await api.delete('/contributions/reset');
        window.location.reload();
      } catch (err) {
        alert("Erro ao limpar dados.");
      }
    }
  };

  const handleManualBackup = async () => {
    try {
      const response = await api.get('/system/backup-download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${Date.now()}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erro no backup");
    }
  };

  const handleNotify = (m) => {
    const msg = `Axé ${m.name}, sua dívida total é R$ ${m.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    window.open(`https://wa.me/55${m.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- CARREGAMENTO E PROCESSAMENTO DE DADOS ---
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        
        // Chamadas individuais com tratamento de erro por rota
        const fetchMembers = api.get('/admin/members').catch(() => ({ data: [] }));
        const fetchContributions = api.get('/contributions').catch(() => ({ data: [] }));
        const fetchAgreements = api.get('/agreements').catch(() => ({ data: [] }));
        const fetchExtraRecords = api.get('/extra-records').catch(() => ({ data: [] }));

        const [membersRes, contributionsRes, agreementsRes, extraRecordsRes] = await Promise.all([
          fetchMembers, fetchContributions, fetchAgreements, fetchExtraRecords
        ]);

        const members = membersRes.data || [];
        const contributions = contributionsRes.data || [];
        const agreements = agreementsRes.data || [];
        const extraRecords = extraRecordsRes.data || [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let pendingTotalVal = 0;
        const membersDebt = {};
        const entries = []; 

        const getOrCreateMember = (name, phone) => {
          const key = name?.trim().toUpperCase();
          if (!key) return null;
          if (!membersDebt[key]) {
            membersDebt[key] = { 
              name, phone, total: 0, monthly: 0, retroactive: 0, 
              agreementInstallments: 0, count: 0, nextInstallment: "" 
            };
          }
          return membersDebt[key];
        };

        // 1. Processar Retroativos dos Membros
        members.forEach(m => {
          const retroValue = Number(m.balance_retroactive || 0);
          const obj = getOrCreateMember(m.full_name, m.phone_whatsapp);
          if (obj && retroValue > 0) {
            obj.retroactive = retroValue;
            obj.total += retroValue;
            pendingTotalVal += retroValue;
          }
        });

        // 2. Processar Contribuições (Dívidas e Receita Mensal)
        let monthlyContributionsIncome = 0;
        contributions.forEach(c => {
          const val = Number(c.value) || 0;
          const memberData = c.Member || c.member;
          const obj = getOrCreateMember(memberData?.full_name, memberData?.phone_whatsapp);

          if (c.status === 'Pago') {
            const payDate = new Date(c.payment_date || c.updated_at);
            if (payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear) {
              monthlyContributionsIncome += val;
              
              entries.push({
                id: `cont-${c.id}`,
                origin: memberData?.full_name || 'Membro',
                description: c.description || 'Mensalidade',
                value: val,
                date: payDate,
                type: c.description?.toUpperCase().includes('ACORDO') ? 'Acordo' : 'Mensalidade'
              });
            }
          } else {
            if (obj) {
              const isAcordo = c.description?.toUpperCase().includes('ACORDO');
              if (isAcordo) {
                obj.agreementInstallments += val;
                const parcelaMatch = c.description.match(/(\d+\/\d+)/);
                if (parcelaMatch && (!obj.nextInstallment || parcelaMatch[0] < obj.nextInstallment)) {
                  obj.nextInstallment = parcelaMatch[0];
                }
              } else {
                obj.monthly += val;
                obj.count += 1;
              }
              obj.total += val;
              pendingTotalVal += val;
            }
          }
        });

        // 3. Processar Doações e Trabalhos Extras (Receita)
        let extraIncome = 0;
        extraRecords.forEach(r => {
          const val = Number(r.value) || 0;
          const rDate = new Date(r.date);
          
          if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
            extraIncome += val;
            
            entries.push({
              id: `extra-${r.id}`,
              origin: r.external_donor || (r.participants && r.participants[0]?.full_name) || 'Doador Externo',
              description: r.description,
              value: val,
              date: rDate,
              type: r.type 
            });
          }
        });

        // 4. Processar Acordos Pendentes (Dívidas)
        agreements.forEach(a => {
          if (a.status !== 'Finalizado' && a.status !== 'Pago') {
            const val = Number(a.remaining_value || 0);
            const memberData = a.Member || a.member;
            const obj = getOrCreateMember(memberData?.full_name, memberData?.phone_whatsapp);
            if (obj && val > 0) {
              obj.agreementInstallments += val;
              obj.total += val;
              pendingTotalVal += val;
            }
          }
        });

        setRecentEntries(entries.sort((a, b) => b.date - a.date));

        setStats({ 
          members: members.length, 
          active: members.filter(m => m.status === 'Ativo').length, 
          monthlyIncome: monthlyContributionsIncome + extraIncome,
          pendingMonth: contributions.filter(c => c.status !== 'Pago').reduce((acc, c) => acc + Number(c.value), 0), 
          pendingTotal: pendingTotalVal 
        });
        
        const ranking = Object.values(membersDebt)
          .filter(m => m.total > 0)
          .sort((a, b) => b.total - a.total);

        setDebtRanking(ranking);

      } catch (err) {
        console.error("Erro crítico no dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalPages = Math.ceil(debtRanking.length / itemsPerPage);
  const currentItems = debtRanking.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <ShieldCheck className="animate-spin text-red-600" size={50} />
        <div className="text-white font-black uppercase tracking-[0.3em] text-xs">Sincronizando Fichas Financeiras...</div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Gestão Operacional</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Painel de Controle TDU</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetFinanceiro} 
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-[10px] font-black text-red-500 uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95 group"
          >
            <Trash2 size={14} className="group-hover:animate-bounce" /> Reset Mensalidades
          </button>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest font-mono shadow-xl italic">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Cards de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <span className="text-slate-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Membros Ativos</span>
          <div className="text-4xl font-black text-white">{stats.active}</div>
          <Users className="absolute -right-2 -bottom-2 text-slate-800/20" size={70} />
        </div>
        
        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl border-l-emerald-600/50">
          <span className="text-emerald-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Receita (Mês)</span>
          <div className="text-4xl font-black text-white">R$ {stats.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-2xl border-l-red-600/50">
          <span className="text-red-500 font-black text-[10px] uppercase block mb-1 tracking-widest">Dívida Total</span>
          <div className="text-4xl font-black text-white">R$ {stats.pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] border border-blue-900 shadow-2xl flex justify-between items-center border-l-blue-600">
          <div>
            <span className="text-blue-500 font-black text-[10px] uppercase block mb-1 flex items-center gap-2 tracking-widest">
              <ShieldCheck size={12} /> Backup
            </span>
            <div className="text-xl font-black text-white italic uppercase tracking-tighter">Segurança</div>
          </div>
          <button onClick={handleManualBackup} className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* TABELA: FLUXO DE ENTRADAS DO MÊS */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-emerald-600/5 flex justify-between items-center">
            <h3 className="text-white font-black uppercase text-sm flex items-center gap-2 tracking-widest italic">
              <ArrowUpCircle size={18} className="text-emerald-500" /> Fluxo de Entradas (Mês Atual)
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black uppercase">
              Total Acumulado: R$ {stats.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-black/40 sticky top-0 z-10">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Data</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Origem / Membro</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Tipo</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Descrição</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentEntries.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-600 font-black uppercase text-xs tracking-widest">Nenhuma entrada registrada este mês</td></tr>
              ) : recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-6 text-xs font-mono text-slate-500">
                    {entry.date.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-6">
                    <span className="font-black text-white uppercase text-[11px] tracking-tighter">{entry.origin}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {entry.type === 'Doação' && <Heart size={12} className="text-red-500" />}
                      {entry.type === 'Trabalho Extra' && <Hammer size={12} className="text-amber-500" />}
                      {entry.type === 'Mensalidade' && <BadgeDollarSign size={12} className="text-emerald-500" />}
                      {entry.type === 'Acordo' && <ShieldCheck size={12} className="text-blue-500" />}
                      <span className="text-[10px] font-black uppercase text-slate-400">{entry.type}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-400 italic font-medium">
                    {entry.description}
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-sm font-black text-emerald-500 font-mono">
                      + R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Ranking (Cobrança) */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
          <h3 className="text-white font-black uppercase text-sm flex items-center gap-2 tracking-widest italic">
            <AlertCircle size={18} className="text-red-600" /> Cobrança Prioritária (Inadimplência)
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-20" disabled={currentPage === 1}><ChevronLeft size={16}/></button>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-20" disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={16}/></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Membro</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Mensalidades</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Acordo</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Próx. Parcela</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Retroativo</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-right">Dívida Total</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentItems.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase text-slate-200 group-hover:text-red-500 transition-colors">{item.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter italic">Posição: {((currentPage - 1) * itemsPerPage) + i + 1}º</span>
                    </div>
                  </td>
                  
                  <td className="p-6 text-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-500">R$ {item.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase">{item.count} meses</span>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <span className="text-xs font-bold text-emerald-500">
                      {item.agreementInstallments > 0 ? `R$ ${item.agreementInstallments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </span>
                  </td>

                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {item.nextInstallment ? (
                        <>
                          <span className="text-xs font-black text-slate-300">{item.nextInstallment}</span>
                          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Pendente</span>
                        </>
                      ) : <span className="text-slate-700">—</span>}
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <span className="text-xs font-bold text-slate-500">
                      {item.retroactive > 0 ? `R$ ${item.retroactive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
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
        </div>
      </div>
    </div>
  );
}