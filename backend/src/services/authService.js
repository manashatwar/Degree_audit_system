/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */

const bcrypt = require('bcryptjs');
const storageService = require('./storageService');
const { generateToken } = require('../utils/jwtUtils');

class AuthService {
  async login(email, password) {
    // Find user by email
    const user = storageService.findUserByEmail(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    storageService.update('users', 'userId', user.userId, {
      lastLogin: new Date().toISOString()
    });

    // Get role-specific data
    let roleData = null;
    if (user.role === 'Student') {
      roleData = storageService.findStudentByUserId(user.userId);
    } else if (user.role === 'FacultyAdvisor') {
      roleData = storageService.findAdvisorByUserId(user.userId);
    } else if (user.role === 'RegistrarStaff') {
      roleData = storageService.findRegistrarByUserId(user.userId);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      roleId: roleData ? (roleData.studentId || roleData.advisorId || roleData.registrarId) : null
    });

    return {
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        ...roleData
      }
    };
  }

  async getCurrentUser(userId) {
    const user = storageService.findById('users', 'userId', userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    let roleData = null;
    if (user.role === 'Student') {
      roleData = storageService.findStudentByUserId(user.userId);
    } else if (user.role === 'FacultyAdvisor') {
      roleData = storageService.findAdvisorByUserId(user.userId);
    } else if (user.role === 'RegistrarStaff') {
      roleData = storageService.findRegistrarByUserId(user.userId);
    }

    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      lastLogin: user.lastLogin,
      ...roleData
    };
  }
}

module.exports = new AuthService();
