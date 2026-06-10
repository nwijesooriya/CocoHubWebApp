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

// Route for uploading an image - uses multer middleware
router.post('/upload', upload.single('image'), uploadImage);

// Route for getting image details by public ID
router.get('/details/:public_id', getImageDetails);

// Route for generating a transformed URL
router.post('/transform', transformImage);

module.exports = router;
