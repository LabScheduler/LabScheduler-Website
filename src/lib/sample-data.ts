/**
 * Utility to generate larger sample datasets for testing pagination
 */

// Generate a sample set of students
export function generateSampleStudents(count: number = 100) {
  const students = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    const paddedId = String(i).padStart(3, '0');
    
    students.push({
      id,
      full_name: `Sinh viên ${paddedId}`,
      email: `student${paddedId}@student.ptithcm.edu.vn`,
      code: `STUDENT${paddedId}`,
      phone: `0${Math.floor(100000000 + Math.random() * 900000000)}`,
      gender: Math.random() > 0.5,
      birthday: `${2000 + Math.floor(Math.random() * 5)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`,
      role: 'STUDENT',
      status: Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE',
      class: `D${22 + Math.floor(Math.random() * 3)}CQCN0${1 + Math.floor(Math.random() * 3)}-N`,
      major: "Công nghệ thông tin",
      specialization: Math.random() > 0.7 ? "Công nghệ phần mềm" : ""
    });
  }
  return students;
}

// Generate a sample set of lecturers
export function generateSampleLecturers(count: number = 50) {
  const lecturers = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    const paddedId = String(i).padStart(3, '0');
    
    lecturers.push({
      id,
      full_name: `Giảng viên ${paddedId}`,
      email: `lecturer${paddedId}@ptithcm.edu.vn`,
      code: `LECTURER${paddedId}`,
      phone: `0${Math.floor(100000000 + Math.random() * 900000000)}`,
      gender: Math.random() > 0.4,
      birthday: `${1970 + Math.floor(Math.random() * 30)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`,
      department: Math.random() > 0.7 ? "Khoa Công nghệ Thông tin" : "Khoa Điện tử",
      role: 'LECTURER',
      status: Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE'
    });
  }
  return lecturers;
}

// Generate a sample set of rooms
export function generateSampleRooms(count: number = 40) {
  const rooms = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    const floor = 1 + Math.floor(Math.random() * 5);
    const roomNumber = String(Math.floor(1 + Math.random() * 15)).padStart(2, '0');
    
    rooms.push({
      id,
      name: `${floor}B${roomNumber}`,
      capacity: 30 + Math.floor(Math.random() * 50),
      status: Math.random() > 0.8 ? 'REPAIRING' : (Math.random() > 0.3 ? 'AVAILABLE' : 'UNAVAILABLE'),
      description: "",
      last_updated: new Date(2025, 2, 1 + Math.floor(Math.random() * 30), 
                             8 + Math.floor(Math.random() * 10), 
                             Math.floor(Math.random() * 60)).toISOString()
    });
  }
  return rooms;
}

// Generate a sample set of classes
export function generateSampleClasses(count: number = 30) {
  const majors = [
    "Công nghệ thông tin",
    "Kế toán",
    "Kỹ thuật Điện tử",
    "Quản trị kinh doanh",
    "Marketing"
  ];
  
  const specializations = [
    "",
    "Công nghệ phần mềm",
    "Khoa học dữ liệu",
    "Mạng máy tính",
    "An toàn thông tin"
  ];
  
  const classes = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    const majorIndex = Math.floor(Math.random() * majors.length);
    const major = majors[majorIndex];
    const specialization = majorIndex === 0 && Math.random() > 0.6 ? 
                          specializations[1 + Math.floor(Math.random() * (specializations.length - 1))] : 
                          "";
    
    const cohort = 22 + Math.floor(Math.random() * 3);
    const classNumber = String(1 + Math.floor(Math.random() * 5)).padStart(2, '0');
    
    classes.push({
      id,
      name: `D${cohort}CQ${majorIndex + 1}${classNumber}-N`,
      major,
      specialization,
      type: "MAJOR",
      number_of_students: Math.floor(Math.random() * 80)
    });
  }
  return classes;
}

// Generate a sample set of subjects
export function generateSampleSubjects(count: number = 40) {
  const subjectNames = [
    "Triết học Mác - Lênin",
    "Giải tích 1",
    "Tin học cơ sở 1",
    "Đại số",
    "Giáo dục thể chất 1",
    "Giáo dục quốc phòng và an ninh",
    "Kinh tế chính trị Mác - Lênin",
    "Tiếng Anh (Course 1)",
    "Tiếng Anh bổ trợ",
    "Giải tích 2",
    "Vật lý 1 và thí nghiệm",
    "Tin học cơ sở 2",
    "Kỹ thuật số",
    "Xác suất thống kê",
    "Giáo dục thể chất 2",
    "Chủ nghĩa xã hội khoa học",
    "Tiếng Anh (Course 2)",
    "Toán rời rạc 1",
    "Vật lý 3 và thí nghiệm",
    "Xử lý tín hiệu số",
    "Lập trình Web",
    "An toàn và bảo mật hệ thống thông tin",
    "Nhập môn công nghệ phần mềm",
    "Nhập môn trí tuệ nhân tạo",
    "Cơ sở dữ liệu phân tán",
    "Thực tập cơ sở",
    "Kỹ năng tạo lập Văn bản"
  ];
  
  const subjects = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    const nameIndex = Math.min(i - 1, subjectNames.length - 1);
    const name = i <= subjectNames.length ? subjectNames[nameIndex] : `Môn học ${i}`;
    
    const prefix = i <= 15 ? "BAS" : (i <= 25 ? "INT" : "ELE");
    const code = `${prefix}${1100 + i}`;
    
    const total_credits = 2 + Math.floor(Math.random() * 5);
    const total_theory_periods = 15 * total_credits + Math.floor(Math.random() * 10);
    
    subjects.push({
      id,
      code,
      name,
      total_credits,
      total_theory_periods,
      total_practice_periods: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
      total_exercise_periods: Math.random() > 0.8 ? Math.floor(Math.random() * 15) : 0,
      total_self_study_periods: Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0
    });
  }
  return subjects;
}

// Generate a sample set of courses
export function generateSampleCourses(count: number = 60) {
  const subjects = [
    "Lập trình Web",
    "An toàn và bảo mật hệ thống thông tin",
    "Nhập môn công nghệ phần mềm",
    "Nhập môn trí tuệ nhân tạo",
    "Cơ sở dữ liệu phân tán",
    "Thực tập cơ sở",
    "Kỹ năng tạo lập Văn bản",
    "Triết học Mác - Lênin",
    "Giải tích 1",
    "Tin học cơ sở 1",
    "Đại số",
    "Xác suất thống kê"
  ];
  
  const semesters = [
    "Học kỳ 1 - Năm học 2024 - 2025",
    "Học kỳ 2 - Năm học 2024 - 2025",
    "Học kỳ 3 - Năm học 2024 - 2025",
    "Học kỳ 1 - Năm học 2025 - 2026"
  ];
  
  const classes = [
    "D22CQCN01-N",
    "D22CQCN02-N",
    "D23CQCN01-N",
    "D23CQCN02-N",
    "D24CQCN01-N"
  ];
  
  const courses = [];
  for (let i = 1; i <= count; i++) {
    const id = i;
    
    courses.push({
      id,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      semester: semesters[Math.floor(Math.random() * semesters.length)],
      lecturers: [
        `Giang Vien ${1 + Math.floor(Math.random() * 5)}`
      ],
      class: classes[Math.floor(Math.random() * classes.length)],
      group_number: 1 + Math.floor(Math.random() * 3),
      total_students: 40 + Math.floor(Math.random() * 60)
    });
  }
  return courses;
} 