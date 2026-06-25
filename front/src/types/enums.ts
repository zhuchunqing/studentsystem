/** 用户角色 */
export type UserRole = 'admin' | 'teacher' | 'student'

/** 性别：1男 / 2女 */
export type Gender = 1 | 2

/** 通用状态：1启用/在职/在读，0禁用/离职/休学，2毕业 */
export type CommonStatus = 0 | 1 | 2

/** 课程类型：1必修 / 2选修 / 3公选 */
export type CourseType = 1 | 2 | 3

/** 考试类型：1期末 / 2补考 / 3重修 */
export type ScoreType = 1 | 2 | 3

/** 成绩等级 */
export type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'F'

/** 选课状态：1已选 / 0退选 */
export type SelectionStatus = 0 | 1

/** 审核状态 */
export type AuditStatus = 'pending' | 'approved' | 'rejected'

/** 培养方案课程状态 */
export type PlanCourseStatus = 'passed' | 'failed' | 'pending'

/** 学生选课视角状态 */
export type MyCourseStatus = 'none' | 'selected' | 'required'
