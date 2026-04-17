const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = (file) => {
    return new Promise((resolve, reject) => {

        if (file.mimetype.startsWith('video')) {
            // Badi videos ke liye upload_large — 20MB chunks mein upload hogi
            const videoOptions = {
                resource_type: 'video',
                chunk_size: 20000000,       // 20MB chunks — fast & reliable
                eager: [
                    // Cloudinary khud video compress karega — size kam, quality theek
                    { quality: 'auto', fetch_format: 'mp4' }
                ],
                eager_async: true,          // Compression background mein hogi
            };

            cloudinary.uploader.upload_large(file.path, videoOptions, (error, result) => {
                fs.unlink(file.path, () => {}); // temp file hamesha delete karo
                if (error) {
                    console.log("Cloudinary Video Error:", error);
                    return reject(error);
                }
                resolve(result);
            });

        } else {
            // Images ke liye normal upload — quality auto compress
            const imageOptions = {
                resource_type: 'image',
                quality: 'auto',            // Cloudinary image size automatically reduce karega
                fetch_format: 'auto',       // Best format choose karega (webp etc)
            };

            cloudinary.uploader.upload(file.path, imageOptions, (error, result) => {
                fs.unlink(file.path, () => {}); // temp file hamesha delete karo
                if (error) {
                    console.log("Cloudinary Image Error:", error);
                    return reject(error);
                }
                resolve(result);
            });
        }
    });
};

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File type aur size validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mkv', 'video/webm', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Sirf images (jpg, png, gif, webp) aur videos (mp4, mkv, webm, mov) allowed hain'), false);
    }
};

const multerMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max — badi videos bhi jayengi
    }
});

module.exports = { multerMiddleware, uploadFileToCloudinary };