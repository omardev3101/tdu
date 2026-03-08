import React, { useState } from 'react';
import axios from 'axios';

const FormSolicitacao = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    document_cpf: '',
    document_rg: '',
    phone_whatsapp: '',
    birth_date: '',
    email: '',
    category: 'Corrente',
    baptism_date: '',
    godparent: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // O IP 192.168.1.9 é o do seu PC que configuramos no Docker
      const response = await axios.post('http://192.168.1.9:3000/api/public/solicitacao', formData);
      alert(response.data.message);
    } catch (error) {
      alert("Erro ao enviar: " + error.response?.data?.message || "Erro de conexão");
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white text-center py-3">
          <h4>Solicitação de Cadastro - Filhos da Casa</h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* --- SEÇÃO 1: DADOS PESSOAIS --- */}
            <h5 className="border-bottom pb-2 mb-3 text-primary">Dados Pessoais</h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="full_name" className="form-control" onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">CPF</label>
                <input type="text" name="document_cpf" className="form-control" onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">WhatsApp</label>
                <input type="text" name="phone_whatsapp" className="form-control" onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Data de Nascimento</label>
                <input type="date" name="birth_date" className="form-control" onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">E-mail</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} required />
              </div>
            </div>

            {/* --- SEÇÃO 2: DADOS RELIGIOSOS --- */}
            <h5 className="border-bottom pb-2 mt-4 mb-3 text-primary">Dados Religiosos</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Categoria</label>
                <select name="category" className="form-select" onChange={handleChange}>
                  <option value="Corrente">Corrente</option>
                  <option value="Assistência">Assistência</option>
                  <option value="Ogã">Ogã</option>
                  <option value="Cambone">Cambone</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Padrinho/Madrinha</label>
                <input type="text" name="godparent" className="form-control" onChange={handleChange} />
              </div>
            </div>

            {/* --- SEÇÃO 3: DADOS ELEITORAIS --- */}
            <h5 className="border-bottom pb-2 mt-4 mb-3 text-primary">Informações Adicionais</h5>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" name="is_voter" id="voterCheck" onChange={handleChange} />
              <label className="form-check-label" htmlFor="voterCheck">É eleitor?</label>
            </div>
            
            {formData.is_voter && (
              <div className="row g-3 animate__animated animate__fadeIn">
                <div className="col-md-4">
                  <label className="form-label">Título</label>
                  <input type="text" name="voter_card" className="form-control" onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zona</label>
                  <input type="text" name="voter_zone" className="form-control" onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Seção</label>
                  <input type="text" name="voter_section" className="form-control" onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="mt-4">
              <button type="submit" className="btn btn-primary btn-lg w-100 shadow">
                Enviar Solicitação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormSolicitacao;