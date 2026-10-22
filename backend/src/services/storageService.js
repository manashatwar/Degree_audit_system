/**
 * Storage Service
 * Handles data persistence using in-memory storage (simulating localStorage)
 * In production, this would be replaced with database operations
 */

class StorageService {
  constructor() {
    this.storage = {
      users: [],
      students: [],
      facultyAdvisors: [],
      registrarStaff: [],
      courses: [],
      transcripts: [],
      catalogs: [],
      requirements: [],
      auditReports: [],
      advisorAssignments: [],
      atRiskAssessments: [],
      transcriptImports: []
    };
  }

  // Generic CRUD operations
  create(collection, data) {
    this.storage[collection].push(data);
    return data;
  }

  findAll(collection) {
    return this.storage[collection];
  }

  findById(collection, idField, id) {
    return this.storage[collection].find(item => item[idField] === id);
  }

  findBy(collection, criteria) {
    return this.storage[collection].filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  update(collection, idField, id, data) {
    const index = this.storage[collection].findIndex(item => item[idField] === id);
    if (index !== -1) {
      this.storage[collection][index] = { ...this.storage[collection][index], ...data };
      return this.storage[collection][index];
    }
    return null;
  }

  delete(collection, idField, id) {
    const index = this.storage[collection].findIndex(item => item[idField] === id);
    if (index !== -1) {
      this.storage[collection].splice(index, 1);
      return true;
    }
    return false;
  }

  // Specific methods for common operations
  findUserByEmail(email) {
    return this.storage.users.find(user => user.email === email);
  }

  findStudentByUserId(userId) {
    return this.storage.students.find(student => student.userId === userId);
  }

  findAdvisorByUserId(userId) {
    return this.storage.facultyAdvisors.find(advisor => advisor.userId === userId);
  }

  findRegistrarByUserId(userId) {
    return this.storage.registrarStaff.find(registrar => registrar.userId === userId);
  }

  findTranscriptsByStudentId(studentId) {
    return this.storage.transcripts.filter(transcript => transcript.studentId === studentId);
  }

  findCatalogByYear(catalogYear) {
    return this.storage.catalogs.find(catalog => catalog.catalogYear === catalogYear);
  }

  findRequirementsByCatalogId(catalogId) {
    return this.storage.requirements.filter(req => req.catalogId === catalogId);
  }

  findAdviseesByAdvisorId(advisorId) {
    const assignments = this.storage.advisorAssignments.filter(
      assignment => assignment.advisorId === advisorId && assignment.status === 'Active'
    );
    return assignments.map(assignment => {
      const student = this.findById('students', 'studentId', assignment.studentId);
      return student;
    }).filter(Boolean);
  }

  findLatestAuditByStudentId(studentId) {
    const audits = this.storage.auditReports
      .filter(audit => audit.studentId === studentId)
      .sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
    return audits[0] || null;
  }

  // Clear all data (for testing)
  clearAll() {
    Object.keys(this.storage).forEach(key => {
      this.storage[key] = [];
    });
  }

  // Get storage stats
  getStats() {
    const stats = {};
    Object.keys(this.storage).forEach(key => {
      stats[key] = this.storage[key].length;
    });
    return stats;
  }
}

// Create singleton instance
const storageService = new StorageService();

module.exports = storageService;
