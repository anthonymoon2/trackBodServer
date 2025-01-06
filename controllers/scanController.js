// import sequelize Scan model
const { Scan } = require('../models'); 

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

// Initialize AWS S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// /api/scan/saveScan
exports.saveScan = async (req, res) => {
    const {
        user_id,
        weight,
        bodyFatPercentage,
        frontViewPhotoURL,
        sideViewPhotoURL,
        leanMass,
        fatMass,
        bodyShape,
        headPosture,
        shoulderPosture,
    } = req.body;

    // Log incoming payload for debugging
    console.log("[DEBUG] Received payload:", req.body);

    // Validate required fields
    if (!user_id || !frontViewPhotoURL || !sideViewPhotoURL) {
        return res.status(400).json({
            success: false,
            code: "MISSING_FIELDS",
            message: "Missing required fields: user_id, frontViewPhotoURL, or sideViewPhotoURL",
        });
    }

    try {
        // Fetch the last scan for the given user_id to determine the next scanNumber
        const lastScan = await Scan.findOne({
            where: { user_id },
            order: [['dateOfScan', 'DESC']], // Order by the most recent scan
        });

        // Calculate the next scanNumber
        const scanNumber = lastScan && typeof lastScan.scanNumber === 'number' 
            ? lastScan.scanNumber + 1 
            : 1;

        // Create the new scan in the database
        const newScan = await Scan.create({
            user_id,
            frontViewPhotoURL,
            sideViewPhotoURL,
            weight: weight || null,
            bodyFatPercentage: bodyFatPercentage || null,
            fatMass: fatMass || null,
            leanMass: leanMass || null,
            headPosture: headPosture || null,
            shoulderPosture: shoulderPosture || null,
            bodyShape: bodyShape || null,
            scanNumber,
            dateOfScan: new Date(), // Add current timestamp if required
        });

        // Log the created scan for debugging
        console.log("[DEBUG] New scan added:", newScan);

        // Respond with success and the new scan
        return res.json({
            success: true,
            message: "Scan added to scan database successfully",
            scan: newScan,
        });
    } catch (error) {
        // Log the error for debugging
        console.error("[ERROR] Error adding scan to database:", error);

        // Respond with an error message
        return res.status(500).json({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error while saving scan",
            error: error.message,
        });
    }
};

// DELETE INDIVIDUAL SCAN IN DATABASE
// /api/scan/:scan_id
const { DeleteObjectCommand } = require('@aws-sdk/client-s3'); // Import the S3 DeleteObjectCommand

exports.deleteScan = async (req, res) => {
    const { scan_id } = req.params; // Extract scan_id from the route parameter

    if (!scan_id) {
        return res.status(400).json({
            success: false,
            code: "MISSING_FIELDS",
            message: "scan_id is required to delete a scan",
        });
    }

    try {
        // Find the scan in the database
        const scan = await Scan.findOne({ where: { id: scan_id } });

        if (!scan) {
            return res.status(404).json({
                success: false,
                code: "SCAN_NOT_FOUND",
                message: "No scan found with the provided scan_id",
            });
        }

        // Extract the keys (file names) for the photos
        const frontPhotoKey = scan.frontViewPhotoURL.split('/').pop();
        const sidePhotoKey = scan.sideViewPhotoURL.split('/').pop();

        // Delete the photos from S3
        const deleteFrontPhotoCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: frontPhotoKey,
        });

        const deleteSidePhotoCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: sidePhotoKey,
        });

        await Promise.all([
            s3.send(deleteFrontPhotoCommand),
            s3.send(deleteSidePhotoCommand),
        ]);

        console.log(`[DEBUG] Deleted photos from S3: ${frontPhotoKey}, ${sidePhotoKey}`);

        // Delete the scan from the database
        await scan.destroy();

        console.log("[DEBUG] Deleted scan from database:", scan_id);

        return res.status(200).json({
            success: true,
            message: "Scan and associated photos deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting scan and photos:", error);
        return res.status(500).json({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error while deleting scan and photos",
            error: error.message,
        });
    }
};

exports.getAllUserScans = async (req, res) => {
    const { user_id } = req.query; 

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id is required",
        });
    }

    try {
        // Fetch all scans for the given user_id
        const userScans = await Scan.findAll({
            where: {
                user_id: user_id,
            },
        });

        if (!userScans || userScans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No scans found for the given user ID",
            });
        }

        // Generate presigned URLs for each scan
        const scansWithPresignedUrls = await Promise.all(
            userScans.map(async (scan) => {
                const frontPhotoUrl = await generatePresignedUrl(scan.frontViewPhotoURL);
                const sidePhotoUrl = await generatePresignedUrl(scan.sideViewPhotoURL);
                return {
                    ...scan.dataValues, // Include all original scan data
                    frontViewPhotoURL: frontPhotoUrl, // Replace with presigned URL
                    sideViewPhotoURL: sidePhotoUrl,   // Replace with presigned URL
                };
            })
        );

        return res.json({
            success: true,
            message: "Scans retrieved successfully",
            data: scansWithPresignedUrls, // Return modified data with presigned URLs
        });
    } catch (error) {
        console.error("Error fetching user scans:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Helper function to generate a pre-signed URL
const generatePresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour
};

// /api/scan/getScanPhotos
exports.getScanPhotos = async (req, res) => {
    const { scan_id } = req.query;

    if (!scan_id) {
        return res.status(400).json({
            success: false,
            message: "scan_id is required",
        });
    }

    try {
        // Fetch the scan details
        const scan = await Scan.findOne({
            where: { id: scan_id },
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: "Scan not found",
            });
        }

        // Generate pre-signed URLs for the photos
        const frontPhotoUrl = await generatePresignedUrl(scan.frontViewPhotoURL);
        const sidePhotoUrl = await generatePresignedUrl(scan.sideViewPhotoURL);

        return res.json({
            success: true,
            message: "Pre-signed URLs generated successfully",
            photos: {
                frontPhotoUrl,
                sidePhotoUrl,
            },
        });
    } catch (error) {
        console.error("Error fetching scan photos:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
