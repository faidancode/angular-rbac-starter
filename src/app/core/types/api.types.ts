export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Employee ---
export interface Employee {
  id: string;
  nip: string;
  fullName: string;
  gender: string;
  genderLabel: string;
  employeeStatus: string;
  employeeStatusLabel: string;
  positionId: string;
  positionName: string;
  isActive: boolean;
  isActiveLabel: string;
  dateOfJoining: string;
  dateOfActivePosition: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayload {
  nip: string;
  fullName: string;
  gender: string;
  positionId: string;
  employeeStatus: string;
  isActive: boolean;
  dateOfJoining?: string;
  dateOfActivePosition?: string;
}
