const Event = require('../models/Event');

module.exports = {
  async index(req, res) {
    try {
      const events = await Event.findAll({ order: [['eventDate', 'ASC']] });
      return res.json(events);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
  },

  async store(req, res) {
    try {
      // 1. ADICIONADO: 'observations' agora é extraído do body
      const { title, date, time, description, type, observations } = req.body;
      
      const event = await Event.create({ 
        title,
        eventDate: date, 
        startTime: time, 
        description,
        type: type || 'Gira',
        observations: observations || "" // 2. GARANTIDO: Valor padrão vazio se não vier nada
      });

      return res.json(event);
    } catch (err) {
      console.error("ERRO NO BACKEND:", err); // Isso vai aparecer nos logs do Render
      return res.status(400).json({ 
        error: 'Erro ao salvar evento', 
        details: err.message 
      });
    }
  }
}