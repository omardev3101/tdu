const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);
        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  }),const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// 1. Configuração do Cloudinary (As chaves devem estar no seu .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuração do Armazenamento na Nuvem
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tdu_membros', // Nome da pasta no Cloudinary
    format: async (req, file) => 'jpg', // Salva tudo como JPG para padronizar
    public_id: (req, file) => {
      // Gera um nome único usando timestamp e o nome original limpo
      const hash = Date.now();
      const fileName = file.originalname.replace(/\s/g, '_').split('.')[0];
      return `${hash}-${fileName}`;
    },
  },
});

module.exports = {
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Mantemos o limite de 2MB
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
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite de 2MB por foto
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Use JPG ou PNG.'));
    }
  },
};