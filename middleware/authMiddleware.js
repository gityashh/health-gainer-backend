const jwt = require('jsonwebtoken');
require('dotenv').config();

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
        console.log('Token received:', token);

        // Remove extra double quotes if present
        if (token && token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }

        if (!token) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const decoded = jwt.decode(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token format." });
        }

        const verified = await jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ message: "Invalid token." });
        }

        req.id = verified.id;
        next();
    } catch (error) {
        console.log('JWT Error:', error);
        return res.status(401).json({ message: "Authentication failed." });
    }
};

module.exports = isAuthenticated;