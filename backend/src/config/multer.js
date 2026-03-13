const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Importação desestruturada correta
require('dotenv').config();

// 1. Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuração do Armazenamento (Corrigido)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tdu_membros',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const hash = Date.now();
      const fileName = file.originalname.replace(/\s/g, '_').split('.')[0];
      return `${hash}-${fileName}`;
    },
  },
});

module.exports = {
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Use JPG ou PNG.'));
    }
  },
};