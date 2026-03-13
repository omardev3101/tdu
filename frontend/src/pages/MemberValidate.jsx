import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, User, Calendar, Award, Loader2 } from 'lucide-react';

// URL base configurada para evitar barra dupla
const API_URL = (import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com').replace(/\/$/, '');

export default function MemberValidate() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PROTEÇÃO: Não chama a API se o ID for inválido
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }

    async function loadMember() {
      try {
        // CORREÇÃO: Rota pública oficial conforme seu routes.js
        const response = await axios.get(`${API_URL}/public/membro/${id}`);
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
      <h1 className="text-2xl font-bold text-white uppercase">Membro não encontrado</h1>
      <p className="text-slate-400 mt-2">Este QR Code é inválido ou o registro foi removido.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans">
      <div className="max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Status Header */}
        <div className="bg-emerald-600 p-6 text-center">
          <ShieldCheck size={60} className="text-white mx-auto mb-2 drop-shadow-lg" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Membro Identificado</h2>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* Foto do Membro */}
          <div className="w-32 h-32 rounded-2xl border-4 border-slate-800 bg-slate-800 overflow-hidden mb-6 shadow-xl relative flex items-center justify-center">
            {member.photo_url ? (
              <img 
                src={`${API_URL}/uploads/${member.photo_url}`} 
                alt="Foto" 
                className="w-full h-full object-cover z-10"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <span className="absolute text-slate-500 font-black text-4xl uppercase">
              {member.full_name?.charAt(0) || '?'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white text-center uppercase leading-tight mb-2">
            {member.full_name}
          </h1>
          <span className="px-4 py-1 bg-red-950/50 text-red-500 rounded-full text-sm font-bold uppercase border border-red-900/50">
            {member.category}
          </span>

          <div className="w-full mt-8 space-y-4">
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              <Award className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Matrícula</p>
                <p className="text-white font-mono font-bold">#{String(member.id).padStart(4, '0')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              <Calendar className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Data de Batismo</p>
                <p className="text-white font-bold">
                  {member.baptism_date ? new Date(member.baptism_date).toLocaleDateString('pt-BR') : 'Não informada'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              <User className="text-red-600" size={24} />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Situação Religiosa</p>
                <p className="text-emerald-500 font-black uppercase">Regularizado</p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
            TDU - 7 Caveiras • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}