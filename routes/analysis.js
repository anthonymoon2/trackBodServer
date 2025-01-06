const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const OpenAI = require('openai');

const { User } = require('../models');

// Middleware
const authenticate = require('../middlewares/authMiddleware');

dotenv.config();
const router = express.Router();

// Initialize AWS S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function: Generate pre-signed URLs
const generatePresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour
};

// Route: /api/analysis/:id
router.post("/:id", authenticate, async (req, res) => {
    console.log("Incoming analysis request:", req.body);

    const userId = req.params.id; // Extract user ID from the path parameter
    const { imageKeys } = req.body; // Extract image keys from the request body

    // Validate input
    if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
    }
    if (!imageKeys || imageKeys.length !== 2) {
        return res.status(400).json({ error: "Please provide exactly two image keys." });
    }

    try {
        // Fetch user details from the database
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'weight', 'height', 'gender', 'dateOfBirth'], // Fetch required fields
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Destructure user details
        const { weight, height, gender, dateOfBirth } = user;

        // Validate user details
        if (!weight || !height || !gender || !dateOfBirth) {
            return res.status(400).json({
                error: "Missing user details: weight, height, gender, or dateOfBirth.",
            });
        }

        console.log(`Retrieved user details - Weight: ${weight}, Height: ${height}, Gender: ${gender}, Date of Birth: ${dateOfBirth}`);

        // Generate pre-signed URLs for the images
        const imageUrls = await Promise.all(
            imageKeys.map(async (key) => {
                const url = await generatePresignedUrl(key);
                console.log(`Generated pre-signed URL for key "${key}": ${url}`);
                return url;
            })
        );

        // Prepare payload for OpenAI API
        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Imagine you are creating a detailed hypothetical fitness character. Using the provided images and numerical inputs, estimate some hypothetical attributes for the character. Based on visual cues and the information provided, what would these attributes be?",
                        },
                        {
                            type: "text",
                            text: "Inputs:",
                        },
                        {
                            type: "text",
                            text: "- Front View Image",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrls[0],
                                detail: "high",
                            },
                        },
                        {
                            type: "text",
                            text: "- Side View Image",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrls[1],
                                detail: "high",
                            },
                        },
                        {
                            type: "text",
                            text: `Additional Information:
                            - Weight: ${weight} lbs
                            - Height: ${height} inches
                            - Gender: ${gender}
                            - Date of Birth: ${dateOfBirth}`,
                        },
                        {
                            type: "text",
                            text: `Estimate the following attributes for the fictional character:
                            {
                                "bodyFatPercentage": integer (a whole number between 10 and 40),
                                "leanMass": number (a decimal),
                                "fatMass": number (a decimal),
                                "headPosture": "neutral|forward tilt|tilted left|tilted right",
                                "shoulderPosture": "neutral|slightly rounded|rounded|uneven",
                                "bodyShape": "ectomorph|mesomorph|endomorph"
                            }
                    
                            Respond only in JSON format. Avoid any additional commentary or explanations.`,
                        },
                    ]
                },
            ],
            temperature: 0.2,
            max_tokens: 350,
        };

        // Log the payload sent to OpenAI
        console.log("Payload sent to OpenAI:", JSON.stringify(payload, null, 2));

        // Make OpenAI API call
        const response = await openai.chat.completions.create(payload);

        console.log("OpenAI Response:", response.choices[0]?.message?.content);

        const responseContent = response.choices[0]?.message?.content;
        if (!responseContent) {
            return res.status(500).json({ error: "OpenAI did not return any content." });
        }

        // Parse OpenAI response
        const sanitizedResponse = responseContent.trim().replace(/^```json|```$/g, "");
        const parsedMetrics = JSON.parse(sanitizedResponse);

        console.log("Parsed Metrics:", parsedMetrics);

        // Respond with parsed metrics
        res.setHeader('Content-Type', 'application/json');
        res.json(parsedMetrics);
    } catch (error) {
        console.error("Error processing analysis request:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});



/*

// Helper function: Fetch images as base64
const fetchImageAsBase64 = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    } catch (error) {
        console.error('Error fetching image from URL:', url, error.message);
        throw new Error('Failed to fetch image.');
    }
};

// Route to create a scan
// api/analysis/create-scan
router.post('/create-scan', async (req, res) => {
    const { token, customScanId, frontPhotoKey, sidePhotoKey, weight, height, gender, age } = req.body;

    if (!token || !frontPhotoKey || !sidePhotoKey || !weight || !height || !gender || !age) {
        return res.status(400).json({
            error: 'Token, frontPhotoKey, sidePhotoKey, weight, height, gender, and age are required.',
        });
    }

    try {
        const frontPhotoUrl = await generatePresignedUrl(frontPhotoKey);
        const sidePhotoUrl = await generatePresignedUrl(sidePhotoKey);

        const frontPhotoBase64 = await fetchImageAsBase64(frontPhotoUrl);
        const sidePhotoBase64 = await fetchImageAsBase64(sidePhotoUrl);

        const weightInGrams = weight * 1000; // Convert from kg to grams
        const heightInMm = height * 10;     // Convert from cm to mm

        const payload = {
            customScanId,
            photoScan: {
                age,
                weight: weightInGrams,
                height: heightInMm,
                gender,
                frontPhoto: frontPhotoBase64,
                rightPhoto: sidePhotoBase64,
            },
        };

        const response = await axios.post(
            `https://platform.bodygram.com/api/orgs/${process.env.BODYGRAM_ORGANIZATION_ID}/scans`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Parse the response data
        const data = response.data.entry;

        // Extract required fields
        const result = {
            customScanId: data.customScanId,
            scanId: data.id,
            createdAt: data.createdAt,
            measurements: data.measurements.map(measurement => ({
                name: measurement.name,
                unit: measurement.unit,
                value: measurement.value,
            })),
            avatar: {
                format: data.avatar.format,
                type: data.avatar.type,
                base64: data.avatar.data, // You can choose whether to include this
            },
            status: data.status,
        };

        // Return parsed data
        res.json(result);
    } catch (error) {
        if (error.response) {
            console.error('Bodygram API Error:', error.response.status, error.response.data);
            res.status(error.response.status).json({
                error: 'Bodygram API error.',
                details: error.response.data,
            });
        } else {
            console.error('Unexpected Error:', error.message, error.stack);
            res.status(500).json({
                error: 'An unexpected error occurred.',
                details: error.message,
            });
        }
    }
});

// Helper function to fetch images as base64
const fetchImageAsBase64 = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    } catch (error) {
        console.error('Error fetching image from URL:', url, error.message);
        throw new Error('Failed to fetch image.');
    }
};


// Endpoint to generate scan tokens
// /api/analysis/generate-scan-token
router.post('/generate-scan-token', async (req, res) => {
    const { userId } = req.body; // Assuming you send userId from your iOS app

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const customScanId = `scan_${userId}_${Date.now()}`;

        const response = await axios.post(
            `https://platform.bodygram.com/api/orgs/${process.env.BODYGRAM_ORGANIZATION_ID}/scan-tokens`,
            {
                customScanId,
                scope: ["api.platform.bodygram.com/scans:create", "api.platform.bodygram.com/scans:read"]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: process.env.BODYGRAM_API_KEY
                }
            }
        );

        res.json({
            token: response.data.token,
            customScanId,
            expiresAt: response.data.expiresAt
        });

    } catch (error) {
        console.error('Error generating token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate scan token' });
    }
});
*/

module.exports = router;