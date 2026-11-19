/**
 * Dean Model
 */
class Dean {
  constructor(data) {
    this.deanId = data.deanId;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email;
    this.department = data.department || 'Academic Affairs';
  }
}

module.exports = Dean;
