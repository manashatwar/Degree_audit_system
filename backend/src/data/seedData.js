/**
 * Seed Data
 * Initializes system with sample data for testing
 */

const bcrypt = require('bcryptjs');
const storageService = require('../services/storageService');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Student = require('../models/Student');
const FacultyAdvisor = require('../models/FacultyAdvisor');
const RegistrarStaff = require('../models/RegistrarStaff');
const Course = require('../models/Course');
const Transcript = require('../models/Transcript');
const Catalog = require('../models/Catalog');
const Requirement = require('../models/Requirement');
const AdvisorAssignment = require('../models/AdvisorAssignment');

async function seedDatabase() {
  console.log('Seeding database with sample data...');

  // Clear existing data
  storageService.clearAll();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users (with LNMIIT-style emails)
  const users = [
    // Students - CSE Department
    { userId: 'U001', email: '24ucs101@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U002', email: '24ucs102@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U003', email: '23ucs048@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    // NEW: Good performing CSE students
    { userId: 'U013', email: '23ucs101@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U014', email: '24ucs103@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U015', email: '24ucs104@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    // Students - CCE Department
    { userId: 'U004', email: '24ucc175@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U005', email: '24ucc176@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    // Students - ECE Department
    { userId: 'U006', email: '24uec048@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    { userId: 'U007', email: '23uec091@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    // At-risk student
    { userId: 'U008', email: '23ucs075@lnmiit.ac.in', password: hashedPassword, role: 'Student' },
    // Faculty Advisors
    { userId: 'U009', email: 'dr.sharma@lnmiit.ac.in', password: hashedPassword, role: 'FacultyAdvisor' },
    { userId: 'U010', email: 'dr.patel@lnmiit.ac.in', password: hashedPassword, role: 'FacultyAdvisor' },
    { userId: 'U011', email: 'dr.gupta@lnmiit.ac.in', password: hashedPassword, role: 'FacultyAdvisor' },
    // Registrar
    { userId: 'U012', email: 'registrar@lnmiit.ac.in', password: hashedPassword, role: 'RegistrarStaff' }
  ];

  users.forEach(userData => {
    const user = new User(userData);
    storageService.create('users', user);
  });

  // 2. Create Students (department/program auto-detected from studentId)
  const students = [
    // CSE Students - Batch 2024 (auto-detected from 24UCS)
    { studentId: '24UCS101', userId: 'U001', name: 'Rohan Mehta', email: '24ucs101@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    { studentId: '24UCS102', userId: 'U002', name: 'Priya Sharma', email: '24ucs102@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    // NEW: Good performing CSE students
    { studentId: '23UCS101', userId: 'U013', name: 'Arjun Verma', email: '23ucs101@lnmiit.ac.in', currentSemester: 5, status: 'Active' },
    { studentId: '24UCS103', userId: 'U014', name: 'Ananya Reddy', email: '24ucs103@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    { studentId: '24UCS104', userId: 'U015', name: 'Karan Malhotra', email: '24ucs104@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    // CSE Student - Batch 2023 (auto-detected from 23UCS)
    { studentId: '23UCS048', userId: 'U003', name: 'Amit Kumar', email: '23ucs048@lnmiit.ac.in', currentSemester: 5, status: 'Active' },
    // CCE Students - Batch 2024 (auto-detected from 24UCC)
    { studentId: '24UCC175', userId: 'U004', name: 'Hatwar Manas', email: '24ucc175@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    { studentId: '24UCC176', userId: 'U005', name: 'Dhruv Gupta', email: '24ucc176@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    // ECE Students (auto-detected)
    { studentId: '24UEC048', userId: 'U006', name: 'Neha Singh', email: '24uec048@lnmiit.ac.in', currentSemester: 3, status: 'Active' },
    { studentId: '23UEC091', userId: 'U007', name: 'Rahul Gupta', email: '23uec091@lnmiit.ac.in', currentSemester: 5, status: 'Active' },
    // At-risk CSE Student
    { studentId: '23UCS075', userId: 'U008', name: 'Vikram Patel', email: '23ucs075@lnmiit.ac.in', currentSemester: 5, status: 'Active' }
  ];

  students.forEach(studentData => {
    const student = new Student(studentData);
    console.log(`Created student: ${student.studentId} | Batch: ${student.batchYear} | Dept: ${student.department} | Program: ${student.program}`);
    storageService.create('students', student);
  });

  // 3. Create Faculty Advisors
  const advisors = [
    { advisorId: 'A001', userId: 'U009', name: 'Dr. Rajesh Sharma', department: 'CSE', email: 'dr.sharma@lnmiit.ac.in' },
    { advisorId: 'A002', userId: 'U010', name: 'Dr. Meena Patel', department: 'ECE', email: 'dr.patel@lnmiit.ac.in' },
    { advisorId: 'A003', userId: 'U011', name: 'Dr. Amit Gupta', department: 'CCE', email: 'dr.gupta@lnmiit.ac.in' }
  ];

  advisors.forEach(advisorData => {
    const advisor = new FacultyAdvisor(advisorData);
    storageService.create('facultyAdvisors', advisor);
  });

  // 4. Create Registrar Staff
  const registrars = [
    { registrarId: 'R001', userId: 'U012', name: 'Arika Verma', department: 'Academic Section', email: 'registrar@lnmiit.ac.in' }
  ];

  registrars.forEach(registrarData => {
    const registrar = new RegistrarStaff(registrarData);
    storageService.create('registrarStaff', registrar);
  });

  // 5. Create Courses with Semester Mapping
  const courses = [
    // === SEMESTER 1 COURSES ===
    // Core CSE/CCE/ECE - Semester 1
    { courseCode: 'CS101', courseName: 'Programming for Problem Solving', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 1 },
    { courseCode: 'MA101', courseName: 'Mathematics I (Calculus)', department: 'Mathematics', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 1 },
    { courseCode: 'PH101', courseName: 'Physics I (Mechanics)', department: 'Physics', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 1 },
    { courseCode: 'CH101', courseName: 'Chemistry', department: 'Chemistry', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 1 },
    { courseCode: 'HS101', courseName: 'English Communication Skills', department: 'Humanities', credits: 2, courseType: 'Mandatory', prerequisites: [], suggestedSemester: 1 },
    
    // === SEMESTER 2 COURSES ===
    { courseCode: 'CS102', courseName: 'Data Structures', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS101'], suggestedSemester: 2 },
    { courseCode: 'MA102', courseName: 'Mathematics II (Linear Algebra)', department: 'Mathematics', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 2 },
    { courseCode: 'PH102', courseName: 'Physics II (Electricity & Magnetism)', department: 'Physics', credits: 4, courseType: 'Core', prerequisites: ['PH101'], suggestedSemester: 2 },
    { courseCode: 'EE101', courseName: 'Basic Electronics', department: 'ECE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 2 },
    { courseCode: 'HS102', courseName: 'Professional Communication', department: 'Humanities', credits: 2, courseType: 'Mandatory', prerequisites: ['HS101'], suggestedSemester: 2 },
    
    // === SEMESTER 3 COURSES ===
    // CSE Specific
    { courseCode: 'CS201', courseName: 'Design and Analysis of Algorithms', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS102'], suggestedSemester: 3 },
    { courseCode: 'CS202', courseName: 'Computer Organization', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 3 },
    { courseCode: 'CS203', courseName: 'Discrete Mathematics', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 3 },
    { courseCode: 'MA201', courseName: 'Probability and Statistics', department: 'Mathematics', credits: 4, courseType: 'Core', prerequisites: ['MA101'], suggestedSemester: 3 },
    
    // CCE Specific - Semester 3
    { courseCode: 'CC201', courseName: 'Digital Logic Design', department: 'CCE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 3 },
    { courseCode: 'CC202', courseName: 'Signals and Systems', department: 'CCE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 3 },
    
    // ECE Specific - Semester 3
    { courseCode: 'EC201', courseName: 'Electronic Devices and Circuits', department: 'ECE', credits: 4, courseType: 'Core', prerequisites: ['EE101'], suggestedSemester: 3 },
    { courseCode: 'EC202', courseName: 'Network Theory', department: 'ECE', credits: 4, courseType: 'Core', prerequisites: [], suggestedSemester: 3 },
    
    // === SEMESTER 4 COURSES ===
    { courseCode: 'CS301', courseName: 'Database Management Systems', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS102'], suggestedSemester: 4 },
    { courseCode: 'CS302', courseName: 'Operating Systems', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS202'], suggestedSemester: 4 },
    { courseCode: 'CS303', courseName: 'Theory of Computation', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS203'], suggestedSemester: 4 },
    { courseCode: 'CS304', courseName: 'Object Oriented Programming', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS101'], suggestedSemester: 4 },
    { courseCode: 'HS301', courseName: 'Engineering Economics', department: 'Humanities', credits: 3, courseType: 'Mandatory', prerequisites: [], suggestedSemester: 4 },
    
    // === SEMESTER 5 COURSES ===
    { courseCode: 'CS401', courseName: 'Computer Networks', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS302'], suggestedSemester: 5 },
    { courseCode: 'CS402', courseName: 'Software Engineering', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS301'], suggestedSemester: 5 },
    { courseCode: 'CS403', courseName: 'Compiler Design', department: 'CSE', credits: 4, courseType: 'Core', prerequisites: ['CS303'], suggestedSemester: 5 },
    
    // === SEMESTER 6 COURSES ===
    { courseCode: 'CS501', courseName: 'Artificial Intelligence', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS201'], suggestedSemester: 6 },
    { courseCode: 'CS502', courseName: 'Machine Learning', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS201', 'MA201'], suggestedSemester: 6 },
    { courseCode: 'CS503', courseName: 'Computer Graphics', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS202'], suggestedSemester: 6 },
    { courseCode: 'CS504', courseName: 'Cryptography and Network Security', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS401'], suggestedSemester: 6 },
    
    // === SEMESTER 7 COURSES ===
    { courseCode: 'CS601', courseName: 'Cloud Computing', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS401'], suggestedSemester: 7 },
    { courseCode: 'CS602', courseName: 'Big Data Analytics', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS301'], suggestedSemester: 7 },
    { courseCode: 'CS603', courseName: 'Internet of Things', department: 'CSE', credits: 4, courseType: 'Elective', prerequisites: ['CS401'], suggestedSemester: 7 },
    
    // === OPEN ELECTIVES (Any Semester 5+) ===
    { courseCode: 'OE101', courseName: 'Web Technologies', department: 'CSE', credits: 3, courseType: 'Open Elective', prerequisites: [], suggestedSemester: 5 },
    { courseCode: 'OE102', courseName: 'Mobile Application Development', department: 'CSE', credits: 3, courseType: 'Open Elective', prerequisites: ['CS101'], suggestedSemester: 5 },
    { courseCode: 'OE103', courseName: 'Data Visualization', department: 'CSE', credits: 3, courseType: 'Open Elective', prerequisites: [], suggestedSemester: 5 },
    
    // === HUMANITIES & MANAGEMENT ===
    { courseCode: 'HS201', courseName: 'Technical Writing', department: 'Humanities', credits: 2, courseType: 'Mandatory', prerequisites: ['HS102'], suggestedSemester: 3 },
    { courseCode: 'HS301', courseName: 'Engineering Economics', department: 'Humanities', credits: 3, courseType: 'Core', prerequisites: [], suggestedSemester: 5 },
    { courseCode: 'HS401', courseName: 'Entrepreneurship', department: 'Humanities', credits: 2, courseType: 'Elective', prerequisites: [], suggestedSemester: 7 }
  ];

  courses.forEach(courseData => {
    const course = new Course(courseData);
    storageService.create('courses', course);
  });

  // 6. Create Catalogs for all departments
  const catalogs = [
    // CSE Catalogs
    { catalogId: 'CAT-2024-CSE', catalogYear: '2024', program: 'B.Tech CSE', department: 'CSE', effectiveDate: '2024-08-01', totalCreditsRequired: 160 },
    { catalogId: 'CAT-2023-CSE', catalogYear: '2023', program: 'B.Tech CSE', department: 'CSE', effectiveDate: '2023-08-01', totalCreditsRequired: 160 },
    
    // CCE Catalogs
    { catalogId: 'CAT-2024-CCE', catalogYear: '2024', program: 'B.Tech CCE', department: 'CCE', effectiveDate: '2024-08-01', totalCreditsRequired: 160 },
    { catalogId: 'CAT-2023-CCE', catalogYear: '2023', program: 'B.Tech CCE', department: 'CCE', effectiveDate: '2023-08-01', totalCreditsRequired: 160 },
    
    // ECE Catalogs
    { catalogId: 'CAT-2024-ECE', catalogYear: '2024', program: 'B.Tech ECE', department: 'ECE', effectiveDate: '2024-08-01', totalCreditsRequired: 160 },
    { catalogId: 'CAT-2023-ECE', catalogYear: '2023', program: 'B.Tech ECE', department: 'ECE', effectiveDate: '2023-08-01', totalCreditsRequired: 160 }
  ];

  catalogs.forEach(catalogData => {
    const catalog = new Catalog(catalogData);
    storageService.create('catalogs', catalog);
  });

  // 7. Create Requirements
  const requirements = [
    // 2024 Catalog Requirements
    { 
      requirementId: 'REQ-2024-01', 
      catalogId: 'CAT-2024-CSE', 
      category: 'Core Courses', 
      description: 'Core Computer Science courses', 
      minimumCredits: 60, 
      minimumGPA: 6.0, 
      courseList: ['CS101', 'CS102', 'CS201', 'CS202', 'CS301', 'CS302', 'CS303', 'CS401'],
      rules: 'All core courses must be completed'
    },
    { 
      requirementId: 'REQ-2024-02', 
      catalogId: 'CAT-2024-CSE', 
      category: 'Mathematics', 
      description: 'Mathematics foundation courses', 
      minimumCredits: 12, 
      minimumGPA: 6.0, 
      courseList: ['MA101', 'MA102', 'MA201'],
      rules: 'All mathematics courses must be completed'
    },
    { 
      requirementId: 'REQ-2024-03', 
      catalogId: 'CAT-2024-CSE', 
      category: 'Electives', 
      description: 'Technical elective courses', 
      minimumCredits: 20, 
      minimumGPA: 6.0, 
      courseList: ['CS402', 'CS403'],
      rules: 'Minimum 5 elective courses'
    },
    { 
      requirementId: 'REQ-2024-04', 
      catalogId: 'CAT-2024-CSE', 
      category: 'Humanities', 
      description: 'Humanities and communication courses', 
      minimumCredits: 8, 
      minimumGPA: 6.0, 
      courseList: ['HS101', 'HS201'],
      rules: 'All humanities courses must be completed'
    }
  ];

  requirements.forEach(requirementData => {
    const requirement = new Requirement(requirementData);
    storageService.create('requirements', requirement);
  });

  // 8. Create Transcripts (using new student IDs)
  const transcripts = [
    // Rohan Mehta (24UCS101) - Full 4-year course load with realistic LNMIIT data
    // Semester 2024-2025 I (Semester 1)
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS101', semester: '2024-2025 I', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'MA101', semester: '2024-2025 I', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'PH101', semester: '2024-2025 I', grade: 'BC', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'HS101', semester: '2024-2025 I', grade: 'A', creditsEarned: 2.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CH101', semester: '2024-2025 I', grade: 'BC', creditsEarned: 4.00, status: 'Imported' },
    
    // Semester 2024-2025 II (Semester 2)
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS102', semester: '2024-2025 II', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'MA102', semester: '2024-2025 II', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'PH102', semester: '2024-2025 II', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'HS102', semester: '2024-2025 II', grade: 'AB', creditsEarned: 2.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'EE101', semester: '2024-2025 II', grade: 'BC', creditsEarned: 4.00, status: 'Imported' },
    
    // Semester 2025-2026 I (Semester 3)
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS201', semester: '2025-2026 I', grade: 'A', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS202', semester: '2025-2026 I', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'MA201', semester: '2025-2026 I', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS203', semester: '2025-2026 I', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'HS201', semester: '2025-2026 I', grade: 'BC', creditsEarned: 2.00, status: 'Imported' },
    
    // Semester 2025-2026 II (Semester 4) - Including one FAILED course
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS301', semester: '2025-2026 II', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS302', semester: '2025-2026 II', grade: 'F', creditsEarned: 0.00, status: 'Imported' }, // OPERATING SYSTEMS - FAILED
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS303', semester: '2025-2026 II', grade: 'BC', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS304', semester: '2025-2026 II', grade: 'C', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'HS301', semester: '2025-2026 II', grade: 'A', creditsEarned: 3.00, status: 'Imported' },
    
    // Summer Term 2025-26
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'OE101', semester: 'Summer Term 2025-26', grade: 'A', creditsEarned: 3.00, status: 'Imported' },
    
    // Semester 2026-2027 I (Semester 5)
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS401', semester: '2026-2027 I', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS402', semester: '2026-2027 I', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS403', semester: '2026-2027 I', grade: 'BC', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'OE102', semester: '2026-2027 I', grade: 'A', creditsEarned: 3.00, status: 'Imported' },
    
    // Semester 2026-2027 II (Semester 6)
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS501', semester: '2026-2027 II', grade: 'B', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS502', semester: '2026-2027 II', grade: 'AB', creditsEarned: 4.00, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCS101', courseCode: 'CS503', semester: '2026-2027 II', grade: 'C', creditsEarned: 4.00, status: 'Imported' },

    // Amit Kumar (23UCS048) - Has F and CD grades
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'CS101', semester: '2023-2024 I', grade: 'C', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'MA101', semester: '2023-2024 I', grade: 'F', creditsEarned: 0, status: 'Imported' }, // Failed - must repeat
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'PH101', semester: '2023-2024 I', grade: 'CD', creditsEarned: 4, status: 'Imported' }, // Can repeat for improvement
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'CS102', semester: '2023-2024 II', grade: 'C', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'CS201', semester: '2024-2025 I', grade: 'CD', creditsEarned: 4, status: 'Imported' }, // Can repeat
    { transcriptId: uuidv4(), studentId: '23UCS048', courseCode: 'MA102', semester: 'Summer Term 2024-25', grade: 'D', creditsEarned: 4, status: 'Imported' }, // Summer course with D grade

    // Vikram Patel (23UCS075) - Has F grades - at-risk
    { transcriptId: uuidv4(), studentId: '23UCS075', courseCode: 'CS101', semester: '2023-2024 I', grade: 'BC', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '23UCS075', courseCode: 'MA101', semester: '2023-2024 I', grade: 'F', creditsEarned: 0, status: 'Imported' }, // Failed - must repeat
    { transcriptId: uuidv4(), studentId: '23UCS075', courseCode: 'CS102', semester: '2023-2024 II', grade: 'F', creditsEarned: 0, status: 'Imported' }, // Failed - must repeat
    
    // CCE Student - Hatwar Manas (24UCC175)
    { transcriptId: uuidv4(), studentId: '24UCC175', courseCode: 'CS101', semester: '2024-2025 I', grade: 'B', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCC175', courseCode: 'MA101', semester: '2024-2025 I', grade: 'BC', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCC175', courseCode: 'PH101', semester: '2024-2025 I', grade: 'B', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCC175', courseCode: 'CH101', semester: '2024-2025 I', grade: 'AB', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UCC175', courseCode: 'CS102', semester: '2024-2025 II', grade: 'B', creditsEarned: 4, status: 'Imported' },
    
    // ECE Student - Neha Singh (24UEC048)
    { transcriptId: uuidv4(), studentId: '24UEC048', courseCode: 'MA101', semester: '2024-2025 I', grade: 'AB', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UEC048', courseCode: 'PH101', semester: '2024-2025 I', grade: 'B', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UEC048', courseCode: 'EE101', semester: '2024-2025 II', grade: 'B', creditsEarned: 4, status: 'Imported' },
    { transcriptId: uuidv4(), studentId: '24UEC048', courseCode: 'CH101', semester: '2024-2025 I', grade: 'A', creditsEarned: 4, status: 'Imported' }
  ];

  transcripts.forEach(transcriptData => {
    const transcript = new Transcript(transcriptData);
    storageService.create('transcripts', transcript);
  });

  // 9. Create Advisor Assignments (using new student IDs)
  const assignments = [
    // CSE Students under Dr. Sharma
    { assignmentId: 'AS001', advisorId: 'A001', studentId: '24UCS101', assignmentDate: '2024-08-01', status: 'Active' },
    { assignmentId: 'AS002', advisorId: 'A001', studentId: '24UCS102', assignmentDate: '2024-08-01', status: 'Active' },
    { assignmentId: 'AS003', advisorId: 'A001', studentId: '23UCS048', assignmentDate: '2023-08-01', status: 'Active' },
    { assignmentId: 'AS004', advisorId: 'A001', studentId: '23UCS075', assignmentDate: '2023-08-01', status: 'Active' },
    // NEW: Good performing students under Dr. Sharma
    { assignmentId: 'AS009', advisorId: 'A001', studentId: '23UCS101', assignmentDate: '2023-08-01', status: 'Active' },
    { assignmentId: 'AS010', advisorId: 'A001', studentId: '24UCS103', assignmentDate: '2024-08-01', status: 'Active' },
    { assignmentId: 'AS011', advisorId: 'A001', studentId: '24UCS104', assignmentDate: '2024-08-01', status: 'Active' },
    
    // CCE Students under Dr. Gupta
    { assignmentId: 'AS005', advisorId: 'A003', studentId: '24UCC175', assignmentDate: '2024-08-01', status: 'Active' },
    { assignmentId: 'AS006', advisorId: 'A003', studentId: '24UCC176', assignmentDate: '2024-08-01', status: 'Active' },
    
    // ECE Students under Dr. Patel
    { assignmentId: 'AS007', advisorId: 'A002', studentId: '24UEC048', assignmentDate: '2024-08-01', status: 'Active' },
    { assignmentId: 'AS008', advisorId: 'A002', studentId: '23UEC091', assignmentDate: '2023-08-01', status: 'Active' }
  ];

  assignments.forEach(assignmentData => {
    const assignment = new AdvisorAssignment(assignmentData);
    storageService.create('advisorAssignments', assignment);
  });

  const stats = storageService.getStats();
  console.log('Database seeded successfully!');
  console.log('Statistics:', stats);
  
  return stats;
}

module.exports = { seedDatabase };
