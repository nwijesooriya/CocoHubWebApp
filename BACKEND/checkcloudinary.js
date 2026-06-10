require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

(async () => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'mern_project_uploads',   // must match your controller folder
      max_results: 10
    });
    console.log(result.resources);
  } catch (err) {
    console.error('Error fetching resources:', err);
  }
})();
