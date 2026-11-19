/**
 * SystemLog Model
 * Represents immutable audit and security logs (SRS §11.7, §13.9, FR-051, NFR-031, UC-014)
 */

class SystemLog {
  constructor(data) {
    this.logId = data.logId;
    this.userId = data.userId || 'SYSTEM';
    this.userEmail = data.userEmail || 'system@lnmiit.ac.in';
    this.action = data.action; // 'USER_CREATED', 'ROLE_CHANGE', 'STATUS_CHANGE', 'PASSWORD_RESET', 'CONFIG_UPDATE', 'TRANSCRIPT_IMPORT', 'EXCEPTION_DECISION', etc.
    this.entityType = data.entityType || 'SYSTEM'; // 'User', 'Student', 'Catalog', 'ExceptionRequest', 'TransferCredit', 'SystemConfig'
    this.entityId = data.entityId || null;
    this.details = typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || '');
    this.ipAddress = data.ipAddress || '127.0.0.1';
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  toJSON() {
    return {
      logId: this.logId,
      userId: this.userId,
      userEmail: this.userEmail,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      details: this.details,
      ipAddress: this.ipAddress,
      timestamp: this.timestamp
    };
  }
}

module.exports = SystemLog;
