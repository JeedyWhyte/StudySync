const cloudinary = require('cloudinary').v2;

// Cloudinary is configured automatically from CLOUDINARY_URL in .env
// No manual config needed — the SDK reads it on its own

// UPLOAD COURSE THUMBNAIL
// Takes a file buffer from Multer memoryStorage and streams it to Cloudinary
// Stored under the 'studysync/thumbnails' folder
const uploadThumbnail = (fileBuffer, courseId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'studysync/thumbnails',
                public_id: `course_${courseId}`,
                overwrite: true,            // replacing thumbnail re-uses the same public_id
                resource_type: 'image',
                transformation: [
                    { width: 1280, height: 720, crop: 'fill' },  // enforce 16:9 ratio
                    { quality: 'auto' }                           // auto-compress for Nigerian bandwidth
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

// UPLOAD MODULE VIDEO
// Takes a file buffer and streams it to Cloudinary under 'studysync/videos'
// Videos are stored with the course and module IDs for easy lookup
const uploadModuleVideo = (fileBuffer, courseId, moduleId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'studysync/videos',
                public_id: `course_${courseId}_module_${moduleId}`,
                overwrite: true,
                resource_type: 'video',
                eager: [
                    { streaming_profile: 'full_hd', format: 'm3u8' }  // HLS streaming for low bandwidth
                ],
                eager_async: true   // process in background — don't block the response
            },
            (error, result) => {
                /*if (error) return reject(error);
                resolve(result.secure_url);*/
                // Instead of just resolve(result.secure_url);
                const hlsUrl = result.eager[0].secure_url;
                resolve(hlsUrl);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

module.exports = { uploadThumbnail, uploadModuleVideo };
