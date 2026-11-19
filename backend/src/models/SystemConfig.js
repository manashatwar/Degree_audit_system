/**
 * SystemConfig Model
 * Represents system-wide institutional configuration (SRS §11.7, §13.9, FR-050)
 */

class SystemConfig {
  constructor(data) {
    this.configId = data.configId || 'CFG-001';
    this.academicYear = data.academicYear || '2026-27';
    this.currentSemester = data.currentSemester || 'Odd Semester (2026)';
    this.defaultCatalogYear = data.defaultCatalogYear || '2024';
    this.atRiskCgpaThreshold = Number(data.atRiskCgpaThreshold) || 5.0;
    this.maxCreditsPerSemester = Number(data.maxCreditsPerSemester) || 26.0;
    this.maintenanceMode = Boolean(data.maintenanceMode);
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.updatedBy = data.updatedBy || 'admin@lnmiit.ac.in';
  }

  toJSON() {
    return {
      configId: this.configId,
      academicYear: this.academicYear,
      currentSemester: this.currentSemester,
      defaultCatalogYear: this.defaultCatalogYear,
      atRiskCgpaThreshold: this.atRiskCgpaThreshold,
      maxCreditsPerSemester: this.maxCreditsPerSemester,
      maintenanceMode: this.maintenanceMode,
      updatedAt: this.updatedAt,
      updatedBy: this.updatedBy
    };
  }
}

module.exports = SystemConfig;
