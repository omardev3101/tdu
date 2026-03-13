import { useEffect, useState, useRef } from 'react';
import { 
  Handshake, FileText, CheckCircle, AlertCircle, 
  Search, Plus, Calendar, ArrowRight, X, User, 
  DollarSign, Hash, Check, Printer, Copy, Send
} from 'lucide-react';
import api from '../services/api';

export default function Agreements() {
  const [agreements, setAgreements] = useState([]);
  const [membersWithDebt, setMembersWithDebt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para o formulário de novo acordo
  const [selectedMember, setSelectedMember] = useState(null);
  const [installments, setInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreementsRes, membersRes] = await Promise.all([
        api.get('/agreements'),
        api.get('//admin/members')
      ]);
      setAgreements(agreementsRes.data);
      setMembersWithDebt(membersRes.data.filter(m => Number(m.balance_retroactive) > 0));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!selectedMember || installments < 1) return;
    try {
      await api.post('/agreements', {
        memberId: selectedMember.id,
        installmentsCount: Number(installments),
        firstDueDate
      });
      alert("Acordo firmado com sucesso!");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao gerar acordo.");
    }
  };

  const handleAcceptTerms = async (id) => {
    if (!window.confirm("Confirmar que o membro aceitou os termos da dívida?")) return;
    try {
      await api.put(`/agreements/${id}/accept`);
      loadData();
    } catch (err) {
      alert("Erro ao confirmar aceite.");
    }
  };

  const openTerm = (agreement) => {
    setSelectedAgreement(agreement);
    setIsTermModalOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Texto copiado para o WhatsApp!");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAgreements = agreements.filter(a => 
    a.member?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const termText = selectedAgreement ? `
*TERMO DE ACORDO E PARCELAMENTO*
  
Eu, *${selectedAgreement.member?.full_name}*, concordo com o parcelamento do meu débito retroativo no valor total de *R$ ${Number(selectedAgreement.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.

*Detalhes do Parcelamento:*
- Quantidade: ${selectedAgreement.installmentsCount} parcelas fixas
- Valor da Parcela: R$ ${(selectedAgreement.totalValue / selectedAgreement.installmentsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Status: ${selectedAgreement.status}
- Data do Acordo: ${new Date(selectedAgreement.createdAt).toLocaleDateString('pt-BR')}

Este acordo visa a regularização financeira perante a instituição.` : '';

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      
      {/* Estilo para Impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            Gestão de <span className="text-emerald-500">Acordos</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Handshake size={12} /> Regularização de Saldo Retroativo
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-2xl shadow-emerald-900/20"
        >
          <Plus size={20} /> Novo Parcelamento
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden no-print shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
            <FileText size={20} className="text-emerald-500" /> Histórico de Negociações
          </h3>
          <input 
            type="text" 
            placeholder="BUSCAR DEVEDOR..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 text-xs font-bold uppercase outline-none text-white w-full md:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50">
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase">Membro</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAgreements.map(agreement => (
                <tr key={agreement.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase">{agreement.member?.full_name}</span>
                      <span className="text-[9px] text-slate-500 font-bold italic">R$ {Number(agreement.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {agreement.installmentsCount}x</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      {!agreement.termsAccepted && (
                        <button 
                          onClick={() => handleAcceptTerms(agreement.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase"
                        >
                          <Check size={14} /> Ativar
                        </button>
                      )}
                      <button 
                        onClick={() => openTerm(agreement)}
                        className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DO TERMO (IMPRESSÃO E WHATSAPP) */}
      {isTermModalOpen && selectedAgreement && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h2 className="text-xl font-black text-white uppercase italic">Termo de Confissão de Dívida</h2>
              <button onClick={() => setIsTermModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-1">
              {/* Área que será impressa */}
              <div id="printable-area" className="bg-white text-slate-900 p-12 rounded-lg shadow-inner font-serif leading-relaxed">
                <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                  <h1 className="text-2xl font-bold uppercase tracking-tighter">Termo de Acordo Financeiro</h1>
                  <p className="text-[10px] font-bold">REGULARIZAÇÃO DE DÉBITOS RETROATIVOS</p>
                </div>

                <div className="space-y-6 text-sm">
                  <p>Eu, <strong>{selectedAgreement.member?.full_name}</strong>, inscrito sob as normas desta instituição, reconheço e confesso o débito no valor total de <strong>R$ {Number(selectedAgreement.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.</p>
                  
                  <p>Pelo presente instrumento, comprometo-me a realizar o pagamento do referido valor através de <strong>{selectedAgreement.installmentsCount} parcelas</strong> de <strong>R$ {(selectedAgreement.totalValue / selectedAgreement.installmentsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> cada.</p>

                  <div className="bg-slate-100 p-6 rounded-md my-8 border-l-4 border-slate-900">
                    <p className="font-bold mb-2">Plano de Pagamento:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Primeiro Vencimento: {new Date(selectedAgreement.createdAt).toLocaleDateString('pt-BR')}</li>
                      <li>Valor por parcela: R$ {(selectedAgreement.totalValue / selectedAgreement.installmentsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                      <li>Quantidade total: {selectedAgreement.installmentsCount}</li>
                    </ul>
                  </div>

                  <p>O não pagamento de qualquer parcela acarretará na nulidade deste acordo e retorno do saldo original ao cadastro devedor.</p>
                  
                  <div className="mt-20 flex flex-col items-center gap-2">
                    <div className="w-64 border-b border-slate-900"></div>
                    <p className="text-[10px] font-bold uppercase">{selectedAgreement.member?.full_name}</p>
                    <p className="text-[9px] text-slate-500">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-950/50 flex flex-wrap gap-4 justify-center">
               <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
              >
                <Printer size={16} /> Imprimir Termo (PDF)
              </button>
              <button 
                onClick={() => copyToClipboard(termText)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-500 transition-all"
              >
                <Send size={16} /> Enviar para WhatsApp
              </button>
              <button 
                onClick={() => copyToClipboard(termText)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-700 transition-all"
              >
                <Copy size={16} /> Copiar Texto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO ACORDO (Mantido) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 no-print">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="p-10 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nova Negociação</h2>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">Configure o plano de pagamento</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> 1. Membro Devedor
                </label>
                <select 
                  onChange={(e) => setSelectedMember(membersWithDebt.find(m => m.id === Number(e.target.value)))}
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 text-white font-bold outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {membersWithDebt.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} (R$ {m.balance_retroactive})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={12} /> 2. Parcelamento
                </label>
                <input 
                    type="number" min="1" max="24" value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 text-white font-black outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> 3. Data do 1º Boleto
                </label>
                <input 
                  type="date" value={firstDueDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>

              {selectedMember && (
                <div className="bg-emerald-500/5 border-2 border-emerald-500/10 p-8 rounded-[40px] flex flex-col justify-center animate-in fade-in zoom-in">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2 opacity-60">Valor da Parcela</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white italic">
                      R$ {(selectedMember.balance_retroactive / (installments || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 pt-0">
              <button 
                onClick={handleCreate}
                disabled={!selectedMember}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[30px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4"
              >
                Gerar Acordo Oficial <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}