import React, { useState, useRef } from 'react';
import api from '../services/api';
import InputMask from 'react-input-mask';
import { 
  Send, User, Church, ClipboardList, CheckCircle2, 
  Camera, RefreshCw, Fingerprint, MapPin, FileText, ShieldCheck 
} from 'lucide-react';

const FormSolicitacao = () => {
  const [enviado, setEnviado] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    address_city: '',
    category: 'Corrente',
    baptism_date: '',
    godparent: '',
    previous_house: '',
    is_voter: false,
    voter_card: '',
    voter_zone: '',
    voter_section: '',
    political_note: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- BUSCA CEP AUTOMÁTICA ---
  const handleCEP = async (e) => {
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
            address_zip: e.target.value
          }));
          document.getElementsByName('address_number')[0]?.focus();
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
    handleChange(e);
  };

  // --- LÓGICA DA CÂMERA (BIOMETRIA) ---
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
      canvas.width = 600;
      canvas.height = 800;
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
      
      const res = await fetch(fotoCapturada);
      const blob = await res.blob();
      data.append('photo', blob, `biometria_${Date.now()}.jpg`);

      await api.post('/public/solicitacao', data);
      setEnviado(true);
      window.scrollTo(0, 0);
    } catch (error) {
      alert("Erro ao enviar. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-10 rounded-[40px] text-center shadow-2xl">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={80} />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Alistamento Concluído!</h2>
          <p className="text-slate-400 mt-4 italic">Seus dados estão em análise pela diretoria.</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700">Novo Cadastro</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 pb-24 font-sans selection:bg-red-600/30">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 p-2 bg-red-600/10 border border-red-600/20 rounded-full mb-6 px-4">
            <Fingerprint size={16} className="text-red-600" />
            <span className="text-red-600 font-black tracking-[0.3em] text-[10px] uppercase">TDU - Sétima Caveira</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ficha de Admissão</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* FOTO BIOMÉTRICA */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[45px] flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="relative w-64 h-80 mb-6">
              <div className="w-full h-full rounded-[60px] bg-slate-950 overflow-hidden border-4 border-slate-800 flex items-center justify-center relative shadow-inner">
                {!cameraAtiva && !fotoCapturada && <User size={80} className="text-slate-800" />}
                {cameraAtiva && (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-950/80">
                         <div className="w-full h-full border-2 border-red-600/50 rounded-[50%_50%_40%_40%]"></div>
                    </div>
                  </>
                )}
                {fotoCapturada && <img src={fotoCapturada} alt="Captura" className="w-full h-full object-cover" />}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
            <div className="w-full max-w-xs space-y-3">
              {!cameraAtiva && !fotoCapturada ? (
                <button type="button" onClick={ligarCamera} className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:bg-slate-200">
                  <Camera size={18} /> Ativar Câmera
                </button>
              ) : cameraAtiva ? (
                <button type="button" onClick={capturarFoto} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest animate-pulse">
                  Capturar Foto
                </button>
              ) : (
                <button type="button" onClick={ligarCamera} className="w-full bg-slate-800 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest">
                  <RefreshCw size={18} /> Refazer Biometria
                </button>
              )}
            </div>
          </div>

          {/* 01. IDENTIFICAÇÃO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><User size={14}/> 01. Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Nome Completo</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">WhatsApp</label>
                <InputMask mask="(99) 99999-9999" name="phone_whatsapp" value={formData.phone_whatsapp} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Data de Nascimento</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Gênero</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600">
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outros">Outros</option>
                  <option value="Não Informado">Prefiro não dizer</option>
                </select>
              </div>
            </div>
          </div>

          {/* 02. DOCUMENTAÇÃO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><FileText size={14}/> 02. Documentos Civil</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">CPF</label>
                <InputMask mask="999.999.999-99" name="document_cpf" value={formData.document_cpf} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">RG</label>
                <input type="text" name="document_rg" value={formData.document_rg} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Órgão Emissor</label>
                <input type="text" name="rg_emissor" placeholder="SSP/SP" value={formData.rg_emissor} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
            </div>
          </div>

          {/* 03. ENDEREÇO (VIA CEP) */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={14}/> 03. Localização</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">CEP</label>
                <InputMask mask="99999-999" name="address_zip" value={formData.address_zip} onChange={handleCEP} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" required />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Rua / Logradouro</label>
                <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Número</label>
                <input type="text" name="address_number" value={formData.address_number} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Bairro</label>
                <input type="text" name="address_district" value={formData.address_district} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Cidade</label>
                <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
            </div>
          </div>

          {/* 04. VIDA ESPIRITUAL */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><Church size={14}/> 04. Vida Espiritual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600">
                  <option value="Corrente">Corrente</option>
                  <option value="Assistência">Assistência</option>
                  <option value="Ogã">Ogã</option>
                  <option value="Cambone">Cambone</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Data Batismo (Umbanda)</label>
                <input type="date" name="baptism_date" value={formData.baptism_date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Padrinho / Madrinha</label>
                <input type="text" name="godparent" value={formData.godparent} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
              </div>
            </div>
          </div>

          {/* 05. DADOS ELEITORAIS */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><ClipboardList size={14}/> 05. Dados Eleitorais</h3>
            <label className="flex items-center gap-3 cursor-pointer mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 group hover:border-red-600/50">
              <input type="checkbox" name="is_voter" checked={formData.is_voter} onChange={handleChange} className="w-5 h-5 accent-red-600" />
              <span className="text-xs font-black text-slate-400 uppercase group-hover:text-white transition-colors">Voto em Diadema / Região</span>
            </label>
            {formData.is_voter && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Título de Eleitor</label>
                  <input type="text" name="voter_card" value={formData.voter_card} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Zona</label>
                  <input type="text" name="voter_zone" value={formData.voter_zone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Seção</label>
                  <input type="text" name="voter_section" value={formData.voter_section} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-red-600" />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!fotoCapturada || carregando}
            className={`w-full font-black py-6 rounded-[30px] shadow-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm
              ${fotoCapturada && !carregando ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40 hover:scale-[1.01]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {carregando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
            {carregando ? "Registrando no Livro..." : "Finalizar Alistamento"}
          </button>
          
        </form>
        <p className="text-center text-slate-600 text-[9px] uppercase mt-8 tracking-widest font-bold">Templo de Umbanda 7 Caveiras © 2026</p>
      </div>
    </div>
  );
};

export default FormSolicitacao;