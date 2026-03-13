import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; // Importando sua instância do axios já configurada
import { ShieldCheck, ShieldAlert, User, Calendar, Award, Loader2 } from 'lucide-react';

// URL base para carregar as fotos do Render
const API_URL = import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com';

export default function MemberValidate() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        // Usando a instância 'api' que já resolve para o Render ou Local automaticamente
        const response = await api.get(`/public/membro/${id}`);
        setMember(response.data);
      } catch (err) {
        console.error("Erro ao validar membro:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [id]);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="animate-spin text-red-600" size={48} />
      <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Validando Identidade...</span>
    </div>
  );

  if (!member) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert size={80} className="text-red-600 mb-4" />
      <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Registro não encontrado</h1>
      <p className="text-slate-400 mt-2 max-w-xs">Este QR Code pode estar desatualizado ou o membro não consta mais na corrente ativa.</p>
      <button 
        onClick={() => window.location.href = 'https://tdu-front.onrender.com'}
        className="mt-8 px-6 py-2 bg-slate-800 text-white rounded-full text-xs font-bold uppercase"
      >
        Voltar ao Portal
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans">
      <div className="max-w-md mx-auto bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Status Header */}
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          {/* Efeito de brilho no fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
          <ShieldCheck size={70} className="text-white mx-auto mb-2 drop-shadow-lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Membro Autenticado</h2>
          <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-widest opacity-80">Identidade Digital TDU</p>
        </div>

        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
  {member.photo_url ? (
    <img 
      src={member.photo_url.startsWith('http') ? member.photo_url : `${API_URL}/uploads/${member.photo_url}`} 
      className="w-full h-full object-cover z-10"
      alt=""
      // Se a imagem falhar, escondemos ela para mostrar a inicial que está atrás
      onError={(e) => { e.target.style.display = 'none'; }} 
    />
  ) : null}
  
  {/* Esta letra fica "atrás" da imagem e só aparece se a imagem não carregar */}
  <span className="absolute text-slate-500 font-black uppercase text-xs">
    {member.full_name ? member.full_name.charAt(0) : '?'}
  </span>
</div>

          <h1 className="text-2xl font-black text-white text-center uppercase leading-tight mb-2 tracking-tighter">
            {member.full_name}
          </h1>
          <span className="px-5 py-1.5 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/20">
            {member.category}
          </span>

          <div className="w-full mt-10 space-y-3">
            <div className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
              <Award className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Matrícula da Corrente</p>
                <p className="text-white font-mono font-bold text-lg">#{String(member.id).padStart(4, '0')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
              <Calendar className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Data de Ingresso</p>
                <p className="text-white font-bold text-lg">
                    {member.baptism_date ? new Date(member.baptism_date).toLocaleDateString('pt-BR') : '---'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
              <User className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Status de Vínculo</p>
                <p className="text-emerald-500 font-black uppercase text-lg tracking-tighter">Ativo na Casa</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 w-full text-center">
            <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-black">
              TDU 7 CAVEIRAS 
            </p>
            <p className="text-[8px] text-slate-700 mt-1 uppercase font-bold">
              Verificado em: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    
  );
}