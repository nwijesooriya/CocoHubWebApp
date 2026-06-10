const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadImage, 
  getImageDetails, 
  transformImage 
} = require('../controllers/cloudinaryController');

// Configure multer with memoryStorage to avoid local file saving
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /upload - Upload image to Cloudinary with streaming
router.post('/upload', upload.single('image'), uploadImage);

// GET /details/:public_id - Get image metadata from Cloudinary
router.get('/details/:public_id', getImageDetails);

// POST /transform - Generate transformed image URL
router.post('/transform', transformImage);

module.exports = router;
