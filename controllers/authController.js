

const { User } = require('../models'); // Import Sequelize User model

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID, // Mobile App Client ID
    });
    const payload = ticket.getPayload(); // Contains user info
    return {
        googleId: payload.sub,
        email: payload.email,
        displayName: payload.name,
        avatarUrl: payload.picture,
    };
}

// /api/auth/google
exports.loginGoogle = async (req,res) => {
    const { idToken, gender, height, dateOfBirth} = req.body;

    try {
        const googleUser = await verifyGoogleToken(idToken);

        // Find or create user in your database
        let user = await User.findOne({ where: { provider: 'google', provider_id: googleUser.googleId } });
        if (!user) {
            // parse height from string to float first
            const parsedHeight = parseHeightString(height);

            user = await User.create({
                email: googleUser.email,
                provider: 'google',
                provider_id: googleUser.googleId,
                display_name: googleUser.displayName,
                gender,
                height: parsedHeight, // Store the parsed float value
                dateOfBirth
            });
        } else {
            // If user exists but gender or height is missing, update them
            if (!user.gender || !user.height) {
                user.gender = user.gender || gender;
                user.height = user.height || parsedHeight;
                user.dateOfBirth = user.dateOfBirth || dateOfBirth;
                await user.save();
            }
        }

        // Generate a session token (e.g., JWT)
        const jwtToken = generateJwtToken(user);
        return res.json({ userId: user.id, token: jwtToken, success: true});
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Invalid Google token', success: false });
    }
};

// /api/auth/apple
exports.loginApple = async (req,res) => {
    const { providerId, email, username, gender, height, dateOfBirth } = req.body;

    try {
        // Check if user exists in the database
        let user = await User.findOne({ where: { provider: 'apple', provider_id: providerId } });
        if (!user) {
            // parse height from string to float first
            const parsedHeight = parseHeightString(height);

            // create new user and add to database
            user = await User.create({
                email: email,
                provider: 'apple',
                provider_id: providerId,
                display_name: username,
                gender,
                height: parsedHeight, // Store the parsed float value
                dateOfBirth
            });
        } else {
            // If user exists but gender or height is missing, update them (LOGIN)
            if (!user.gender || !user.height) {
                user.gender = user.gender || gender;
                user.height = user.height || parsedHeight;
                user.dateOfBirth = user.dateOfBirth || dateOfBirth;
                await user.save();
            }
        }

        // Generate a session token (e.g., JWT)
        const jwtToken = generateJwtToken(user);

        return res.json({ userId: user.id, token: jwtToken, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};

function generateJwtToken(user) {
    const jwt = require('jsonwebtoken');

    // Ensure the secret key exists
    const secret = process.env.JWT_SECRET; // Use a meaningful environment variable
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Generate JWT token
    return jwt.sign(
        {
            id: user.id,         
            provider: user.provider, // OAuth provider ('google', 'apple')
            email: user.email,    
            dateOfBirth: user.dateOfBirth, 
            height: user.height,           
            gender: user.gender  
        },
        secret,                    // Use secret key from environment variables
        { expiresIn: '1d' }        // Token expires in 1 day
    );
}

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