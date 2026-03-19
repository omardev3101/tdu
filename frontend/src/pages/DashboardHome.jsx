import { Users, AlertCircle, ChevronLeft, ChevronRight, MessageSquare, Trash2, Database, Download, ShieldCheck, Handshake } from 'lucide-react';
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

  // --- FUNÇÕES DE AÇÃO ---

  const handleResetFinanceiro = async () => {
    if (window.confirm("⚠️ ATENÇÃO: Deseja deletar TODAS as mensalidades? Esta ação é irreversível!")) {
      try {
        await api.delete('/contributions/reset');
        window.location.reload();
      } catch (err) { 
        console.error(err);
        alert("Erro ao limpar dados financeiros."); 
      }
    }
  };

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
    } catch (err) { alert("Erro ao processar backup."); }
  };

  const handleNotify = (m) => {
    const msg = `Axé ${m.name}, o TDU informa resumo de débitos:\n\n` +
                `📅 Mensalidades: R$ ${m.monthly.toLocaleString('pt-BR')}\n` +
                `🤝 Parcelas Acordo: R$ ${m.agreementInstallments.toLocaleString('pt-BR')}\n` +
                `⚠️ Retroativo: R$ ${m.retroactive.toLocaleString('pt-BR')}\n` +
                `*Total Geral: R$ ${m.total.toLocaleString('pt-BR')}*\n\n` +
                `Por favor, procure a tesouraria para regularizar.`;
    
    window.open(`https://wa.me/55${m.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- CARREGAMENTO DE DADOS ---

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        // CORREÇÃO: Alinhando rotas com o Backend (/admin/)
        const [membersRes, contributionsRes, agreementsRes] = await Promise.all([
          api.get('/admin/members'),
          api.get('/contributions'), // Esta rota no seu routes.js já exige auth
          api.get('/agreements')     // Esta rota no seu routes.js já exige auth
        ]);

// ... dentro do loadStats, após receber as respostas da API:
// --- DENTRO DO LOADSTATS ---

const contributions = contributionsRes.data || [];
const members = membersRes.data || [];
const agreements = agreementsRes.data || [];

let pendingTotalVal = 0;
const membersDebt = {};

// 1. PRIMEIRO: Criamos a base com todos os membros e seus Retroativos da Ficha
members.forEach(m => {
  const key = m.full_name?.trim().toUpperCase();
  if (!key) return;

  const retroValue = Number(m.balance_retroactive) || 0;
  
  // Criamos o objeto inicial do membro já com o retroativo
  membersDebt[key] = { 
    name: m.full_name,
    phone: m.phone_whatsapp,
    total: retroValue, 
    monthly: 0, 
    retroactive: retroValue, // Aqui garante que o valor da ficha apareça
    agreementInstallments: 0, 
    count: 0
  };

  pendingTotalVal += retroValue;
});

// 2. SEGUNDO: Somamos as Contribuições (Mensalidades e Parcelas de Acordo)
// 1. Processamento das Contribuições (Mensalidades + Parcelas de Acordo)
contributions.forEach(c => {
  const memberData = c.Member || c.member;
  const name = memberData?.full_name || 'Não Identificado';
  const m = getMemberObj(name, memberData?.phone_whatsapp);

  // Identifica se é Acordo pelo texto
  const isAcordo = c.description?.toUpperCase().includes('ACORDO');

  if (isAcordo) {
    // Tenta extrair o "1/5" da descrição usando Regex
    // Procure por algo como "1/5", "2/10", etc.
    const parcelaMatch = c.description.match(/(\d+\/\d+)/);
    const parcelaTexto = parcelaMatch ? parcelaMatch[0] : "";

    if (c.status === 'Pendente' || c.status === 'Atrasado') {
      const val = Number(c.value) || 0;
      m.agreementInstallments += val;
      m.total += val;
      pendingTotalVal += val;
      
      // Armazena qual a próxima parcela pendente (a menor encontrada)
      if (!m.nextInstallment || parcelaTexto < m.nextInstallment) {
        m.nextInstallment = parcelaTexto;
      }
    }
    
    // Armazena o total de parcelas (o maior número depois da barra)
    if (parcelaTexto) {
      const totalParcelas = parcelaTexto.split('/')[1];
      m.totalInstallments = totalParcelas;
    }
  } else {
    // Lógica normal para mensalidade
    if (c.status === 'Pendente' || c.status === 'Atrasado') {
      const val = Number(c.value) || 0;
      m.monthly += val;
      m.count += 1;
      m.total += val;
      pendingTotalVal += val;
    }
  }
});

// 3. TERCEIRO: Somamos Acordos Extras (se existirem na rota /agreements)
agreements.forEach(a => {
  const val = Number(a.remaining_value || a.value || 0); 
  const memberData = a.Member || a.member;
  const key = memberData?.full_name?.trim().toUpperCase();

  if (key && membersDebt[key] && val > 0 && a.status !== 'Pago') {
    membersDebt[key].agreementInstallments += val;
    membersDebt[key].total += val;
    pendingTotalVal += val;
  }
});

// --- CÁLCULOS FINAIS DOS CARDS ---
const income = contributions
  .filter(c => c.status === 'Pago')
  .reduce((acc, c) => acc + Number(c.value), 0);

setStats({ 
  members: members.length, 
  active: members.filter(m => m.status === 'Ativo').length, 
  monthlyIncome: income, 
  pendingMonth: contributions.filter(c => c.status !== 'Pago').reduce((acc, c) => acc + Number(c.value), 0), 
  pendingTotal: pendingTotalVal 
});

// Filtramos apenas quem tem dívida > 0 para o Ranking
const ranking = Object.values(membersDebt)
  .filter(m => m.total > 0)
  .sort((a, b) => b.total - a.total);

setDebtRanking(ranking);

      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
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
        <div className="text-white font-black uppercase tracking-[0.3em] text-xs">Sincronizando Fichas...</div>
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
            <Trash2 size={14} className="group-hover:animate-bounce" /> Reset Financeiro
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

      {/* Tabela de Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
          <h3 className="text-white font-black uppercase text-sm flex items-center gap-2 tracking-widest italic">
            <AlertCircle size={18} className="text-red-600" /> Cobrança Prioritária
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
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center"> Acordo</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-center">Nº de Parcelas</th>
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
      
      {/* Mensalidades */}
      <td className="p-6 text-center">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-500">R$ {item.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="text-[8px] font-black text-slate-600 uppercase">{item.count} meses</span>
        </div>
      </td>

      {/* Valor do Acordo */}
      <td className="p-6 text-center">
        <span className="text-xs font-bold text-emerald-500">
          {item.agreementInstallments > 0 ? `R$ ${item.agreementInstallments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
        </span>
      </td>

      {/* Nº DE PARCELAS (Dinamismo 1/5, 2/5...) */}
      <td className="p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          {item.nextInstallment ? (
            <>
              <span className="text-xs font-black text-slate-300">
                {item.nextInstallment}
              </span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                Pendente
              </span>
            </>
          ) : (
            <span className="text-slate-700">—</span>
          )}
        </div>
      </td>

      {/* Retroativo */}
      <td className="p-6 text-center">
        <span className="text-xs font-bold text-slate-500">
          {item.retroactive > 0 ? `R$ ${item.retroactive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
        </span>
      </td>

      {/* Dívida Total */}
      <td className="p-6 text-right">
        <span className="text-sm font-black text-red-500 font-mono italic">
          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </td>

      {/* Ações */}
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