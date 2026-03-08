import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Camera, User, Scroll, Vote, Lock, DollarSign, AlertCircle, ShieldAlert } from 'lucide-react'; 
import api from '../services/api';

export default function MemberModal({ isOpen, onClose, onSave, memberData }) {
  const [activeTab, setActiveTab] = useState('pessoal');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Incluindo o 'watch' para monitorar o status de eleitor em tempo real
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // Monitora o checkbox de "Não Eleitor" para desabilitar campos
  const isNotVoter = watch("is_not_voter");

  useEffect(() => {
    if (memberData) {
      // Mapeia os dados vindo do banco (snake_case) para o formulário
      reset(memberData);
      setPreview(memberData.photo_url ? `http://localhost:3000/uploads/${memberData.photo_url}` : null);
    } else {
      reset({ 
        full_name: '',
        category: 'Corrente', 
        status: 'Ativo', 
        is_voter: 0,
        is_not_voter: false,
        email: '',
        role: 'member',
        custom_contribution: 100.00,
        balance_retroactive: 0.00,
      });
      setPreview(null);
    }
    setActiveTab('pessoal');
  }, [memberData, reset, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      const imageFile = fileInputRef.current?.files[0];
      if (imageFile) formData.append('photo', imageFile);

      Object.keys(data).forEach(key => {
        if (key === 'photo' || key === 'photo_url') return;
        let value = data[key];
        
        // Tratamento de tipos para o MySQL
        if (value === null || value === undefined) value = '';
        if (typeof value === 'boolean') value = value ? 1 : 0;

        formData.append(key, value);
      });

      if (memberData) {
        await api.put(`/members/${memberData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/members', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      alert('Erro ao processar: ' + errorMessage);
    }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
        activeTab === id ? 'border-red-600 text-red-500 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-slate-800/20 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-red-600 transition">
                {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="text-slate-600" />}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
                {memberData ? 'Atualizar Registro' : 'Ficha de Alistamento'}
              </h2>
              <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">TDU - 7 Caveiras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 px-4 overflow-x-auto no-scrollbar bg-black/20">
          <TabButton id="pessoal" icon={User} label="Pessoal" />
          <TabButton id="religioso" icon={Scroll} label="Religioso" />
          <TabButton id="financeiro" icon={DollarSign} label="Financeiro" />
          <TabButton id="eleitoral" icon={Vote} label="Político" />
          <TabButton id="acesso" icon={Lock} label="Acesso" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-900/50">
          
          {/* ABA PESSOAL */}
          {activeTab === 'pessoal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                <input {...register("full_name", { required: true })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white focus:border-red-600 transition" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPF</label>
                <input {...register("document_cpf")} placeholder="000.000.000-00" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RG</label>
                <input {...register("document_rg")} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</label>
                <input {...register("phone_whatsapp")} placeholder="(11) 99999-9999" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Nascimento</label>
                <input type="date" {...register("birth_date")} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-slate-300" />
              </div>
            </div>
          )}

          {/* ABA FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl text-slate-900 shadow-lg shadow-emerald-500/20">
                  <DollarSign size={24} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Contribuição Mensal (R$)</label>
                  <input type="number" step="0.01" {...register("custom_contribution")} className="w-full bg-transparent border-none p-0 outline-none text-2xl font-mono text-white" />
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/20">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Saldo Retrotativo / Dívida (R$)</label>
                  <input type="number" step="0.01" {...register("balance_retroactive")} className="w-full bg-transparent border-none p-0 outline-none text-2xl font-mono text-white" />
                </div>
              </div>
              <p className="text-[9px] text-slate-500 uppercase font-bold text-center tracking-tighter italic">Valores históricos para negociação de débitos antigos</p>
            </div>
          )}

          {/* ABA RELIGIOSO */}
          {activeTab === 'religioso' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hierarquia / Categoria</label>
                <select {...register("category")} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white font-bold">
                  <option value="Corrente">Corrente</option>
                  <option value="Ogã">Ogã</option>
                  <option value="Cambone">Cambone</option>
                  <option value="Pai de Pequeno">Pai de Pequeno</option>
                  <option value="Assistência">Assistência</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Batismo</label>
                <input type="date" {...register("baptism_date")} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Padrinho/Madrinha</label>
                <input {...register("godparent")} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
              </div>
            </div>
          )}

          {/* ABA POLÍTICO / ELEITORAL */}
          {activeTab === 'eleitoral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              {/* Checkbox de Exceção (Menores/Não Eleitores) */}
              <div className="md:col-span-2 bg-red-950/20 border border-red-900/30 p-4 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-red-950/30 transition">
                <input type="checkbox" {...register("is_not_voter")} id="is_not_voter" className="w-6 h-6 accent-red-600 rounded" />
                <label htmlFor="is_not_voter" className="flex-1 cursor-pointer">
                  <span className="text-xs font-black text-white uppercase block italic tracking-tighter">Não sou eleitor (Menor de 16 ou Outros)</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inativa os campos de título e zona</span>
                </label>
              </div>

              <div className={`space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 ${isNotVoter ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                <div className="md:col-span-2">
                   <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    <input type="checkbox" {...register("is_voter")} className="w-4 h-4 accent-blue-600" /> Confirmar como Eleitor Ativo
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título de Eleitor</label>
                  <input {...register("voter_card")} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white focus:border-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zona</label>
                    <input {...register("voter_zone")} placeholder="000" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white text-center focus:border-blue-600" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seção</label>
                    <input {...register("voter_section")} placeholder="000" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white text-center focus:border-blue-600" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notas Políticas / Apoio / Demandas</label>
                <textarea {...register("political_note")} rows="2" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white focus:border-blue-600 resize-none" placeholder="Relatar demandas de transporte ou liderança comunitária..." />
              </div>
            </div>
          )}

          {/* ABA ACESSO */}
          {activeTab === 'acesso' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="text-amber-500" size={24} />
                  <div>
                    <h3 className="font-black text-white uppercase text-sm italic tracking-tighter">Credenciais do Sistema</h3>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Defina o nível de poder do usuário</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível de Acesso (Role)</label>
                    <select {...register("role")} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white font-black uppercase text-xs">
                      <option value="member">Membro (Visualização)</option>
                      <option value="moderator">Moderador (Secretaria)</option>
                      <option value="admin">Administrador (Diretoria)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail Institucional</label>
                    <input type="email" {...register("email")} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" />
                  </div>
                  {!memberData && (
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha Provisória</label>
                      <input type="password" {...register("password")} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white" placeholder="••••••••" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-black/40 flex justify-between items-center">
           <p className="hidden md:block text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">
            Auditado por: {memberData ? 'Diretoria de Tecnologia' : 'Sistema TDU-7C'}
           </p>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" onClick={onClose} className="flex-1 md:flex-none px-6 py-3 text-slate-500 font-black uppercase text-xs hover:text-white transition tracking-widest">CANCELAR</button>
            <button onClick={handleSubmit(onSubmit)} className="flex-1 md:flex-none bg-red-700 hover:bg-red-600 text-white px-10 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition shadow-xl shadow-red-900/20 active:scale-95">
              {memberData ? 'ATUALIZAR' : 'EFETIVAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}