import React, { useState, useRef } from 'react';
import api from '../services/api'; 
import { Send, User, Church, ClipboardList, CheckCircle2, Camera, RefreshCw, Fingerprint, MapPin, FileText } from 'lucide-react';

const FormSolicitacao = () => {
  const [enviado, setEnviado] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    // Identificação
    full_name: '',
    email: '',
    phone_whatsapp: '',
    birth_date: '',
    gender: 'Não Informado',
    // Documentos
    document_cpf: '',
    document_rg: '',
    rg_emissor: '',
    // Endereço
    address_zip: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_district: '',
    address_city: 'Diadema',
    // Espiritual
    category: 'Corrente',
    baptism_date: '',
    godparent: '',
    previous_house: '',
    // Eleitoral
    is_voter: false,
    voter_card: '',
    voter_zone: '',
    voter_section: '',
    political_note: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const ligarCamera = async () => {
    setFotoCapturada(null);
    setCameraAtiva(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 480, height: 480 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Erro ao acessar câmera. Verifique as permissões.");
      setCameraAtiva(false);
    }
  };

  const capturarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      context.translate(400, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setFotoCapturada(dataUrl);
      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      setCameraAtiva(false);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fotoCapturada) return alert("A biometria facial é obrigatória.");
    setCarregando(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      const blob = dataURLtoBlob(fotoCapturada);
      data.append('photo', blob, `biometria_${Date.now()}.jpg`);

      await api.post('/public/solicitacao', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEnviado(true);
      window.scrollTo(0, 0);
    } catch (error) {
      alert("Erro ao enviar: " + (error.response?.data?.message || "Erro de conexão"));
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-10 rounded-[40px] text-center shadow-2xl animate-fade-in">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={80} />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Solicitação Enviada!</h2>
          <p className="text-slate-400 mt-4 leading-relaxed">Axé! Seus dados foram encaminhados para a diretoria do 7 Caveiras.</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 pb-24 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 p-2 bg-red-600/10 border border-red-600/20 rounded-full mb-6 px-4">
            <Fingerprint size={16} className="text-red-600" />
            <span className="text-red-600 font-black tracking-[0.3em] text-[10px] uppercase">TDU - 7 Caveiras | Cadastro de Membro</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ficha de Solicitação da Corrente</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SEÇÃO 00: BIOMETRIA */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[45px] flex flex-col items-center shadow-2xl">
            <div className="relative w-56 h-56 mb-6">
              <div className="absolute inset-0 border-2 border-red-600/40 rounded-full z-10 pointer-events-none border-dashed animate-[spin_10s_linear_infinite]"></div>
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden border-4 border-slate-800 flex items-center justify-center relative">
                {!cameraAtiva && !fotoCapturada && <User size={80} className="text-slate-900" />}
                {cameraAtiva && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
                {fotoCapturada && <img src={fotoCapturada} alt="Captura" className="w-full h-full object-cover" />}
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="w-full max-w-xs space-y-3">
              {!cameraAtiva && !fotoCapturada ? (
                <button type="button" onClick={ligarCamera} className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:bg-slate-200">
                  <Camera size={18} /> Ativar Câmera
                </button>
              ) : cameraAtiva ? (
                <button type="button" onClick={capturarFoto} className="w-full bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest animate-pulse">
                  Capturar Agora
                </button>
              ) : (
                <button type="button" onClick={ligarCamera} className="w-full bg-slate-800 text-slate-400 font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:text-white">
                  <RefreshCw size={18} /> Refazer Foto
                </button>
              )}
            </div>
          </div>

          {/* SEÇÃO 01: DADOS PESSOAIS */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px]">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={14}/> 01. Identificação e Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500">Nome Completo</label>
                <input type="text" name="full_name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">WhatsApp</label>
                <input type="text" name="phone_whatsapp" placeholder="(11) 90000-0000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">E-mail</label>
                <input type="email" name="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Data de Nascimento</label>
                <input type="date" name="birth_date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Gênero</label>
                <select name="gender" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange}>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outros">Outros</option>
                  <option value="Não Informado">Prefiro não dizer</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO 02: DOCUMENTAÇÃO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px]">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText size={14}/> 02. Documentos Oficiais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">CPF</label>
                <input type="text" name="document_cpf" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">RG</label>
                <input type="text" name="document_rg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Órgão Emissor</label>
                <input type="text" name="rg_emissor" placeholder="SSP/SP" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* SEÇÃO 03: ENDEREÇO */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px]">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin size={14}/> 03. Localização
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">CEP</label>
                <input type="text" name="address_zip" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-500">Rua/Logradouro</label>
                <input type="text" name="address_street" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Número</label>
                <input type="text" name="address_number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500">Bairro</label>
                <input type="text" name="address_district" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Cidade</label>
                <input type="text" name="address_city" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* SEÇÃO 04: VIDA ESPIRITUAL */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px]">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Church size={14}/> 04. Jornada Espiritual
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Categoria</label>
                <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange}>
                  <option value="Corrente">Corrente</option>
                  <option value="Assistência">Assistência</option>
                  <option value="Ogã">Ogã</option>
                  <option value="Cambone">Cambone</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Data de Batismo</label>
                <input type="date" name="baptism_date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500">Padrinho / Madrinha</label>
                <input type="text" name="godparent" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* SEÇÃO 05: ELEITORAL */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px]">
            <h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <ClipboardList size={14}/> 05. Informações Complementares
            </h3>
            <label className="flex items-center gap-3 cursor-pointer mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input type="checkbox" name="is_voter" className="w-5 h-5 accent-red-600" onChange={handleChange} />
              <span className="text-xs font-bold text-slate-400 uppercase">Sou eleitor </span>
            </label>
            {formData.is_voter && (
              <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-300">
                <div className="col-span-3 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Título de Eleitor</label>
                  <input type="text" name="voter_card" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Zona</label>
                  <input type="text" name="voter_zone" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Seção</label>
                  <input type="text" name="voter_section" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-red-600 outline-none" onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!fotoCapturada || carregando}
            className={`w-full font-black py-6 rounded-[30px] shadow-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm
              ${fotoCapturada && !carregando ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {carregando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
            {carregando ? "Processando Alistamento..." : "Enviar Ficha para Diretoria"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormSolicitacao;