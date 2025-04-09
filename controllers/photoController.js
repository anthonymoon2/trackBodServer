const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Define 5MB size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Compress image using sharp
const compressImage = async (fileBuffer) => {
    return await sharp(fileBuffer)
      .withMetadata()             // <-- preserve metadata
      .resize({ width: 1024 })
      .jpeg({ quality: 80 })
      .toBuffer();
  };
  

// Configure multer to use memoryStorage
const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 }, // Max upload size is 30MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed.'));
        }
    },
}).single('image');

exports.upload = async (req, res) => {
    console.log('Upload endpoint hit');
    uploadImage(req, res, async (err) => {
        if (err) {
            console.error('Error during Multer upload:', err);
            return res.status(400).json({ message: err.message, success: false });
        }

        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded', success: false });
        }

        try {
            console.log('File size:', req.file.size);

            let fileBuffer = req.file.buffer;

            // Compress only if file size is larger than 5MB
            if (req.file.size > MAX_FILE_SIZE) {
                console.log('File exceeds 5MB, compressing...');
                fileBuffer = await compressImage(fileBuffer);
            } else {
                console.log('File is within size limit, no compression needed.');
            }

            const uniqueName = `${req.file.fieldname}-${uuidv4()}${path.extname(req.file.originalname)}`;
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: uniqueName,
                Body: fileBuffer,
                ContentType: req.file.mimetype,
            };

            const uploadCommand = new PutObjectCommand(uploadParams);
            await s3.send(uploadCommand);

            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueName}`;
            console.log('File uploaded to S3. URL:', fileUrl);

            res.json({
                message: 'File uploaded successfully to AWS bucket.',
                downloadUrl: fileUrl,
                fileKey: uniqueName,
                success: true,
            });
        } catch (error) {
            console.error('Error processing file upload:', error);
            res.status(500).json({ message: 'Error processing file upload', success: false });
        }
    });
};