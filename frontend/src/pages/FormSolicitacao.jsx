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

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone_whatsapp: '', birth_date: '', gender: 'Não Informado',
    document_cpf: '', document_rg: '', rg_emissor: '',
    address_zip: '', address_street: '', address_number: '', address_complement: '',
    address_district: '', address_city: 'Diadema',
    category: 'Corrente', baptism_date: '', godparent: '', previous_house: '',
    is_voter: false, voter_card: '', voter_zone: '', voter_section: ''
  });

  // --- MÁSCARAS MANUAIS ---
  const applyCPFMask = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  const applyPhoneMask = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const applyCEPMask = (v) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    // Aplicar máscaras conforme o campo
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

  // --- LÓGICA DE CÂMERA ---
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
      canvas.width = 600; canvas.height = 800;
      const context = canvas.getContext('2d');
      context.translate(600, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, 600, 800);
      setFotoCapturada(canvas.toDataURL('image/jpeg', 0.9));
      video.srcObject.getTracks().forEach(track => track.stop());
      setCameraAtiva(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fotoCapturada) return alert("A biometria facial é obrigatória.");
    setCarregando(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      const blob = await (await fetch(fotoCapturada)).blob();
      data.append('photo', blob, `biometria_${Date.now()}.jpg`);

      await api.post('/public/solicitacao', data);
      setEnviado(true);
      window.scrollTo(0, 0);
    } catch (error) {
      alert("Erro ao enviar: " + (error.response?.data?.message || "Erro de conexão"));
    } finally { setCarregando(false); }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-10 rounded-[40px] text-center shadow-2xl">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={80} />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Enviado com Sucesso!</h2>
          <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ficha de Solicitação</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BIOMETRIA */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[45px] flex flex-col items-center shadow-2xl">
            <div className="relative w-64 h-80 mb-6 bg-slate-950 rounded-[60px] overflow-hidden border-4 border-slate-800 flex items-center justify-center">
                {cameraAtiva && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />}
                {fotoCapturada && <img src={fotoCapturada} alt="Biometria" className="w-full h-full object-cover" />}
                {!cameraAtiva && !fotoCapturada && <User size={80} className="text-slate-800" />}
            </div>
            <div className="w-full max-w-xs flex gap-2">
              <button type="button" onClick={cameraAtiva ? capturarFoto : ligarCamera} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">
                {cameraAtiva ? "Capturar Foto" : fotoCapturada ? "Refazer Foto" : "Ativar Câmera"}
              </button>
            </div>
          </div>

          {/* DADOS */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><User size={14}/> 01. Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="full_name" placeholder="Nome Completo" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} required />
              <input type="text" name="phone_whatsapp" value={formData.phone_whatsapp} placeholder="WhatsApp" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} required />
              <input type="text" name="document_cpf" value={formData.document_cpf} placeholder="CPF" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} required />
              <input type="date" name="birth_date" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} required />
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-4">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> 02. Endereço</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="text" name="address_zip" value={formData.address_zip} placeholder="CEP" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleCEP} required />
              <input type="text" name="address_street" value={formData.address_street} placeholder="Rua" className="col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_number" placeholder="Nº" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_district" value={formData.address_district} placeholder="Bairro" className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
              <input type="text" name="address_city" value={formData.address_city} placeholder="Cidade" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none" onChange={handleChange} />
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={carregando} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[30px] uppercase tracking-widest text-sm shadow-2xl transition-all">
            {carregando ? "Enviando..." : "Confirmar Alistamento"}
          </button>
        </form>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FormSolicitacao;