const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');
require('dotenv').config();

// O Cloudinary lê a variável CLOUDINARY_URL automaticamente do sistema,
// mas para garantir, vamos forçar a extração da classe correta abaixo:

const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage 
  ? multerStorageCloudinary.CloudinaryStorage 
  : multerStorageCloudinary;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tdu_membros',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `membro-${uniqueSuffix}`;
    },
  },
});

module.exports = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
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