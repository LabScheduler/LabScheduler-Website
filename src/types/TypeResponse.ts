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
