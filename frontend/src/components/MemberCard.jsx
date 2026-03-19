import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck, X, MapPin } from 'lucide-react';

import logoImg from '../assets/logo-tdu.png'; 

// URL Dinâmica garantindo que o Render seja o fallback final
const API_URL = (import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com').replace(/\/$/, '');
const FRONT_URL = window.location.origin;

const MemberCardContent = React.forwardRef(({ member }, ref) => {
  
  // FUNÇÃO DE VACINA: Remove qualquer rastro de localhost que venha do banco ou de variáveis antigas
  const getSafePhotoUrl = (url) => {
    if (!url) return `https://placehold.co/150x180/1e293b/white?text=${member.full_name?.charAt(0) || 'TDU'}`;
    
    // Se a string contiver localhost, a gente limpa e força o Render
    const cleanFileName = url.replace('http://localhost:3000/uploads/', '').replace('/uploads/', '');
    
    if (cleanFileName.startsWith('http')) return cleanFileName;
    return `${API_URL}/uploads/${cleanFileName}`;
  };

  const photoUrl = getSafePhotoUrl(member.photo_url);
  const validationUrl = `${FRONT_URL}/validar/${member.id}`;

  return (
    <div ref={ref} className="bg-white">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-container { display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; padding: 0 !important; }
          .card-wrapper { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 10mm !important; }
        }
      `}</style>

      <div className="p-10 flex flex-col items-center gap-8 print-container">
        
        {/* FRENTE */}
        <div className="card-wrapper w-[380px] h-[240px] rounded-2xl overflow-hidden shadow-2xl relative border-2 border-red-900 flex text-white font-sans bg-slate-950">
          <div className="w-5 bg-red-800 h-full flex flex-col items-center py-3 space-y-1 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-black/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
          </div>

          <div className="flex-1 p-5 flex flex-col relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="flex justify-between items-center mb-3 pb-2 border-b border-red-900/30 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-red-900 shadow-lg p-1 overflow-hidden">
                  <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-[13px] font-black tracking-tighter text-red-600 leading-none uppercase">T.D.U. Zé Pelintra</h2>
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-medium italic">7 Caveiras e Maria 7 Cocadas</p>
                </div>
              </div>
              <ShieldCheck size={20} className="text-red-800 opacity-60" />
            </div>

            <div className="flex gap-4 mt-1 relative z-10">
              <div className="w-24 h-28 bg-slate-900 rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg p-0.5">
                <img 
                  src={photoUrl} 
                  alt="" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => { 
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/150x180/1e293b/white?text=?`; 
                  }} 
                />
              </div>
              
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Membro da Corrente</p>
                  <p className="text-[11px] font-extrabold leading-tight uppercase text-slate-100">{member.full_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Categoria</p>
                    <p className="text-[9px] text-red-500 font-black uppercase bg-red-950/40 px-2 py-0.5 rounded inline-block border border-red-900/20">{member.category}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Matrícula</p>
                    <p className="text-[10px] font-mono text-slate-300 font-bold">#{String(member.id).padStart(4, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-2 border-t border-red-900/30 flex justify-between items-center text-[7px] relative z-10">
              <span className="text-slate-500 font-bold uppercase tracking-widest italic">Documento Religioso de Identificação</span>
              <span className="font-mono text-red-700 font-black italic uppercase tracking-tighter">Axé e Evolução</span>
            </div>
          </div>
        </div>

        {/* VERSO */}
        <div 
          className="card-wrapper w-[380px] h-[240px] rounded-2xl border-2 border-dashed border-slate-300 p-8 flex flex-col justify-between text-slate-900 shadow-inner relative overflow-hidden bg-slate-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%3C94a3b8' fill-opacity='0.2'%3E%3Cpath d='M20 10c-1.1 0-2 .9-2 2v2h4v-2c0-1.1-.9-2-2-2zm-6 8c-1.1 0-2 .9-2 2v6h2v-2h8v2h2v-6c0-1.1-.9-2-2-2h-8z'/%3E%3Ccircle cx='16' cy='22' r='2'/%3E%3Ccircle cx='24' cy='22' r='2'/%3E%3Cpath d='M18 28h4v2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="text-center space-y-2 relative z-10">
            <MapPin size={20} className="text-red-900 mx-auto opacity-80" />
            <h3 className="text-[11px] font-black uppercase text-red-950 tracking-wider leading-tight">
              T.D.U. Zé Pelintra
            </h3>
            <p className="text-[9px] leading-relaxed font-medium italic text-slate-700 bg-white/85 p-3 rounded-xl border border-slate-200 shadow-sm">
              "Este documento atesta o vínculo religioso do membro com o terreiro. Representa o compromisso com a caridade e a evolução espiritual."
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-6 border-t border-slate-200 pt-4 relative z-10">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
              <QRCodeSVG value={validationUrl} size={55} level="H" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[8px] text-slate-800 font-black uppercase tracking-tighter text-left">Validação Digital</p>
              <p className="text-[7px] text-slate-500 uppercase tracking-tighter w-44 text-left leading-tight">
                Escaneie para verificar a autenticidade no portal oficial - {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function MemberCard({ member, isOpen, onClose }) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Carteirinha_TDU_${member?.full_name?.replace(/\s+/g, '_')}`,
  });

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white uppercase italic tracking-tighter">
            <Printer className="text-red-600" /> Carteirinha Digital
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition p-2 rounded-full hover:bg-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="bg-slate-100 overflow-y-auto max-h-[60vh]">
          <MemberCardContent ref={componentRef} member={member} />
        </div>

        <div className="p-6 bg-slate-900 flex gap-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 px-4 py-3 text-slate-500 font-bold uppercase text-xs tracking-widest">Fechar</button>
          <button onClick={() => handlePrint()} className="flex-1 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-lg active:scale-95">
            <Printer size={20} /> GERAR PDF
          </button>
        </div>
      </div>
    </div>
  );
}