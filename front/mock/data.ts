function now() {
  return '2025-06-29T10:00:00'
}

/** 院系数据 */
export const departments: any[] = [
  { id: 1, name: '计算机科学与技术学院', parentId: null, dean: '张明远', description: '负责计算机相关专业教学', createdAt: now(), updatedAt: now() },
  { id: 2, name: '计算机科学与技术系', parentId: 1, dean: '李建国', description: 'CS专业', createdAt: now(), updatedAt: now() },
  { id: 3, name: '软件工程系', parentId: 1, dean: '王建华', description: 'SE专业', createdAt: now(), updatedAt: now() },
  { id: 4, name: '网络工程系', parentId: 1, dean: '赵志强', description: 'NE专业', createdAt: now(), updatedAt: now() },
  { id: 5, name: '数学与统计学院', parentId: null, dean: '陈博文', description: '负责数学与统计专业教学', createdAt: now(), updatedAt: now() },
  { id: 6, name: '数学系', parentId: 5, dean: '刘志远', description: 'MA专业', createdAt: now(), updatedAt: now() },
  { id: 7, name: '统计学系', parentId: 5, dean: '黄海峰', description: 'ST专业', createdAt: now(), updatedAt: now() },
  { id: 8, name: '外国语学院', parentId: null, dean: '孙丽华', description: '负责外语专业教学', createdAt: now(), updatedAt: now() },
  { id: 9, name: '英语系', parentId: 8, dean: '周雅琴', description: 'EN专业', createdAt: now(), updatedAt: now() },
  { id: 10, name: '日语系', parentId: 8, dean: '吴美玲', description: 'JP专业', createdAt: now(), updatedAt: now() },
]

