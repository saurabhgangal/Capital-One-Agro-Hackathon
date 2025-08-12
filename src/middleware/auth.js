const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                error: 'TOKEN_MISSING'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
                error: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.',
                error: 'ACCOUNT_DEACTIVATED'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
                error: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
                error: 'TOKEN_EXPIRED'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: 'INTERNAL_ERROR'
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
                req.token = token;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional routes
        next();
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, async () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.',
                    error: 'ADMIN_ACCESS_REQUIRED'
                });
            }
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    auth,
    optionalAuth,
    adminAuth
};
