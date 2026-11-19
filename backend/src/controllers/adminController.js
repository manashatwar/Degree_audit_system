/**
 * System Administrator Controller
 * Implements SRS §11.7, §13.9, FR-048, FR-004, FR-049, FR-050, FR-051, UC-014
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const storageService = require('../services/storageService');
const User = require('../models/User');
const Student = require('../models/Student');
const FacultyAdvisor = require('../models/FacultyAdvisor');
const SystemConfig = require('../models/SystemConfig');

class AdminController {
  // GET /api/admin/stats
  async getStats(req, res, next) {
    try {
      const users = storageService.findAll('users') || [];
      const logs = storageService.findAll('systemLogs') || [];
      const config = (storageService.findAll('systemConfig') || [])[0] || new SystemConfig({});

      const roleBreakdown = {
        Student: users.filter(u => u.role === 'Student').length,
        FacultyAdvisor: users.filter(u => u.role === 'FacultyAdvisor').length,
        RegistrarStaff: users.filter(u => u.role === 'RegistrarStaff').length,
        Dean: users.filter(u => u.role === 'Dean').length,
        AdmissionCell: users.filter(u => u.role === 'AdmissionCell').length,
        SystemAdmin: users.filter(u => u.role === 'SystemAdmin' || u.role === 'Admin').length
      };

      const activeUsers = users.filter(u => (u.accountStatus || 'Active') === 'Active').length;
      const suspendedUsers = users.filter(u => u.accountStatus === 'Suspended').length;

      res.json({
        success: true,
        data: {
          totalUsers: users.length,
          activeUsers,
          suspendedUsers,
          roleBreakdown,
          totalLogs: logs.length,
          systemConfig: config
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/users
  async getAllUsers(req, res, next) {
    try {
      const users = storageService.findAll('users') || [];
      const students = storageService.findAll('students') || [];
      const advisors = storageService.findAll('facultyAdvisors') || [];
      const registrars = storageService.findAll('registrarStaff') || [];
      const deans = storageService.findAll('deans') || [];
      const admissionStaff = storageService.findAll('admissionStaff') || [];

      const enriched = users.map(u => {
        let profile = null;
        if (u.role === 'Student') {
          profile = students.find(s => s.userId === u.userId);
        } else if (u.role === 'FacultyAdvisor') {
          profile = advisors.find(a => a.userId === u.userId);
        } else if (u.role === 'RegistrarStaff') {
          profile = registrars.find(r => r.userId === u.userId);
        } else if (u.role === 'Dean') {
          profile = deans.find(d => d.userId === u.userId);
        } else if (u.role === 'AdmissionCell') {
          profile = admissionStaff.find(a => a.userId === u.userId);
        }

        return {
          userId: u.userId,
          email: u.email,
          role: u.role,
          name: profile ? profile.name : (u.name || (u.role === 'SystemAdmin' ? 'System Administrator' : 'Staff')),
          department: profile ? profile.department : (u.department || 'Administration'),
          accountStatus: u.accountStatus || 'Active',
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
          identifier: profile ? (profile.studentId || profile.advisorId || profile.registrarId || profile.deanId) : null
        };
      });

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/users
  async createUser(req, res, next) {
    try {
      const { email, password, role, name, department, identifier } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
      }

      const existing = storageService.findUserByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'A user with this email address already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `U${String(Math.floor(1000 + Math.random() * 9000))}`;

      const newUser = new User({
        userId,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        name: name ? name.trim() : null,
        department: department ? department.trim() : null,
        accountStatus: 'Active',
        createdAt: new Date().toISOString()
      });

      storageService.create('users', newUser);

      // Create linked entity if needed
      if (role === 'Student') {
        const studentId = (identifier || email.split('@')[0]).toUpperCase();
        const newStudent = new Student({
          studentId,
          userId,
          name: name ? name.trim() : studentId,
          email: email.trim().toLowerCase(),
          batchYear: new Date().getFullYear(),
          catalogYear: String(new Date().getFullYear()),
          currentSemester: 1,
          department: department ? department.trim() : 'CSE',
          program: 'B.Tech CSE',
          status: 'Active'
        });
        storageService.create('students', newStudent);
      } else if (role === 'FacultyAdvisor') {
        const advisorId = identifier || `ADV${Math.floor(100 + Math.random() * 900)}`;
        const newAdvisor = new FacultyAdvisor({
          advisorId,
          userId,
          name: name ? name.trim() : 'Faculty Advisor',
          email: email.trim().toLowerCase(),
          department: department ? department.trim() : 'CSE'
        });
        storageService.create('facultyAdvisors', newAdvisor);
      }

      // Log activity
      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'USER_CREATED',
        `Created new ${role} account: ${email} (${name || 'N/A'})`,
        'User',
        userId
      );

      res.status(201).json({
        success: true,
        message: `User ${email} created successfully with role ${role}`,
        data: newUser.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/users/:id
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, department, role, accountStatus } = req.body;

      const user = storageService.findById('users', 'userId', id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updates = {};
      const changes = [];

      if (name !== undefined) {
        updates.name = name.trim();
        changes.push(`name to '${name}'`);
      }
      if (department !== undefined) {
        updates.department = department.trim();
        changes.push(`department to '${department}'`);
      }
      if (role && role !== user.role) {
        const oldRole = user.role;
        updates.role = role;
        changes.push(`role from '${oldRole}' to '${role}'`);
        storageService.logActivity(
          req.user.userId,
          req.user.email,
          'ROLE_CHANGE',
          `Modified role for user ${user.email} from ${oldRole} to ${role}`,
          'User',
          id
        );
      }
      if (accountStatus && ['Active', 'Suspended', 'Inactive'].includes(accountStatus)) {
        updates.accountStatus = accountStatus;
        changes.push(`status to '${accountStatus}'`);
      }

      const updated = storageService.update('users', 'userId', id, updates);

      // Also update linked student or advisor name/department if applicable
      if (user.role === 'Student') {
        const student = storageService.findStudentByUserId(id);
        if (student) {
          const sUpdates = {};
          if (name) sUpdates.name = name.trim();
          if (department) sUpdates.department = department.trim();
          storageService.update('students', 'studentId', student.studentId, sUpdates);
        }
      } else if (user.role === 'FacultyAdvisor') {
        const advisor = storageService.findAdvisorByUserId(id);
        if (advisor) {
          const aUpdates = {};
          if (name) aUpdates.name = name.trim();
          if (department) aUpdates.department = department.trim();
          storageService.update('facultyAdvisors', 'advisorId', advisor.advisorId, aUpdates);
        }
      }

      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'USER_UPDATED',
        `Updated user ${user.email}: ${changes.join(', ')}`,
        'User',
        id
      );

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/users/:id/status
  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { accountStatus } = req.body;

      if (!['Active', 'Suspended', 'Inactive'].includes(accountStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid accountStatus value' });
      }

      const user = storageService.findById('users', 'userId', id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.userId === req.user.userId && accountStatus === 'Suspended') {
        return res.status(400).json({ success: false, message: 'Cannot suspend your own administrator account' });
      }

      const updated = storageService.update('users', 'userId', id, { accountStatus });

      const action = accountStatus === 'Suspended' ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED';
      storageService.logActivity(
        req.user.userId,
        req.user.email,
        action,
        `Account ${user.email} marked as ${accountStatus}`,
        'User',
        id
      );

      res.json({
        success: true,
        message: `Account status updated to ${accountStatus}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/users/:id/reset-password
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = storageService.findById('users', 'userId', id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const targetPassword = newPassword && newPassword.trim() ? newPassword.trim() : 'password123';
      const hashedPassword = await bcrypt.hash(targetPassword, 10);

      storageService.update('users', 'userId', id, { password: hashedPassword });

      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'PASSWORD_RESET',
        `Password reset for user ${user.email}`,
        'User',
        id
      );

      res.json({
        success: true,
        message: `Password reset successfully for ${user.email}. Default password: ${targetPassword}`
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.user.userId) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
      }

      const user = storageService.findById('users', 'userId', id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      storageService.delete('users', 'userId', id);

      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'USER_DELETED',
        `Deleted user account ${user.email} (Role: ${user.role})`,
        'User',
        id
      );

      res.json({
        success: true,
        message: `User ${user.email} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/config
  async getConfig(req, res, next) {
    try {
      const configs = storageService.findAll('systemConfig') || [];
      const config = configs[0] || new SystemConfig({});

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/config
  async updateConfig(req, res, next) {
    try {
      const {
        academicYear,
        currentSemester,
        defaultCatalogYear,
        atRiskCgpaThreshold,
        maxCreditsPerSemester,
        maintenanceMode
      } = req.body;

      const configs = storageService.findAll('systemConfig') || [];
      const existing = configs[0] || new SystemConfig({});

      const updatedData = {
        configId: existing.configId || 'CFG-001',
        academicYear: academicYear || existing.academicYear,
        currentSemester: currentSemester || existing.currentSemester,
        defaultCatalogYear: defaultCatalogYear || existing.defaultCatalogYear,
        atRiskCgpaThreshold: atRiskCgpaThreshold !== undefined ? Number(atRiskCgpaThreshold) : existing.atRiskCgpaThreshold,
        maxCreditsPerSemester: maxCreditsPerSemester !== undefined ? Number(maxCreditsPerSemester) : existing.maxCreditsPerSemester,
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : existing.maintenanceMode,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.email
      };

      if (configs.length === 0) {
        storageService.create('systemConfig', updatedData);
      } else {
        storageService.update('systemConfig', 'configId', existing.configId, updatedData);
      }

      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'CONFIG_UPDATE',
        `System configuration updated: Session ${updatedData.academicYear} ${updatedData.currentSemester}, Maintenance Mode: ${updatedData.maintenanceMode}`,
        'SystemConfig',
        existing.configId
      );

      res.json({
        success: true,
        message: 'System configuration updated successfully',
        data: updatedData
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/logs
  async getLogs(req, res, next) {
    try {
      const logs = storageService.findAll('systemLogs') || [];
      const { action, search, limit } = req.query;

      let filtered = [...logs];

      if (action && action !== 'ALL') {
        filtered = filtered.filter(l => l.action === action);
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(l => 
          (l.userEmail && l.userEmail.toLowerCase().includes(s)) ||
          (l.action && l.action.toLowerCase().includes(s)) ||
          (l.details && l.details.toLowerCase().includes(s)) ||
          (l.entityType && l.entityType.toLowerCase().includes(s))
        );
      }

      const maxLimit = Number(limit) || 100;
      const paged = filtered.slice(0, maxLimit);

      res.json({
        success: true,
        data: paged,
        total: filtered.length
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/bulk-import
  async bulkImport(req, res, next) {
    try {
      const { type, records } = req.body; // type: 'students' | 'courses'

      if (!type || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'Valid type and non-empty records array are required' });
      }

      let importedCount = 0;

      if (type === 'students') {
        for (const row of records) {
          if (!row.studentId || !row.email) continue;
          const existing = storageService.findById('students', 'studentId', row.studentId);
          if (!existing) {
            const student = new Student({
              studentId: row.studentId.toUpperCase(),
              userId: `U${Math.floor(1000 + Math.random() * 9000)}`,
              name: row.name || row.studentId,
              email: row.email.toLowerCase(),
              batchYear: Number(row.batchYear) || 2024,
              catalogYear: String(row.catalogYear || '2024'),
              currentSemester: Number(row.currentSemester) || 1,
              department: row.department || 'CSE',
              program: row.program || 'B.Tech CSE',
              status: 'Active'
            });
            storageService.create('students', student);
            importedCount++;
          }
        }
      }

      storageService.logActivity(
        req.user.userId,
        req.user.email,
        'BULK_IMPORT',
        `Bulk imported ${importedCount} ${type} records.`,
        type === 'students' ? 'Student' : 'Course'
      );

      res.json({
        success: true,
        message: `Successfully processed bulk import. ${importedCount} new records added.`,
        data: { importedCount }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
