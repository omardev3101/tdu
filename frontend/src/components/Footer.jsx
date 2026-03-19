import React from 'react';
import { ShieldCheck, Code2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-6 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Info Institucional */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center border border-red-900/30">
            <ShieldCheck size={18} className="text-red-600" />
          </div>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
            @T.D.U. Zé Pelintra, Exu 7 Caveiras <br className="md:hidden" />
            <span className="text-slate-500 font-medium">e Maria das 7 Cocadas {currentYear}</span>
          </p>
        </div>

        {/* Assinatura do Desenvolvedor */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
          <div className="flex items-center gap-2 group">
            <Code2 size={14} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">
              Criado e Desenvolvido por <span className="text-slate-300">Omar Rodrigues</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}