/** 教师数据 */
export const teachers: any[] = [
  { id: 1, name: '张明远', employeeNo: 'T2024001', departmentId: 2, title: '教授', phone: '13800001001', email: 'zhangmingyuan@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 2, name: '李建国', employeeNo: 'T2024002', departmentId: 2, title: '副教授', phone: '13800001002', email: 'lijianguo@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 3, name: '王建华', employeeNo: 'T2024003', departmentId: 3, title: '教授', phone: '13800001003', email: 'wangjianhua@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 4, name: '赵志强', employeeNo: 'T2024004', departmentId: 4, title: '副教授', phone: '13800001004', email: 'zhaozhiqiang@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 5, name: '陈博文', employeeNo: 'T2024005', departmentId: 6, title: '教授', phone: '13800001005', email: 'chenbowen@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 6, name: '刘志远', employeeNo: 'T2024006', departmentId: 6, title: '讲师', phone: '13800001006', email: 'liuzhiyuan@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 7, name: '黄海峰', employeeNo: 'T2024007', departmentId: 7, title: '副教授', phone: '13800001007', email: 'huanghaifeng@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 8, name: '孙丽华', employeeNo: 'T2024008', departmentId: 9, title: '教授', phone: '13800001008', email: 'sunlihua@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 9, name: '周雅琴', employeeNo: 'T2024009', departmentId: 9, title: '副教授', phone: '13800001009', email: 'zhouyaqin@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 10, name: '吴美玲', employeeNo: 'T2024010', departmentId: 10, title: '讲师', phone: '13800001010', email: 'wumeiling@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 11, name: '杨国栋', employeeNo: 'T2024011', departmentId: 2, title: '讲师', phone: '13800001011', email: 'yangguodong@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 12, name: '林小燕', employeeNo: 'T2024012', departmentId: 3, title: '副教授', phone: '13800001012', email: 'linxiaoyan@edu.cn', status: 1, createdAt: now(), updatedAt: now() },
]

/** 班级数据 */
export const classes: any[] = [
  { id: 1, name: '计科2024-1班', departmentId: 2, advisorId: 1, grade: '2024', major: '计算机科学与技术', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 2, name: '计科2024-2班', departmentId: 2, advisorId: 2, grade: '2024', major: '计算机科学与技术', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 3, name: '软工2024-1班', departmentId: 3, advisorId: 3, grade: '2024', major: '软件工程', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 4, name: '软工2024-2班', departmentId: 3, advisorId: 12, grade: '2024', major: '软件工程', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 5, name: '网工2024-1班', departmentId: 4, advisorId: 4, grade: '2024', major: '网络工程', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 6, name: '数学2024-1班', departmentId: 6, advisorId: 5, grade: '2024', major: '数学与应用数学', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 7, name: '统计2024-1班', departmentId: 7, advisorId: 7, grade: '2024', major: '统计学', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 8, name: '英语2024-1班', departmentId: 9, advisorId: 8, grade: '2024', major: '英语', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 9, name: '日语2024-1班', departmentId: 10, advisorId: 10, grade: '2024', major: '日语', studentCount: 0, createdAt: now(), updatedAt: now() },
  { id: 10, name: '计科2025-1班', departmentId: 2, advisorId: 11, grade: '2025', major: '计算机科学与技术', studentCount: 0, createdAt: now(), updatedAt: now() },
]

/** 学生数据 */
export const students: any[] = [
  { id: 1, name: '王小明', studentNo: 'S20240001', classId: 1, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001001', email: 'wangxiaoming@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 2, name: '李小红', studentNo: 'S20240002', classId: 1, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001002', email: 'lixiaohong@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 3, name: '张大伟', studentNo: 'S20240003', classId: 1, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001003', email: 'zhangdawei@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 4, name: '赵丽娜', studentNo: 'S20240004', classId: 1, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001004', email: 'zhaolina@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 5, name: '陈小刚', studentNo: 'S20240005', classId: 1, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001005', email: 'chenxiaogang@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 6, name: '刘美玲', studentNo: 'S20240006', classId: 2, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001006', email: 'liumeiling@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 7, name: '黄志强', studentNo: 'S20240007', classId: 2, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001007', email: 'huangzhiqiang@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 8, name: '周丽丽', studentNo: 'S20240008', classId: 2, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001008', email: 'zhoulili@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 9, name: '吴明华', studentNo: 'S20240009', classId: 2, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001009', email: 'wuminghua@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 10, name: '孙海燕', studentNo: 'S20240010', classId: 2, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001010', email: 'sunhaiyan@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 11, name: '马建国', studentNo: 'S20240011', classId: 3, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001011', email: 'majianguo@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 12, name: '林小芳', studentNo: 'S20240012', classId: 3, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001012', email: 'linxiaofang@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 13, name: '郑志明', studentNo: 'S20240013', classId: 3, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001013', email: 'zhengzhiming@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 14, name: '谢晓雯', studentNo: 'S20240014', classId: 3, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001014', email: 'xiexiaowen@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 15, name: '朱伟强', studentNo: 'S20240015', classId: 4, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001015', email: 'zhuweiqiang@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 16, name: '韩雪梅', studentNo: 'S20240016', classId: 4, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001016', email: 'hanxuemei@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 17, name: '曹俊杰', studentNo: 'S20240017', classId: 4, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001017', email: 'caojunjie@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 18, name: '许静怡', studentNo: 'S20240018', classId: 5, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001018', email: 'xujingyi@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 19, name: '沈浩然', studentNo: 'S20240019', classId: 5, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001019', email: 'shenhaoran@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 20, name: '宋佳琪', studentNo: 'S20240020', classId: 5, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001020', email: 'songjiaqi@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 21, name: '唐国华', studentNo: 'S20240021', classId: 6, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001021', email: 'tangguohua@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 22, name: '董丽君', studentNo: 'S20240022', classId: 6, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001022', email: 'donglijun@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 23, name: '罗明辉', studentNo: 'S20240023', classId: 7, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001023', email: 'luominghui@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 24, name: '田秀英', studentNo: 'S20240024', classId: 7, gender: 2, enrollmentDate: '2024-09-01', phone: '13900001024', email: 'tianxiuying@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
  { id: 25, name: '彭志刚', studentNo: 'S20240025', classId: 8, gender: 1, enrollmentDate: '2024-09-01', phone: '13900001025', email: 'pengzhigang@stu.edu.cn', status: 1, createdAt: now(), updatedAt: now() },
]

/** 课程数据 */
export const courses: any[] = [
  { id: 1, name: '高等数学A', code: 'CS101', teacherId: 5, departmentId: 6, credit: 5, hours: 80, courseType: 1, semester: '2024-2025-1', maxStudents: 60, description: '高等数学基础课程', status: 1, createdAt: now(), updatedAt: now() },
  { id: 2, name: '线性代数', code: 'CS102', teacherId: 6, departmentId: 6, credit: 3, hours: 48, courseType: 1, semester: '2024-2025-1', maxStudents: 60, description: '线性代数基础', status: 1, createdAt: now(), updatedAt: now() },
  { id: 3, name: 'C语言程序设计', code: 'CS201', teacherId: 1, departmentId: 2, credit: 4, hours: 64, courseType: 1, semester: '2024-2025-1', maxStudents: 40, description: '程序设计入门', status: 1, createdAt: now(), updatedAt: now() },
  { id: 4, name: '数据结构', code: 'CS202', teacherId: 2, departmentId: 2, credit: 4, hours: 64, courseType: 1, semester: '2024-2025-2', maxStudents: 40, description: '数据结构与算法', status: 1, createdAt: now(), updatedAt: now() },
  { id: 5, name: '操作系统', code: 'CS301', teacherId: 1, departmentId: 2, credit: 4, hours: 64, courseType: 1, semester: '2024-2025-2', maxStudents: 40, description: '操作系统原理', status: 1, createdAt: now(), updatedAt: now() },
  { id: 6, name: '计算机网络', code: 'CS302', teacherId: 4, departmentId: 4, credit: 3, hours: 48, courseType: 1, semester: '2024-2025-2', maxStudents: 40, description: '计算机网络原理', status: 1, createdAt: now(), updatedAt: now() },
  { id: 7, name: '软件工程', code: 'SE301', teacherId: 3, departmentId: 3, credit: 3, hours: 48, courseType: 1, semester: '2024-2025-2', maxStudents: 40, description: '软件工程导论', status: 1, createdAt: now(), updatedAt: now() },
  { id: 8, name: '数据库原理', code: 'CS303', teacherId: 2, departmentId: 2, credit: 3, hours: 48, courseType: 1, semester: '2024-2025-1', maxStudents: 40, description: '数据库系统概论', status: 1, createdAt: now(), updatedAt: now() },
  { id: 9, name: '概率论与数理统计', code: 'MA201', teacherId: 7, departmentId: 7, credit: 3, hours: 48, courseType: 1, semester: '2024-2025-2', maxStudents: 60, description: '概率统计基础', status: 1, createdAt: now(), updatedAt: now() },
  { id: 10, name: '大学英语', code: 'EN101', teacherId: 8, departmentId: 9, credit: 4, hours: 64, courseType: 1, semester: '2024-2025-1', maxStudents: 40, description: '大学英语综合课程', status: 1, createdAt: now(), updatedAt: now() },
  { id: 11, name: '日语入门', code: 'JP101', teacherId: 10, departmentId: 10, credit: 2, hours: 32, courseType: 2, semester: '2024-2025-1', maxStudents: 30, description: '日语基础入门', status: 1, createdAt: now(), updatedAt: now() },
  { id: 12, name: '人工智能导论', code: 'CS401', teacherId: 11, departmentId: 2, credit: 2, hours: 32, courseType: 2, semester: '2024-2025-2', maxStudents: 40, description: 'AI基础概念与应用', status: 1, createdAt: now(), updatedAt: now() },
  { id: 13, name: 'Web前端开发', code: 'SE302', teacherId: 3, departmentId: 3, credit: 3, hours: 48, courseType: 2, semester: '2024-2025-1', maxStudents: 35, description: 'HTML/CSS/JS前端技术', status: 1, createdAt: now(), updatedAt: now() },
  { id: 14, name: 'Python编程', code: 'CS304', teacherId: 12, departmentId: 3, credit: 2, hours: 32, courseType: 2, semester: '2024-2025-1', maxStudents: 40, description: 'Python语言基础', status: 1, createdAt: now(), updatedAt: now() },
  { id: 15, name: '英语写作', code: 'EN201', teacherId: 9, departmentId: 9, credit: 2, hours: 32, courseType: 3, semester: '2024-2025-2', maxStudents: 30, description: '英语学术写作', status: 1, createdAt: now(), updatedAt: now() },
]

/** 成绩数据 */
export const scores: any[] = [
  { id: 1, studentId: 1, courseId: 3, scoreValue: 85, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 2, studentId: 1, courseId: 8, scoreValue: 90, gradeLevel: 'A', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 3, studentId: 1, courseId: 1, scoreValue: 78, gradeLevel: 'C', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 4, studentId: 2, courseId: 3, scoreValue: 92, gradeLevel: 'A', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 5, studentId: 2, courseId: 8, scoreValue: 88, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 6, studentId: 3, courseId: 3, scoreValue: 55, gradeLevel: 'F', semester: '2024-2025-1', scoreType: 1, isPassed: 0, remark: '挂科', createdAt: now(), updatedAt: now() },
  { id: 7, studentId: 6, courseId: 1, scoreValue: 76, gradeLevel: 'C', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 8, studentId: 6, courseId: 2, scoreValue: 82, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 9, studentId: 11, courseId: 13, scoreValue: 95, gradeLevel: 'A', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 10, studentId: 12, courseId: 13, scoreValue: 88, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 11, studentId: 1, courseId: 10, scoreValue: 80, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 12, studentId: 2, courseId: 10, scoreValue: 85, gradeLevel: 'B', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
  { id: 13, studentId: 1, courseId: 2, scoreValue: 70, gradeLevel: 'C', semester: '2024-2025-1', scoreType: 1, isPassed: 1, remark: '', createdAt: now(), updatedAt: now() },
]

/** 选课数据 */
export const courseSelections: any[] = [
  { id: 1, studentId: 1, courseId: 3, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T08:00:00', droppedAt: null },
  { id: 2, studentId: 1, courseId: 8, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T08:05:00', droppedAt: null },
  { id: 3, studentId: 1, courseId: 1, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T08:10:00', droppedAt: null },
  { id: 4, studentId: 1, courseId: 10, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T08:15:00', droppedAt: null },
  { id: 5, studentId: 2, courseId: 3, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T09:00:00', droppedAt: null },
  { id: 6, studentId: 2, courseId: 8, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T09:05:00', droppedAt: null },
  { id: 7, studentId: 2, courseId: 10, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T09:10:00', droppedAt: null },
  { id: 8, studentId: 3, courseId: 3, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-05T10:00:00', droppedAt: null },
  { id: 9, studentId: 3, courseId: 13, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T08:00:00', droppedAt: null },
  { id: 10, studentId: 6, courseId: 1, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T08:10:00', droppedAt: null },
  { id: 11, studentId: 6, courseId: 2, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T08:15:00', droppedAt: null },
  { id: 12, studentId: 11, courseId: 13, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T09:00:00', droppedAt: null },
  { id: 13, studentId: 12, courseId: 13, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T09:05:00', droppedAt: null },
  { id: 14, studentId: 1, courseId: 2, semester: '2024-2025-1', status: 1, selectedAt: '2024-09-06T09:10:00', droppedAt: null },
]

/** 用户数据 */
export const users: any[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', refId: null, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 2, username: 'T2024001', password: 'T2024001', role: 'teacher', refId: 1, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 3, username: 'T2024002', password: 'T2024002', role: 'teacher', refId: 2, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 4, username: 'T2024003', password: 'T2024003', role: 'teacher', refId: 3, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 5, username: 'S20240001', password: 'S20240001', role: 'student', refId: 1, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 6, username: 'S20240002', password: 'S20240002', role: 'student', refId: 2, status: 1, lastLoginAt: now(), createdAt: now() },
  { id: 7, username: 'S20240003', password: 'S20240003', role: 'student', refId: 3, status: 1, lastLoginAt: now(), createdAt: now() },
]

/** 返回成功响应 */
export function success(data: any, message = '操作成功') {
  return { code: 200, message, data }
}

/** 返回失败响应 */
export function fail(message = '操作失败', code = 400) {
  return { code, message, data: null }
}

/** 分页工具 */
export function paginate<T>(list: T[], pageNum = 1, pageSize = 10) {
  const total = list.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (pageNum - 1) * pageSize
  const paged = list.slice(start, start + pageSize)
  return { list: paged, total, pageNum, pageSize, totalPages }
}

/** 自动 ID */
export function nextId(list: any[]): number {
  if (list.length === 0) return 1
  return Math.max(...list.map((i: any) => i.id)) + 1
}
