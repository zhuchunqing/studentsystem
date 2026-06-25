import type {
  AuditStatus,
  CommonStatus,
  CourseType,
  Gender,
  GradeLevel,
  MyCourseStatus,
  PlanCourseStatus,
  ScoreType,
  SelectionStatus,
  UserRole
} from './enums'

/** 院系 */
export interface Department {
  id: number
  name: string
  parentId: number | null
  dean: string
  description: string
  createdAt: string
  updatedAt: string
}

/** 院系树形结构 */
export interface DepartmentTree extends Department {
  children?: DepartmentTree[]
}

/** 院系下拉选项 */
export interface DepartmentOption {
  id: number
  name: string
}

/** 教师 */
export interface Teacher {
  id: number
  name: string
  employeeNo: string
  departmentId: number
  departmentName?: string
  title: string
  phone: string
  email: string
  status: CommonStatus
  createdAt: string
  updatedAt: string
}

/** 教师下拉选项 */
export interface TeacherOption {
  id: number
  name: string
}

/** 班级 */
export interface Clazz {
  id: number
  name: string
  departmentId: number
  departmentName?: string
  advisorId: number | null
  advisorName?: string
  grade: string
  major: string
  studentCount: number
  createdAt: string
  updatedAt: string
}

/** 班级下拉选项 */
export interface ClassOption {
  id: number
  name: string
}

/** 学生 */
export interface Student {
  id: number
  name: string
  studentNo: string
  classId: number
  className?: string
  gender: Gender
  enrollmentDate: string
  phone: string
  email: string
  status: CommonStatus
  createdAt: string
  updatedAt: string
}

/** 学生下拉选项 */
export interface StudentOption {
  id: number
  name: string
}

/** 课程 */
export interface Course {
  id: number
  name: string
  code: string
  teacherId: number | null
  teacherName?: string
  departmentId: number
  credit: number
  hours: number
  courseType: CourseType
  semester: string
  maxStudents: number
  description: string
  status: CommonStatus
  createdAt: string
  updatedAt: string
}

/** 课程下拉选项 */
export interface CourseOption {
  id: number
  name: string
}

/** 成绩 */
export interface Score {
  id: number
  studentId: number
  courseId: number
  scoreValue: number
  gradeLevel: GradeLevel
  semester: string
  scoreType: ScoreType
  isPassed: number
  remark: string
  createdAt: string
  updatedAt: string
}

/** 学生成绩查询响应（含课程信息） */
export interface StudentScoreResponse {
  id: number
  studentNo: string
  studentName: string
  courseCode: string
  courseName: string
  courseType: string
  credit: number
  semester: string
  usualScore: number | null
  midtermScore: number | null
  finalScore: number | null
  totalScore: number | null
  gradePoint: number | null
  scoreLevel: string
  isPassed: boolean
  remark: string
}

/** 成绩录入记录 */
export interface ScoreRecord {
  studentId: number
  scoreValue: number
}

/** 批量录入成绩请求 */
export interface ScoreBatchRequest {
  courseId: number
  semester: string
  scoreType: ScoreType
  records: ScoreRecord[]
}

/** 成绩录入行（教师录入界面） */
export interface ScoreInputRow {
  studentNo: string
  studentName: string
  usualScore: number | null
  midtermScore: number | null
  finalScore: number | null
  totalScore: number | null
  gradePoint: number | null
}

/** 成绩统计响应 */
export interface ScoreStatistics {
  totalStudents: number
  averageScore: number
  maxScore: number
  minScore: number
  passRate: number
  gradeDistribution: Record<GradeLevel, number>
}

/** 选课记录 */
export interface CourseSelection {
  id: number
  studentId: number
  courseId: number
  semester: string
  status: SelectionStatus
  selectedAt: string
  droppedAt: string | null
}

/** 选课请求 */
export interface CourseSelectionRequest {
  studentId: number
  courseId: number
  semester: string
}

/** 选课中心课程行（学生视角） */
export interface CourseSelectionRow {
  id: number
  code: string
  name: string
  teacherName: string
  credit: number
  courseType: CourseType
  semester: string
  selectedCount: number
  maxStudents: number
  myStatus: MyCourseStatus
}

/** 系统用户 */
export interface SysUser {
  id: number
  username: string
  role: UserRole
  refId: number | null
  status: CommonStatus
  lastLoginAt: string
  createdAt: string
}

/** 用户管理表格行（后端返回 snake_case） */
export interface SysUserRow {
  id: number
  username: string
  role: UserRole
  ref_id: number | null
  status: CommonStatus
  last_login_at: string
  created_at: string
}

/** 毕业审核行 */
export interface GraduationAuditRow {
  id: number
  student_no: string
  name: string
  major: string
  total_credit: number
  required_credit: number
  required_passed: boolean
  elective_credit: number
  practice_credit: number
  audit_result: '通过' | '未通过'
}

/** 缺修课程 */
export interface MissingCourse {
  code: string
  name: string
  credit: number
  type: string
}

/** 成绩审核行 */
export interface ScoreAuditRow {
  id: number
  teacher_name: string
  course_name: string
  semester: string
  score_type: ScoreType
  student_count: number
  submit_time: string
  audit_status: AuditStatus
}

/** 培养方案课程行 */
export interface PlanCourseRow {
  code: string
  name: string
  credit: number
  semester?: string
  category?: string
  status: PlanCourseStatus
}
