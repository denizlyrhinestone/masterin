const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided or token is not Bearer type.' });
  }

  const token = authHeader.split(' ')[1]; // Get token from 'Bearer <token>'

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined for token verification. Check your .env file.");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET missing." });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user; // Add user payload to request object (e.g., id, email, role)
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Failed to authenticate token.' });
  }
};

// Middleware to check user role
// rolesArray: an array of roles that are allowed to access the route
const checkRole = (rolesArray) => {
  return (req, res, next) => {
    // verifyToken middleware should have already run and set req.user
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. User role not found.' });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. User role '${req.user.role}' is not authorized for this resource.`
      });
    }
    next(); // User has the required role
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
