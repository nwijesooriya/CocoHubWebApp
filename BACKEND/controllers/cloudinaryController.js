const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// 1. Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * 2. Upload an image to Cloudinary using upload_stream
 * Uses the file buffer from multer memoryStorage
 */
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    console.log(`Cloudinary: Starting stream upload for file: ${req.file.originalname}`);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mern_project_uploads',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Stream Upload Error:', error);
          return res.status(500).json({
            success: false,
            message: 'Cloudinary upload failed',
            error: error.message
          });
        }

        console.log('Upload successful:', result.public_id);
        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          data: {
            secure_url: result.secure_url,
            public_id: result.public_id
          }
        });
      }
    );

    // Write the buffer to the Cloudinary stream
    streamifier.createReadStream(req.file.buffer).pipe(stream);

  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during upload',
      error: error.message
    });
  }
};

/**
 * 3. Fetch metadata of an image from Cloudinary
 */
const getImageDetails = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public ID is required.' 
      });
    }

    console.log(`Fetching details for public_id: ${public_id}`);

    const details = await cloudinary.api.resource(public_id);

    return res.status(200).json({
      success: true,
      data: {
        width: details.width,
        height: details.height,
        format: details.format,
        bytes: details.bytes,
        created_at: details.created_at
      }
    });
  } catch (error) {
    console.error('Cloudinary Get Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch image details',
      error: error.message
    });
  }
};

/**
 * 4. Return a transformed URL (auto format and quality)
 */
const transformImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public ID is required for transformation.' 
      });
    }

    console.log(`Generating transformed URL for: ${public_id}`);

    const transformedUrl = cloudinary.url(public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    return res.status(200).json({
      success: true,
      transformed_url: transformedUrl
    });
  } catch (error) {
    console.error('Cloudinary Transformation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate transformed URL',
      error: error.message
    });
  }
};

// 5. Export all controllers
module.exports = {
  uploadImage,
  getImageDetails,
  transformImage
};
