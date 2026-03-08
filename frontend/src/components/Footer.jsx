import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-4 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 px-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-900/30">
          <span className="text-red-500 font-black text-xs italic">7C</span>
        </div>
        <div>
          <p className="text-slate-500 font-bold uppercase text-[8px] tracking-[0.2em] leading-none">Plataforma de Gestão</p>
          <h3 className="text-white font-black uppercase text-[10px] tracking-widest">TDU - 7 Caveiras</h3>
        </div>
      </div>

      <div className="text-center md:text-right">
        <p className="text-slate-500 font-medium text-[9px] uppercase tracking-widest">
          Criado e Desenvolvido por
        </p>
        <p className="text-white font-black uppercase text-[12px] tracking-tighter mt-1 group cursor-default">
          <span className="text-red-600 animate-pulse">●</span> OMAR RODRIGUES <span className="text-slate-500 font-light mx-1">|</span> <span className="text-slate-300">DIRETOR DE TECNOLOGIA</span>
        </p>
      </div>
    </footer>
  );
}