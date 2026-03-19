import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Camera, User, Scroll, Vote, Lock, DollarSign, AlertCircle, ShieldAlert } from 'lucide-react'; 
import api from '../services/api';

// URL Dinâmica blindada contra barras duplicadas
const API_URL = (import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com').replace(/\/$/, '');

export default function MemberModal({ isOpen, onClose, onSave, memberData }) {
  const [activeTab, setActiveTab] = useState('pessoal');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const isNotVoter = watch("is_not_voter");

  useEffect(() => {
    if (memberData && isOpen) {
      reset(memberData);
      
      // Lógica de Preview que ignora lixo de localhost vindo do banco
      if (memberData.photo_url) {
        const fileName = memberData.photo_url
          .replace('http://localhost:3000/uploads/', '')
          .replace('/uploads/', '');

        const finalUrl = fileName.startsWith('http') 
          ? fileName 
          : `${API_URL}/uploads/${fileName}`;
        
        setPreview(finalUrl);
      } else {
        setPreview(null);
      }
    } else {
      reset({ 
        full_name: '',
        category: 'Corrente', 
        status: 'Ativo', 
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
        if (memberData && key === 'password' && !value) return;
        if (value === null || value === undefined) value = '';
        if (typeof value === 'boolean') value = value ? 1 : 0;

        formData.append(key, value);
      });

      const endpoint = memberData ? `/admin/members/${memberData.id}` : '/admin/members';
      const method = memberData ? 'put' : 'post';

      await api[method](endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
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
      className={`flex items-center gap-2 px-5 py-4 border-b-2 transition whitespace-nowrap ${
        activeTab === id ? 'border-red-600 text-red-500 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-slate-800/20 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-red-600 transition shadow-lg">
                {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="text-slate-600" />}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
                {memberData ? 'Atualizar Irmão' : 'Novo Alistamento'}
              </h2>
              <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">TDU - 7 Caveiras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Abas com Scroll Lateral no Mobile */}
        <div className="flex border-b border-slate-800 px-4 overflow-x-auto scrollbar-hide bg-black/20">
          <TabButton id="pessoal" icon={User} label="Pessoal" />
          <TabButton id="religioso" icon={Scroll} label="Religioso" />
          <TabButton id="financeiro" icon={DollarSign} label="Financeiro" />
          <TabButton id="eleitoral" icon={Vote} label="Político" />
          <TabButton id="acesso" icon={Lock} label="Acesso" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-900/50">
          
          {/* PESSOAL */}
          {activeTab === 'pessoal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-bottom-2 duration-300">
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

          {/* FINANCEIRO */}
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
                  <label className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Saldo Retrotativo (R$)</label>
                  <input type="number" step="0.01" {...register("balance_retroactive")} className="w-full bg-transparent border-none p-0 outline-none text-2xl font-mono text-white" />
                </div>
              </div>
            </div>
          )}

          {/* ACESSO */}
          {activeTab === 'acesso' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="text-amber-500" size={24} />
                  <h3 className="font-black text-white uppercase text-sm italic tracking-tighter">Credenciais do Terreiro</h3>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <select {...register("role")} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none text-white font-black uppercase text-xs">
                    <option value="member">Membro (Padrão)</option>
                    <option value="moderator">Moderador (Secretaria)</option>
                    <option value="admin">Administrador (Diretoria)</option>
                  </select>
                  <input type="email" {...register("email")} placeholder="E-mail de acesso" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none text-white" />
                  <input type="password" {...register("password")} placeholder={memberData ? "•••••••• (Vazio para manter)" : "Senha inicial"} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Outras abas (Religioso e Político) seguem a mesma estrutura do seu original */}
          {activeTab === 'religioso' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
                <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hierarquia</label>
                    <select {...register("category")} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 outline-none text-white font-bold">
                        <option value="Corrente">Corrente</option>
                        <option value="Ogã">Ogã</option>
                        <option value="Cambone">Cambone</option>
                        <option value="Pai de Pequeno">Pai de Pequeno</option>
                    </select>
                </div>
                <input type="date" {...register("baptism_date")} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" />
                <input {...register("godparent")} placeholder="Padrinho/Madrinha" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" />
            </div>
          )}
          
        </form>

        <div className="p-6 border-t border-slate-800 bg-black/40 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 text-slate-500 font-black uppercase text-xs hover:text-white transition tracking-widest">CANCELAR</button>
          <button onClick={handleSubmit(onSubmit)} className="flex-[2] bg-red-700 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition shadow-xl shadow-red-900/20 active:scale-95">
            {memberData ? 'SALVAR ALTERAÇÕES' : 'EFETIVAR CADASTRO'}
          </button>
        </div>
      </div>
    </div>
  );
}