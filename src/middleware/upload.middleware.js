const multer = require('multer');

// We use memoryStorage — files are held in memory as a Buffer
// The buffer is then passed directly to the Cloudinary SDK in the service
// This avoids writing temp files to disk on Render's free tier

const storage = multer.memoryStorage();

// IMAGE UPLOAD — for course thumbnails
// Max 5MB, images only
const imageUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

// VIDEO UPLOAD — for module videos
// Max 500MB, videos only
const videoUpload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('Only video files are allowed'), false);
        }
        cb(null, true);
    }
});

module.exports = { imageUpload, videoUpload };