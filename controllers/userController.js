
const { User, Scan } = require('../models'); // Import Sequelize User model
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// /api/user/getUser/:id
// GET user info by ID
exports.getUser = async (req, res) => {
    try {
        // Extract ID from path parameter
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required', success: false });
        }

        // Query the database to find the user
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'email', 'display_name', 'gender', 'height', 'dateOfBirth', 'weight'] // Select fields you need
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        // Return the user data
        res.status(200).json({ user, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};


// /api/user/getWeight
// GET user weight by ID
exports.getWeight = async (req, res) => {
    try {
        const userId = req.params.id; // Extract ID from path parameter

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required', success: false });
        }

        const user = await User.findOne({
            where: { id: userId },
            attributes: ['weight'] // Only fetch the weight field
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        res.status(200).json({ weight: user.weight, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};


// /api/user/setWeight/
// SET user weight by ID
exports.setWeight = async (req, res) => {
    try {
        const userId = req.params.id; // Extract ID from path parameter
        const { weight } = req.body; // Extract new weight from request body

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required', success: false });
        }

        if (!weight) {
            return res.status(400).json({ error: 'Weight is required', success: false });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        // Update the weight
        user.weight = weight;
        await user.save();

        res.status(200).json({ message: 'Weight updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// SET user height by ID
exports.setHeight = async (req, res) => {
    try {
        const userId = req.params.id; // Extract ID from path parameter
        const { height } = req.body; // Extract new height from request body

        // parse height from string to float first
        const parsedHeight = parseHeightString(height);

        if (!userId || !height) {
            return res.status(400).json({ error: 'User ID and height are required', success: false });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        // Update the height
        user.height = parsedHeight;
        await user.save();

        res.status(200).json({ message: 'Height updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// SET user date of birth by ID
exports.setdob = async (req, res) => {
    try {
        const userId = req.params.id; // Extract ID from path parameter
        const { dateOfBirth } = req.body; // Extract new date of birth from request body

        if (!userId || !dateOfBirth) {
            return res.status(400).json({ error: 'User ID and date of birth are required', success: false });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        // Update the date of birth
        user.dateOfBirth = dateOfBirth;
        await user.save();

        res.status(200).json({ message: 'Date of birth updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// SET user gender by ID
exports.setGender = async (req, res) => {
    try {
        const userId = req.params.id; // Extract ID from path parameter
        const { gender } = req.body; // Extract new gender from request body

        if (!userId || !gender) {
            return res.status(400).json({ error: 'User ID and gender are required', success: false });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        // Update the gender
        user.gender = gender;
        await user.save();

        res.status(200).json({ message: 'Gender updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// /api/user/deleteUser/:id
// DELETE user by ID

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required",
        });
    }

    try {
        // Find the user by ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find all scans associated with the user
        const userScans = await Scan.findAll({ where: { user_id: userId } });

        // Extract photo keys from the scans
        const photoKeys = [];
        userScans.forEach(scan => {
            if (scan.frontViewPhotoURL) {
                const frontKey = extractS3Key(scan.frontViewPhotoURL);
                photoKeys.push(frontKey);
            }
            if (scan.sideViewPhotoURL) {
                const sideKey = extractS3Key(scan.sideViewPhotoURL);
                photoKeys.push(sideKey);
            }
        });

        // Delete all photos from S3
        for (const key of photoKeys) {
            try {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                });
                await s3.send(deleteCommand);
                console.log(`Deleted S3 object: ${key}`);
            } catch (error) {
                console.error(`Failed to delete S3 object: ${key}`, error);
            }
        }

        // Delete all scans associated with the user
        await Scan.destroy({ where: { user_id: userId } });

        // Delete the user
        await user.destroy();

        return res.json({
            success: true,
            message: "User, associated scans, and photos successfully deleted",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Helper function to extract S3 key from URL
const extractS3Key = (url) => {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : url;
};

function parseHeightString(heightString) {
    console.log(`HEIGHT STRING THAT WAS RECEIVED FROM FRONTEND: ${heightString}`);
    if (!heightString || typeof heightString !== 'string') {
        console.error(`Invalid height string: ${heightString}`);
        return null;
    }

    // Match the pattern for "X ft Y in" with flexible spaces
    const match = heightString.match(/(\d+)\s*ft\s*(\d+)?\s*in?/i);
    if (!match) {
        console.error(`Height string did not match expected pattern: ${heightString}`);
        return null;
    }

    const feet = parseInt(match[1], 10) || 0; // Extract feet
    const inches = parseInt(match[2], 10) || 0; // Extract inches (optional)

    const totalInches = feet * 12 + inches;
    
    if (isNaN(totalInches) || totalInches <= 0) {
        console.error(`Invalid height after parsing: ${totalInches} inches`);
        return null;
    }

    return totalInches; // Return total inches
}

