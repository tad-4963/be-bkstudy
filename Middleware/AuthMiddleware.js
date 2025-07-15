import jwt from 'jsonwebtoken';

// Middleware to verify access token
export const authMiddleware = (req, res, next) => {  
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header must start with "Bearer "' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing from Authorization header' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to identify user
export const identifyUserMiddleware = (req, res, next) => {
    if(!req.headers.authorization){
        req.user = null;
        return next();
    }
          
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            req.user = null;
        }
    
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
    } catch (err) {
        req.user = null;
    }
    finally {
        next();
    }
};
