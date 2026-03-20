import {
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trash2,
  Download,
  ShieldCheck
} from 'lucide-react';

import { useEffect, useState } from 'react';
import api from '../services/api';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    members: 0,
    active: 0,
    monthlyIncome: 0,
    pendingMonth: 0,
    pendingTotal: 0
  });

  const [chartData, setChartData] = useState([]);
  const [debtRanking, setDebtRanking] = useState([]);
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
    const msg = `Axé ${m.name}, sua dívida total é R$ ${m.total.toFixed(2)}`;
    window.open(`https://wa.me/55${m.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- LOAD ---
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        const [membersRes, contributionsRes, agreementsRes, extraRecordsRes] = await Promise.all([
          api.get('/admin/members'),
          api.get('/contributions'),
          api.get('/agreements'),
          api.get('/admin/extra-records')
        ]);

        const members = membersRes.data || [];
        const contributions = contributionsRes.data || [];
        const agreements = agreementsRes.data || [];
        const extraRecords = extraRecordsRes.data || [];

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // --- RECEITA ---
        const contributionsIncome = contributions
          .filter(c => {
            if (c.status !== 'Pago') return false;
            const d = new Date(c.payment_date || c.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc, c) => acc + Number(c.value), 0);

        const extraIncome = extraRecords
          .filter(r => {
            const d = new Date(r.date || r.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc, r) => acc + Number(r.value || 0), 0);

        const totalIncome = contributionsIncome + extraIncome;

        // --- GRÁFICO ---
        setChartData([
          { name: 'Mensalidades', value: contributionsIncome },
          { name: 'Extras', value: extraIncome }
        ]);

        // --- DÍVIDAS ---
        let pendingTotal = 0;
        const membersDebt = {};

        const getMember = (name, phone) => {
          const key = name?.toUpperCase();
          if (!membersDebt[key]) {
            membersDebt[key] = {
              name,
              phone,
              total: 0,
              monthly: 0,
              retroactive: 0,
              agreementInstallments: 0,
              count: 0
            };
          }
          return membersDebt[key];
        };

        members.forEach(m => {
          const obj = getMember(m.full_name, m.phone_whatsapp);
          const retro = Number(m.balance_retroactive || 0);

          if (retro > 0) {
            obj.retroactive += retro;
            obj.total += retro;
            pendingTotal += retro;
          }
        });

        contributions.forEach(c => {
          if (c.status !== 'Pago') {
            const obj = getMember(c.Member?.full_name, c.Member?.phone_whatsapp);
            const val = Number(c.value);

            obj.monthly += val;
            obj.total += val;
            obj.count++;
            pendingTotal += val;
          }
        });

        agreements.forEach(a => {
          const obj = getMember(a.Member?.full_name, a.Member?.phone_whatsapp);
          const val = Number(a.value || 0);

          obj.agreementInstallments += val;
          obj.total += val;
          pendingTotal += val;
        });

        const ranking = Object.values(membersDebt)
          .filter(m => m.total > 0)
          .sort((a, b) => b.total - a.total);

        setDebtRanking(ranking);

        setStats({
          members: members.length,
          active: members.filter(m => m.status === 'Ativo').length,
          monthlyIncome: totalIncome,
          pendingTotal
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const totalPages = Math.ceil(debtRanking.length / itemsPerPage);
  const currentItems = debtRanking.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-10 text-white">Carregando...</div>;

  return (
    <div className="p-8 text-white space-y-8">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <button onClick={handleManualBackup}>Backup</button>
        <button onClick={handleResetFinanceiro} className="bg-red-600 px-4 py-2 rounded-lg text-white">
          Reset Financeiro  </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <div>Membros: {stats.members}</div>
        <div>Ativos: {stats.active}</div>
        <div>Receita: R$ {stats.monthlyIncome.toFixed(2)}</div>
        <div>Dívida: R$ {stats.pendingTotal.toFixed(2)}</div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-slate-900 p-6 rounded-xl">
        <h2 className="mb-4">Receita do Mês</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Dívida</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((m, i) => (
            <tr key={i}>
              <td>{m.name}</td>
              <td>R$ {m.total.toFixed(2)}</td>
              <td>
                <button onClick={() => handleNotify(m)}>
                  <MessageSquare size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINAÇÃO */}
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
          <ChevronLeft />
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
          <ChevronRight />
        </button>
      </div>

    </div>
  );
}
