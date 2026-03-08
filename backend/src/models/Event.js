const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Event = sequelize.define('Event', {
  title: { 
    type: DataTypes.STRING, 
    allowNull: false // Ex: "Gira de Pretos Velhos" 
  },
  type: { 
    type: DataTypes.ENUM('Gira', 'Festa', 'Amaci', 'Reunião', 'Outros'),
    defaultValue: 'Gira'
  },
  eventDate: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  startTime: { 
    type: DataTypes.STRING, // Ex: "19:30"
    defaultValue: "20:00"
  },
  observations: { 
  type: DataTypes.TEXT,
  allowValue: true,
  comment: "Materiais, vestimentas ou avisos específicos"
}
  
}, {
  timestamps: true
});

module.exports = Event;