import React, { useState, useRef } from 'react';
import api from '../services/api'; 
import { 
  Send, User, Church, ClipboardList, CheckCircle2, 
  Camera, RefreshCw, Fingerprint, MapPin, FileText 
} from 'lucide-react';

const FormSolicitacao = () => {
  const [enviado, setEnviado] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // IMPORTANTE: Os nomes das chaves aqui devem ser IGUAIS às colunas do banco
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_whatsapp: '',
    birth_date: '',
    gender: 'Não Informado',
    document_cpf: '',
    document_rg: '',
    rg_emissor: '',
    address_zip: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_district: '',
    address_city: 'Diadema',
    category: 'Corrente',
    baptism_date: '',
    godparent: '',
    previous_house: '', // Mapeado para "Terreiro Anterior"
    is_voter: false,
    voter_card: '',
    voter_zone: '',
    voter_section: '',
    political_note: ''
  });

  const applyCPFMask = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
  const applyPhoneMask = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
  const applyCEPMask = (v) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'document_cpf') value = applyCPFMask(value);
    if (name === 'phone_whatsapp') value = applyPhoneMask(value);
    if (name === 'address_zip') value = applyCEPMask(value);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCEP = async (e) => {
    handleChange(e);
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address_street: data.logradouro,
            address_district: data.bairro,
            address_city: data.localidade,
            address_zip: applyCEPMask(cep)
          }));
          document.getElementsByName('address_number')[0]?.focus();
        }
      } catch (err) { console.error("Erro CEP"); }
    }
  };

  const ligarCamera = async () => {
    setFotoCapturada(null);
    setCameraAtiva(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Erro ao acessar câmera.");
      setCameraAtiva(false);
    }
  };

 const capturarFoto = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  
  if (video && canvas) {
    // Definimos o tamanho final da foto (Proporção 3:4 vertical)
    const larguraAlvo = 600;
    const alturaAlvo = 800;
    
    canvas.width = larguraAlvo;
    canvas.height = alturaAlvo;
    const context = canvas.getContext('2d');

    // --- LÓGICA DE CORTE PARA EVITAR DISTORÇÃO ---
    // Pegamos as dimensões REAIS do vídeo que está vindo da câmera
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;

    // Calculamos a proporção para cobrir o canvas sem sobrar espaço
    const ratio = Math.max(larguraAlvo / videoW, alturaAlvo / videoH);
    const drawW = videoW * ratio;
    const drawH = videoH * ratio;

    // Centralizamos o corte
    const dx = (larguraAlvo - drawW) / 2;
    const dy = (alturaAlvo - drawH) / 2;

    // Espelhamento (para a foto ficar igual ao que a pessoa vê na tela)
    context.translate(larguraAlvo, 0);
    context.scale(-1, 1);

    // Desenha a imagem cortada e centralizada
    context.drawImage(video, dx, dy, drawW, drawH);

    // Finaliza
    setFotoCapturada(canvas.toDataURL('image/jpeg', 0.9));
    
    // Desliga a câmera
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraAtiva(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!fotoCapturada) return alert("A biometria facial é obrigatória.");
  
  setCarregando(true);
  
  try {
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      let value = formData[key];

      // Se for DATA e estiver vazio, NÃO ENVIA (o banco assume NULL)
      if ((key === 'birth_date' || key === 'baptism_date') && (value === "" || value === null)) {
        return; 
      }

      // Converte booleano para "1" ou "0" para o campo TINYINT
      if (key === 'is_voter') {
        value = value ? "1" : "0";
      }

      // Limpa máscaras de CPF e CEP
      if (key === 'document_cpf' || key === 'address_zip') {
        value = value.replace(/\D/g, '');
      }

      // Garante que não envie strings vazias em campos opcionais
      if (value === "" && key !== 'full_name' && key !== 'email') {
        return;
      }

      data.append(key, value);
    });

    // Foto - Nome exato da coluna no banco: photo_url
    const res = await fetch(fotoCapturada);
    const blob = await res.blob();
    data.append('photo_url', blob, `biometria_${Date.now()}.jpg`);

    await api.post('/public/solicitacao', data);

    setEnviado(true);
    window.scrollTo(0, 0);
  } catch (error) {
    console.error("Erro detalhado:", error.response?.data);
    const msg = error.response?.data?.details || "Erro de validação nos campos.";
    alert("Falha no cadastro: " + msg);
  } finally {
    setCarregando(false);
  }
};

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-10 rounded-[40px] text-center shadow-2xl">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={80} />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Solicitação Enviada!</h2>
          <p className="text-slate-400 mt-4">Axé! Seus dados foram encaminhados com sucesso.</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Nova Ficha</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 pb-24 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Alistamento de Corrente - TDU</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
{/* FOTO BIOMÉTRICA - CÂMERA OU GALERIA */}
<div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[45px] flex flex-col items-center shadow-2xl relative">
  
  {/* Container do Preview (Proporção 3:4) */}
  <div className="relative w-64 h-80 mb-6 bg-slate-950 rounded-[60px] overflow-hidden border-4 border-slate-800 flex items-center justify-center shadow-inner">
    
    {cameraAtiva && (
      <>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/40"></div>
          <div className="w-[85%] h-[85%] border-2 border-dashed border-white/30 rounded-[50%_50%_40%_40%] relative">
             <div className="absolute inset-0 border-2 border-red-600/40 rounded-[50%_50%_40%_40%] animate-pulse"></div>
          </div>
        </div>
      </>
    )}

    {fotoCapturada && (
      <img 
        src={fotoCapturada} 
        alt="Biometria" 
        className="w-full h-full object-cover animate-in fade-in duration-500" 
      />
    )}

    {!cameraAtiva && !fotoCapturada && (
      <div className="flex flex-col items-center gap-2">
        <User size={80} className="text-slate-800" />
        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Aguardando Imagem</span>
      </div>
    )}
  </div>

  {/* Controles de Ação */}
  <div className="w-full max-w-xs space-y-3">
    {/* Botão Principal: Câmera */}
    <button 
      type="button" 
      onClick={cameraAtiva ? capturarFoto : ligarCamera} 
      className={`w-full font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
        cameraAtiva 
          ? "bg-white text-slate-950 hover:bg-slate-200" 
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {cameraAtiva ? <RefreshCw size={16} className="animate-spin-slow" /> : <Camera size={16} />}
      {cameraAtiva ? "Capturar Agora" : fotoCapturada ? "Tirar Outra Foto" : "Usar Câmera ao Vivo"}
    </button>

    {/* Botão Secundário: Galeria (Apenas se a câmera estiver desligada) */}
    {!cameraAtiva && (
      <div className="relative">
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setFotoCapturada(reader.result);
              reader.readAsDataURL(file);
            }
          }}
        />
        <button 
          type="button" 
          className="w-full border border-slate-700 text-slate-400 font-bold py-3 rounded-2xl uppercase text-[9px] tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <FileText size={14} /> 
          {fotoCapturada ? "Trocar Arquivo" : "Enviar da Galeria"}
        </button>
      </div>
    )}
  </div>

  <p className="mt-4 text-[8px] text-slate-600 uppercase font-bold tracking-tighter italic">
    * A foto deve mostrar claramente o rosto do solicitante.
  </p>
</div>

          {/* 01. IDENTIFICAÇÃO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4 shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><User size={14}/> 01. Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="full_name" placeholder="Nome Completo" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" onChange={handleChange} required />
              <input type="text" name="phone_whatsapp" value={formData.phone_whatsapp} placeholder="WhatsApp" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" onChange={handleChange} required />
              <input type="text" name="document_cpf" value={formData.document_cpf} placeholder="CPF" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" onChange={handleChange} required />
              <input type="date" name="birth_date" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none text-slate-400" onChange={handleChange} required />
              <select name="gender" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none text-slate-400" onChange={handleChange}>
                  <option value="Não Informado">Gênero...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outros">Outros</option>
              </select>
              <input type="email" name="email" placeholder="E-mail" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" onChange={handleChange} required />
            </div>
          </div>

          {/* 02. ENDEREÇO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4 shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> 02. Localização</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="text" name="address_zip" value={formData.address_zip} placeholder="CEP" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" onChange={handleCEP} required />
              <input type="text" name="address_street" value={formData.address_street} placeholder="Rua / Logradouro" className="col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_number" placeholder="Nº" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_district" value={formData.address_district} placeholder="Bairro" className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_city" value={formData.address_city} placeholder="Cidade" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
            </div>
          </div>

          {/* 03. VIDA ESPIRITUAL */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4 shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Church size={14}/> 03. Jornada Espiritual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="category" value={formData.category} onChange={handleChange}>
    <option value="Corrente">Corrente</option>
    <option value="Assistência">Assistência</option>
    <option value="Ogã">Ogã</option>
    <option value="Cambone">Cambone</option>
    <option value="Pai de Pequeno">Pai de Pequeno</option>
    <option value="Mãe de Pequena">Mãe de Pequena</option>
</select>
              <input type="date" name="baptism_date" placeholder="Data Batismo" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none text-slate-400" onChange={handleChange} />
              <input type="text" name="godparent" placeholder="Padrinho / Madrinha" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              {/* Campo Mapeado corretamente para a coluna previous_house */}
              <input type="text" name="previous_house" placeholder="Terreiro Anterior (se houver)" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
            </div>
          </div>

          {/* 04. DADOS ELEITORAIS */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4 shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ClipboardList size={14}/> 04. Dados Eleitorais</h3>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-4 rounded-xl border border-slate-800 group transition-all">
              <input type="checkbox" name="is_voter" checked={formData.is_voter} onChange={handleChange} className="w-5 h-5 accent-red-600" />
              <span className="text-xs font-black text-slate-500 uppercase group-hover:text-white transition-colors">Sou Eleitor em Diadema / Região</span>
            </label>
            {formData.is_voter && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                <input type="text" name="voter_card" placeholder="Título" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
                <input type="text" name="voter_zone" placeholder="Zona" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
                <input type="text" name="voter_section" placeholder="Seção" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              </div>
            )}
          </div>

          <button type="submit" disabled={carregando} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[30px] uppercase tracking-[0.2em] text-sm shadow-2xl transition-all hover:scale-[1.01]">
            {carregando ? "Processando..." : "Confirmar Solicitação"}
          </button>
        </form>
        <p className="text-center text-slate-600 text-[9px] uppercase mt-8 tracking-widest font-bold">Tdu 7 Caveiras © 2026</p>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FormSolicitacao;