const jwt = require('jsonwebtoken');
const models = require('../models');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.error('No Authorization header found.');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.error('Invalid token format.');
        return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Adjust field to match your database schema
        const user = await models.User.findByPk(decoded.id);
        console.log('Queried User:', user);

        if (!user) {
            console.error(`User with ID ${decoded.id} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error);
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('JWT Verification Error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;