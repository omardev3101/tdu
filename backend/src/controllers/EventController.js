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
      const { title, date, time, description, type } = req.body;
      
      const event = await Event.create({ 
        title,
         
        eventDate: date, // Mapeando date -> eventDate
        startTime: time, // Mapeando time -> startTime
        description,
        type: type || 'Gira',
        observations
      });

      return res.json(event);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: 'Erro ao salvar evento' });
    }
  }
};