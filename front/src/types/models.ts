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

/** 院系树形响应 DTO（后端 DepartmentTreeResponse） */
export interface DepartmentTreeResponse {
  id: number
  name: string
  dean: string
  children: DepartmentTreeResponse[]
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
  advisorId: number | null
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

/** 成绩实体 */
export interface Score {
  id: number
  studentId: number
  courseId: number
  scoreValue: number | null
  gradeLevel: GradeLevel
  semester: string
  scoreType: ScoreType
  isPassed: number
  remark: string
  createdAt: string
  updatedAt: string
}

/** 成绩录入请求 */
export interface ScoreRequest {
  studentId: number
  courseId: number
  scoreValue?: number
  semester?: string
  scoreType?: ScoreType
  remark?: string
}

/** 批量录入成绩记录项 */
export interface ScoreItem {
  studentId: number
  scoreValue: number
}

/** 批量录入成绩请求 */
export interface ScoreBatchRequest {
  courseId: number
  semester: string
  scoreType: ScoreType
  records: ScoreItem[]
}

/** 学生成绩查询响应（后端 StudentScoreResponse DTO，含关联字段） */
export interface StudentScoreResponse {
  scoreId: number
  studentName: string | null
  studentNo: string | null
  courseName: string | null
  courseCode: string | null
  scoreValue: number | null
  gradeLevel: GradeLevel | null
  semester: string
  scoreType: ScoreType
  isPassed: boolean
}

/** 成绩统计响应 */
export interface ScoreStatistics {
  totalStudents: number
  averageScore: number
  maxScore: number
  minScore: number
  passRate: number
  gradeDistribution: Record<string, number>
}

/** 成绩录入行（教师录入界面，前端组装） */
export interface ScoreInputRow {
  studentId: number
  studentNo: string
  studentName: string
  usualScore: number | null
  midtermScore: number | null
  finalScore: number | null
  totalScore: number | null
  gradePoint: number | null
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

/** 选课中心课程行（学生视角，前端组装） */
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

/** 培养方案课程行（前端展示模型） */
export interface PlanCourseRow {
  code: string
  name: string
  credit: number
  semester?: string
  category?: string
  status: PlanCourseStatus
}

/** 缺修课程（前端展示模型） */
export interface MissingCourse {
  code: string
  name: string
  credit: number
  type: string
}

/** 审核状态行（前端展示模型，用于成绩审核页面） */
export interface ScoreAuditRow {
  id: number
  teacherName: string
  courseName: string
  semester: string
  scoreType: ScoreType
  studentCount: number
  submitTime: string
  auditStatus: AuditStatus
}

/** 毕业审核行（前端展示模型，后端暂无对应接口） */
export interface GraduationAuditRow {
  id: number
  studentNo: string
  name: string
  major: string
  totalCredit: number
  requiredCredit: number
  requiredPassed: boolean
  electiveCredit: number
  practiceCredit: number
  auditResult: '通过' | '未通过'
}
