import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck, X, MapPin } from 'lucide-react';

// Importe o logo da sua pasta de assets
import logoImg from '../assets/logo-tdu.png'; 

// Componente do Conteúdo (O que será impresso)
const MemberCardContent = React.forwardRef(({ member }, ref) => {
  // Ajuste a porta (3000 ou 3333) conforme o seu backend
  const photoUrl = member.photo_url 
    ? `http://localhost:3000/uploads/${member.photo_url}` 
    : 'https://via.placeholder.com/150';

  // URL de validação para o QR Code
  const validationUrl = `http://localhost:5173/validate/${member.id}`;

  return (
    <div 
      ref={ref} 
      className="p-10 flex flex-col items-center bg-white print:p-6"
      style={{ 
        WebkitPrintColorAdjust: 'exact', 
        printColorAdjust: 'exact' 
      }}
    >
      {/* --- FRENTE DA CARTEIRINHA --- */}
      <div className="w-[380px] h-[240px] rounded-2xl overflow-hidden shadow-2xl relative border-2 border-red-900 flex text-white font-sans mb-10"
        style={{
          backgroundColor: '#050505',
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.8) 100%), url('https://www.transparenttextures.com/patterns/dark-leather.png')`,
        }}
      >
        {/* Faixa Lateral Esquerda */}
        <div className="w-5 bg-red-800 h-full flex flex-col items-center py-3 space-y-1 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-black shadow-md"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md"></div>
        </div>

        <div className="flex-1 p-5 flex flex-col">
          {/* Cabeçalho com Logo em Fundo Branco */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-red-950/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-red-900 shadow-lg p-1 overflow-hidden">
                <img src={logoImg} alt="Logo TDU" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tighter text-red-600 leading-none">TDU - 7 CAVEIRAS</h2>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Terreiro de Umbanda</p>
              </div>
            </div>
            <ShieldCheck size={20} className="text-red-800 opacity-60" />
          </div>

          {/* Corpo: Foto e Dados */}
          <div className="flex gap-4 mt-1">
            <div className="w-24 h-28 bg-slate-900 rounded-xl border-2 border-slate-700 overflow-hidden shadow-lg p-0.5">
              <img src={photoUrl} alt="Foto Membro" className="w-full h-full object-cover rounded-lg" />
            </div>
            
            <div className="flex-1 space-y-2.5">
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Nome Completo</p>
                <p className="text-[12px] font-extrabold leading-tight uppercase text-slate-100 drop-shadow-sm">{member.fullName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Categoria</p>
                  <p className="text-[10px] text-red-500 font-black uppercase bg-red-950/30 px-2 py-0.5 rounded inline-block">{member.category}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">ID</p>
                  <p className="text-[10px] font-mono text-slate-300 font-bold">#{String(member.id).padStart(4, '0')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Batismo</p>
                  <p className="text-[9px] text-slate-300 font-medium">{member.baptismDate || '---'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-2 border-t border-red-950/50 flex justify-between items-center text-[8px]">
            <span className="text-slate-500">Documento Identificador de Membro</span>
            <span className="font-mono text-red-700 font-black italic uppercase tracking-tighter">Axé e Evolução</span>
          </div>
        </div>
      </div>

      {/* --- VERSO DA CARTEIRINHA --- */}
      <div className="w-[380px] h-[240px] rounded-2xl border-2 border-dashed border-slate-400 p-8 flex flex-col justify-between text-slate-900"
        style={{
          backgroundColor: '#f8f8f8',
          backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-dots-9.png')`,
        }}
      >
        <div className="text-center space-y-2">
          <MapPin size={24} className="text-red-900 mx-auto opacity-80" />
          <h3 className="text-[12px] font-black uppercase text-red-950 tracking-wider">TDU - 7 Caveiras</h3>
          <p className="text-[9px] leading-relaxed font-medium italic text-slate-800 bg-white/60 p-3 rounded-xl border border-slate-200 shadow-sm">
            "Este documento atesta o vínculo religioso do membro com o Terreiro de Umbanda 7 Caveiras. Representa o compromisso com a caridade e a evolução espiritual."
          </p>
        </div>
        
        <div className="flex justify-center items-center gap-6 border-t border-slate-300 pt-3">
             <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm">
                <QRCodeSVG 
                  value={validationUrl} 
                  size={65} 
                  level="H" 
                  includeMargin={false}
                />
             </div>
             <div className="flex flex-col">
                <p className="text-[8px] text-slate-700 font-black uppercase tracking-tighter text-left">Validação Digital</p>
                <p className="text-[7px] text-slate-500 uppercase tracking-tighter w-36 text-left">
                  Escaneie para verificar a autenticidade deste documento - {new Date().getFullYear()}
                </p>
             </div>
        </div>
      </div>
    </div>
  );
});

// Componente Principal do Modal
export default function MemberCard({ member, isOpen, onClose }) {
  const componentRef = useRef(null);

  // Hook configurado para a versão mais recente da biblioteca
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Referência correta conforme erro anterior
    documentTitle: `Carteirinha_${member?.fullName?.replace(/\s+/g, '_')}`,
  });

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300">
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-800">
        
        {/* Header do Modal */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white font-sans">
            <Printer className="text-red-600" /> Carteirinha Digital
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition p-2 rounded-full hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Visualização da Carteirinha */}
        <div className="bg-slate-200 overflow-y-auto max-h-[65vh]">
          <MemberCardContent ref={componentRef} member={member} />
        </div>

        {/* Rodapé do Modal com Botões */}
        <div className="p-6 bg-slate-900 flex gap-4 border-t border-slate-800">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 text-slate-400 font-bold hover:text-white transition rounded-xl"
          >
            FECHAR
          </button>
          <button 
            onClick={() => handlePrint()} 
            className="flex-1 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-lg active:scale-95 shadow-red-950/20"
          >
            <Printer size={20} /> GERAR PDF
          </button>
        </div>
      </div>
    </div>
  );
}