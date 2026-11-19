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

    if (user.accountStatus === 'Suspended' || user.accountStatus === 'Inactive') {
      throw new Error(`Your account has been ${user.accountStatus.toLowerCase()} by the System Administrator.`);
    }

    // Update last login
    storageService.update('users', 'userId', user.userId, {
      lastLogin: new Date().toISOString()
    });

    // Log login event
    storageService.logActivity(user.userId, user.email, 'USER_LOGIN', `User ${user.email} authenticated successfully.`, 'User', user.userId);

    // Get role-specific data
    let roleData = null;
    if (user.role === 'Student') {
      roleData = storageService.findStudentByUserId(user.userId);
    } else if (user.role === 'FacultyAdvisor') {
      roleData = storageService.findAdvisorByUserId(user.userId);
    } else if (user.role === 'RegistrarStaff') {
      roleData = storageService.findRegistrarByUserId(user.userId);
    } else if (user.role === 'Dean') {
      roleData = storageService.findDeanByUserId(user.userId);
    } else if (user.role === 'AdmissionCell') {
      roleData = storageService.findAdmissionOfficerByUserId(user.userId) || {
        name: 'Dr. Kavita Verma',
        department: 'Admission Cell',
        designation: 'Head, Admission Cell'
      };
    } else if (user.role === 'SystemAdmin' || user.role === 'Admin') {
      roleData = {
        name: user.name || 'System Administrator',
        department: 'Center for Computing and Information Technology (CCIT)',
        designation: 'Senior System Administrator'
      };
    } else if (user.role === 'SystemAdmin' || user.role === 'Admin') {
      roleData = {
        name: user.name || 'System Administrator',
        department: 'Center for Computing and Information Technology (CCIT)',
        designation: 'Senior System Administrator'
      };
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
    } else if (user.role === 'Dean') {
      roleData = storageService.findDeanByUserId(user.userId);
    } else if (user.role === 'AdmissionCell') {
      roleData = storageService.findAdmissionOfficerByUserId(user.userId) || {
        name: 'Dr. Kavita Verma',
        department: 'Admission Cell',
        designation: 'Head, Admission Cell'
      };
    } else if (user.role === 'SystemAdmin' || user.role === 'Admin') {
      roleData = {
        name: user.name || 'System Administrator',
        department: 'Center for Computing and Information Technology (CCIT)',
        designation: 'Senior System Administrator'
      };
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
