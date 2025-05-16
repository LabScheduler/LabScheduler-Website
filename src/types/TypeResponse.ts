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
  totalPendingRequests: number;
}

export interface Department{
  id: number;
  name: string;
}

export interface ClassResponse {
  id: number;
  name: string;
  major: string;
  specialization:string;
  type: string;
  numberOfStudents: number
}