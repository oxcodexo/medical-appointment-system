const db = require('../models');
const User = db.user;
const UserProfile = db.userProfile;

// Get all users
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving users.'
    });
  }
};

// Get user by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [UserProfile]
    });
    
    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} was not found.`
      });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving User with id=${id}`
    });
  }
};

// Update user
exports.update = async (req, res) => {
  const id = req.params.id;
  
  // Check if the user is updating their own profile or is an admin
  if (parseInt(id) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'You can only update your own profile!'
    });
  }

  try {
    // Don't allow role updates unless admin
    if (req.body.role && req.userRole !== 'admin') {
      delete req.body.role;
    }
    
    // Don't update password through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    const num = await User.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'User was updated successfully.'
      });
    } else {
      res.status(404).json({
        message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating User with id=${id}`
    });
  }
};

// Delete user
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await User.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'User was deleted successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot delete User with id=${id}. Maybe User was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Could not delete User with id=${id}`
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    const profile = await UserProfile.findOne({
      where: { userId: userId }
    });
    
    if (!profile) {
      return res.status(404).json({
        message: `Profile for user with id=${userId} was not found.`
      });
    }
    
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving profile for user with id=${userId}`
    });
  }
};

// Create or update user profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.userId;
  
  // Check if the user is updating their own profile or is an admin
  if (parseInt(userId) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'You can only update your own profile!'
    });
  }

  try {
    // Check if profile exists
    let profile = await UserProfile.findOne({
      where: { userId: userId }
    });
    
    if (!profile) {
      // Create new profile
      profile = await UserProfile.create({
        userId: userId,
        ...req.body
      });
      
      res.status(201).json({
        message: 'Profile created successfully!',
        profile: profile
      });
    } else {
      // Update existing profile
      await profile.update(req.body);
      
      res.status(200).json({
        message: 'Profile updated successfully!',
        profile: profile
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating profile for user with id=${userId}`
    });
  }
};
