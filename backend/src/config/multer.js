const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuração explícita usando a URL ou as chaves individuais
if (process.env.CLOUDINARY_URL) {
  // O Cloudinary v2 aceita a configuração automática via URL se chamada assim:
  cloudinary.config(); 
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tdu_membros',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const name = file.originalname.split('.')[0].replace(/\s+/g, '-');
      return `membro-${Date.now()}-${name}`;
    },
  },
});

module.exports = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido.'));
    }
  },
};