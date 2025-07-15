import express from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/api/cloudinary/upload-file', upload.single('file'), uploadFile);
router.post('/api/cloudinary/upload-files', upload.array('files'),uploadFiles);