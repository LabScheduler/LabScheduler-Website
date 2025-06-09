export interface ManagerResponse {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  role: string;
  status: string;
}

export interface ManagerResponse {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  role: string;
  status: string;
}


export interface LecturerResponse {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  department: string;
  role: string;
  status: string;
}


export interface StudentResponse {
  id: number;
  fullName: string;
  email: string;
  code: string;
  phone: string;
  gender: boolean;
  birthday: string;
  role: string;
  status: string;
  class: string;
  major: string;
  specialization: string;
}

export interface StatisticsResponse {
  totalRooms: number;
  totalAvailableRooms: number;
  totalUnavailableRooms: number;
  totalRepairingRooms: number;
  totalCoursesInSemester: number;
  totalPracticeSchedulesInSemester: number;
  totalStudents: number;
  totalLecturers: number;
  totalPendingReports: number;
}

export interface Department {
  id: number;
  name: string;
}

export interface ClassResponse {
  id: number;
  name: string;
  major: string;
  specialization: string | null;
  type: "MAJOR" | "SPECIALIZATION";
  numberOfStudents: number
}

export interface RoomResponse {
  id: number;
  name: string;
  capacity: number;
  status: "AVAILABLE" | "UNAVAILABLE" | "REPAIRING";
  description: string;
  lastUpdated: Date;
  type: "COMPUTER_LAB" | "LECTURE_HALL";
}

export interface SubjectResponse {
  id: number;
  code: string;
  name: string;
  totalCredits: number;
  totalTheoryPeriods: number;
  totalPracticePeriods: number;
  totalExercisePeriods: number;
  totalSelfStudyPeriods: number;
}


export interface SpecializationResponse {
  id: number;
  name: string;
}

export interface MajorResponse {
  id: number;
  code: string;
  name: string;
  specializations: SpecializationResponse[];
}

export interface SemesterResponse {
  id: number;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface SemesterWeekResponse {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
}


export interface CourseResponse {
  id: number;
  subject: string;
  semester: string;
  lecturers: string[];
  groupNumber: number;
  totalStudents: number;
  maxStudents: number;
  class: string;
}

export interface NewCourseResponse {
  course: CourseResponse;
  schedules: ScheduleResponse[];
}

export interface ScheduleResponse {
  id: number;
  subjectCode: string;
  subjectName: string;
  courseGroup: number;
  courseSection: number;
  room: string;
  dayOfWeek: number;  
  startPeriod: number;
  totalPeriod: number;
  class: string;      
  lecturer: string;
  semesterWeek: string;
  status: string;
  type: "THEORY" | "PRACTICE";
}

export interface CourseSectionResponse{
  id: number;
  sectionNumber: number;
  maxStudentsInSection: number;
}

export interface ReportResponse {
  id: number;
  title: string;
  authorContent: string;
  createdAt: Date;
  author: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  managerContent: string | null;
  updatedAt: Date;
}