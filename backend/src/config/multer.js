const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuração Manual Robusta para o Render
// Se a URL do Cloudinary não for detectada, ele usa as chaves individuais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'dt4lipgxt',
  api_key: process.env.CLOUDINARY_API_KEY || '871267352253446',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'tqmdnrui8NrRDaqXsoG6TnyWWWE'
});

// Garante que o construtor seja carregado corretamente
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tdu_membros',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `membro-${timestamp}`;
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