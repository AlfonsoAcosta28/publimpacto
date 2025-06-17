const checkAdminOrigin = (req, res, next) => {
    const origin = req.get('origin') || req.get('host');
    
    if (origin === 'http://localhost:3001') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Access denied. This endpoint can only be accessed from the admin panel.' 
        });
    }
};

module.exports = { checkAdminOrigin };