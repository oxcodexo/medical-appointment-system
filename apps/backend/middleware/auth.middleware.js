const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

const verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({
      message: 'No token provided!'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    
    // Get user from database to get the role
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }
    
    // Set user role in request object
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized!'
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }
    
    if (user.role === 'admin') {
      next();
      return;
    }
    
    res.status(403).json({
      message: 'Require Admin Role!'
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Something went wrong!'
    });
  }
};

const isDoctor = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }
    
    if (user.role === 'doctor' || user.role === 'admin') {
      next();
      return;
    }
    
    res.status(403).json({
      message: 'Require Doctor Role!'
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Something went wrong!'
    });
  }
};

const isResponsable = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }
    
    if (user.role === 'responsable' || user.role === 'doctor' || user.role === 'admin') {
      next();
      return;
    }
    
    res.status(403).json({
      message: 'Require Responsable Role!'
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Something went wrong!'
    });
  }
};

const authMiddleware = {
  verifyToken,
  isAdmin,
  isDoctor,
  isResponsable
};

module.exports = authMiddleware;
