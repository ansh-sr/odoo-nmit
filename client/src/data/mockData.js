// Mock data for the Dayflow hackathon MVP.
// Mirrors the shape returned by the FastAPI backend so swapping in real
// fetch calls later is a drop-in change.

export const currentUser = {
  id: 'EMP001',
  name: 'Aditi Sharma',
  email: 'aditi.sharma@dayflow.io',
  role: 'Employee',
  department: 'Engineering',
  designation: 'Frontend Developer',
  avatar: 'AS',
}

export const employees = [
  {
    id: 'EMP001',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@dayflow.io',
    role: 'Employee',
    department: 'Engineering',
    designation: 'Frontend Developer',
    avatar: 'AS',
    phone: '+91 98765 43210',
    address: 'Bengaluru, Karnataka',
    joinDate: '2023-03-14',
    salary: { base: 85000, hra: 25500, allowances: 8000, currency: 'INR' },
    attendanceStatus: 'Present',
  },
  {
    id: 'EMP002',
    name: 'Rohan Verma',
    email: 'rohan.verma@dayflow.io',
    role: 'Employee',
    department: 'Engineering',
    designation: 'Backend Developer',
    avatar: 'RV',
    phone: '+91 98765 11223',
    address: 'Pune, Maharashtra',
    joinDate: '2022-11-02',
    salary: { base: 92000, hra: 27600, allowances: 9000, currency: 'INR' },
    attendanceStatus: 'Present',
  },
  {
    id: 'EMP003',
    name: 'Kavya Iyer',
    email: 'kavya.iyer@dayflow.io',
    role: 'HR',
    department: 'Human Resources',
    designation: 'HR Officer',
    avatar: 'KI',
    phone: '+91 98765 99887',
    address: 'Chennai, Tamil Nadu',
    joinDate: '2021-06-21',
    salary: { base: 78000, hra: 23400, allowances: 7000, currency: 'INR' },
    attendanceStatus: 'Present',
  },
  {
    id: 'EMP004',
    name: 'Sameer Khan',
    email: 'sameer.khan@dayflow.io',
    role: 'Employee',
    department: 'Design',
    designation: 'Product Designer',
    avatar: 'SK',
    phone: '+91 98765 55443',
    address: 'Hyderabad, Telangana',
    joinDate: '2023-08-09',
    salary: { base: 80000, hra: 24000, allowances: 7500, currency: 'INR' },
    attendanceStatus: 'Half-day',
  },
]

export const attendanceByEmployee = {
  EMP001: [
    { date: '2026-08-18', status: 'Present', checkIn: '09:02', checkOut: '18:10' },
    { date: '2026-08-19', status: 'Present', checkIn: '08:57', checkOut: '18:05' },
    { date: '2026-08-20', status: 'Half-day', checkIn: '09:10', checkOut: '13:30' },
    { date: '2026-08-21', status: 'Present', checkIn: '09:00', checkOut: '18:20' },
    { date: '2026-08-22', status: 'Present', checkIn: '08:55', checkOut: null },
  ],
  EMP002: [
    { date: '2026-08-18', status: 'Present', checkIn: '09:15', checkOut: '18:00' },
    { date: '2026-08-19', status: 'Absent', checkIn: null, checkOut: null },
    { date: '2026-08-20', status: 'Present', checkIn: '09:05', checkOut: '18:00' },
    { date: '2026-08-21', status: 'Present', checkIn: '09:00', checkOut: '17:55' },
    { date: '2026-08-22', status: 'Present', checkIn: '09:03', checkOut: null },
  ],
  EMP003: [
    { date: '2026-08-18', status: 'Present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2026-08-19', status: 'Present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2026-08-20', status: 'Leave', checkIn: null, checkOut: null },
    { date: '2026-08-21', status: 'Present', checkIn: '08:50', checkOut: '18:00' },
    { date: '2026-08-22', status: 'Present', checkIn: '08:58', checkOut: null },
  ],
  EMP004: [
    { date: '2026-08-18', status: 'Present', checkIn: '09:20', checkOut: '18:15' },
    { date: '2026-08-19', status: 'Present', checkIn: '09:10', checkOut: '18:00' },
    { date: '2026-08-20', status: 'Present', checkIn: '09:00', checkOut: '18:00' },
    { date: '2026-08-21', status: 'Half-day', checkIn: '09:00', checkOut: '13:00' },
    { date: '2026-08-22', status: 'Present', checkIn: '09:05', checkOut: null },
  ],
}

export const leaveByEmployee = {
  EMP001: [
    {
      id: 'LR001',
      type: 'Sick',
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      remarks: 'Fever',
      status: 'Approved',
      appliedOn: '2026-08-08',
    },
    {
      id: 'LR002',
      type: 'Paid',
      startDate: '2026-08-28',
      endDate: '2026-08-29',
      remarks: 'Family function',
      status: 'Pending',
      appliedOn: '2026-08-20',
    },
  ],
  EMP002: [
    {
      id: 'LR003',
      type: 'Unpaid',
      startDate: '2026-08-19',
      endDate: '2026-08-19',
      remarks: 'Personal work',
      status: 'Rejected',
      appliedOn: '2026-08-16',
    },
  ],
  EMP003: [],
  EMP004: [
    {
      id: 'LR004',
      type: 'Paid',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      remarks: 'Travel',
      status: 'Pending',
      appliedOn: '2026-08-21',
    },
  ],
}

// All pending leave requests across the company, for the admin approvals view.
export const allPendingLeave = Object.entries(leaveByEmployee).flatMap(([empId, reqs]) =>
  reqs
    .filter((r) => r.status === 'Pending')
    .map((r) => ({ ...r, employeeId: empId, employeeName: employees.find((e) => e.id === empId)?.name })),
)
