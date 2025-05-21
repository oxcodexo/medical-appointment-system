const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use!' });
    }

    // Create new user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      role: req.body.role || 'patient',
      phone: req.body.phone,
      address: req.body.address
    });

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: token
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while registering the user.'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email: req.body.email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid password!',
        token: null
      });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: token
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while logging in.'
    });
  }
};

// Get current user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving user profile.'
    });
  }
};
