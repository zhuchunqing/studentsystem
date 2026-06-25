-- 创建数据库
CREATE DATABASE IF NOT EXISTS testinfozcqdb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE testinfozcqdb;

-- 院系表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '院系名称',
    parent_id BIGINT DEFAULT NULL COMMENT '上级院系ID',
    dean VARCHAR(50) DEFAULT NULL COMMENT '院系负责人',
    description TEXT DEFAULT NULL COMMENT '院系描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES department(id) ON DELETE SET NULL
) COMMENT='院系表';

-- 教师表
CREATE TABLE IF NOT EXISTS teacher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    employee_no VARCHAR(30) NOT NULL UNIQUE COMMENT '工号',
    department_id BIGINT DEFAULT NULL COMMENT '所属院系',
    title VARCHAR(30) DEFAULT NULL COMMENT '职称',
    phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1在职/0离职',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) COMMENT='教师表';

-- 班级表
CREATE TABLE IF NOT EXISTS class (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '班级名称',
    department_id BIGINT DEFAULT NULL COMMENT '所属院系',
    advisor_id BIGINT DEFAULT NULL COMMENT '班主任',
    grade VARCHAR(10) NOT NULL COMMENT '年级',
    major VARCHAR(100) DEFAULT NULL COMMENT '专业方向',
    student_count INT DEFAULT 0 COMMENT '学生人数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (advisor_id) REFERENCES teacher(id) ON DELETE SET NULL
) COMMENT='班级表';

-- 学生表
CREATE TABLE IF NOT EXISTS student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    student_no VARCHAR(30) NOT NULL UNIQUE COMMENT '学号',
    class_id BIGINT DEFAULT NULL COMMENT '所属班级',
    gender TINYINT DEFAULT NULL COMMENT '1男/2女',
    enrollment_date DATE NOT NULL COMMENT '入学日期',
    phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1在读/0休学/2毕业',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE SET NULL
) COMMENT='学生表';

-- 课程表
CREATE TABLE IF NOT EXISTS course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '课程名称',
    code VARCHAR(30) NOT NULL UNIQUE COMMENT '课程编码',
    teacher_id BIGINT DEFAULT NULL COMMENT '授课教师',
    department_id BIGINT DEFAULT NULL COMMENT '开课院系',
    credit INT NOT NULL COMMENT '学分',
    hours INT NOT NULL COMMENT '学时',
    course_type TINYINT NOT NULL COMMENT '1必修/2选修/3公选',
    semester VARCHAR(20) NOT NULL COMMENT '开课学期',
    max_students INT DEFAULT 100 COMMENT '最大选课人数',
    description TEXT DEFAULT NULL COMMENT '课程描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1开课/0停课',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) COMMENT='课程表';

-- 成绩表
CREATE TABLE IF NOT EXISTS score (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL COMMENT '学生',
    course_id BIGINT NOT NULL COMMENT '课程',
    score_value DECIMAL(5,2) DEFAULT NULL COMMENT '分数',
    grade_level VARCHAR(10) DEFAULT NULL COMMENT '等级',
    semester VARCHAR(20) NOT NULL COMMENT '学期',
    score_type TINYINT NOT NULL DEFAULT 1 COMMENT '1期末/2补考/3重修',
    is_passed TINYINT DEFAULT 0 COMMENT '1及格/0不及格',
    remark VARCHAR(200) DEFAULT NULL COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    UNIQUE KEY uk_score (student_id, course_id, semester, score_type)
) COMMENT='成绩表';

-- 选课记录表
CREATE TABLE IF NOT EXISTS course_selection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL COMMENT '学生',
    course_id BIGINT NOT NULL COMMENT '课程',
    semester VARCHAR(20) NOT NULL COMMENT '学期',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1已选/0退选',
    selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '选课时间',
    dropped_at DATETIME DEFAULT NULL COMMENT '退选时间',
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    UNIQUE KEY uk_selection (student_id, course_id, semester)
) COMMENT='选课记录表';

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    role VARCHAR(20) NOT NULL COMMENT '角色: admin/teacher/student',
    ref_id BIGINT DEFAULT NULL COMMENT '关联业务表ID',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1启用/0禁用',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户表';

-- ===================== 初始化数据 =====================

-- 院系数据
INSERT INTO department (id, name, parent_id, dean, description) VALUES
(1, '计算机科学与技术学院', NULL, '张明远', '培养计算机领域高级人才'),
(2, '软件学院', NULL, '李建国', '培养软件工程专业技术人才'),
(3, '信息工程学院', NULL, '王志强', '培养信息技术领域综合人才'),
(4, '计算机科学与技术系', 1, '张明远', '计算机科学与技术本科专业'),
(5, '网络工程系', 1, '刘海燕', '网络工程本科专业'),
(6, '软件工程系', 2, '李建国', '软件工程本科专业'),
(7, '人工智能系', 2, '陈伟', '人工智能方向本科专业');

-- 教师数据
INSERT INTO teacher (id, name, employee_no, department_id, title, phone, email, status) VALUES
(1, '张明远', 'T20210001', 1, '教授', '13800138001', 'zhangmy@edu.cn', 1),
(2, '李建国', 'T20210002', 2, '教授', '13800138002', 'lijg@edu.cn', 1),
(3, '王志强', 'T20210003', 3, '副教授', '13800138003', 'wangzq@edu.cn', 1),
(4, '刘海燕', 'T20210004', 5, '副教授', '13800138004', 'liuhy@edu.cn', 1),
(5, '陈伟', 'T20210005', 7, '讲师', '13800138005', 'chenw@edu.cn', 1),
(6, '赵芳', 'T20210006', 4, '讲师', '13800138006', 'zhaof@edu.cn', 1),
(7, '杨帆', 'T20210007', 6, '教授', '13800138007', 'yangf@edu.cn', 1),
(8, '周敏', 'T20210008', 6, '副教授', '13800138008', 'zhoum@edu.cn', 1);

-- 班级数据
INSERT INTO class (id, name, department_id, advisor_id, grade, major, student_count) VALUES
(1, '计科2301班', 4, 6, '2023', '计算机科学与技术', 35),
(2, '计科2302班', 4, 1, '2023', '计算机科学与技术', 33),
(3, '软件2301班', 6, 7, '2023', '软件工程', 38),
(4, '软件2302班', 6, 8, '2023', '软件工程', 36),
(5, '网络2301班', 5, 4, '2023', '网络工程', 30),
(6, '计科2201班', 4, 6, '2022', '计算机科学与技术', 34),
(7, '软件2201班', 6, 7, '2022', '软件工程', 37);

-- 学生数据
INSERT INTO student (id, name, student_no, class_id, gender, enrollment_date, phone, email, status) VALUES
(1, '张三', '2023010001', 1, 1, '2023-09-01', '15900100001', 'zhangsan@stu.edu.cn', 1),
(2, '李四', '2023010002', 1, 2, '2023-09-01', '15900100002', 'lisi@stu.edu.cn', 1),
(3, '王五', '2023010003', 2, 1, '2023-09-01', '15900100003', 'wangwu@stu.edu.cn', 1),
(4, '赵六', '2023010004', 3, 2, '2023-09-01', '15900100004', 'zhaoliu@stu.edu.cn', 1),
(5, '钱七', '2023010005', 3, 1, '2023-09-01', '15900100005', 'qianqi@stu.edu.cn', 1),
(6, '孙八', '2023010006', 4, 2, '2023-09-01', '15900100006', 'sunba@stu.edu.cn', 1),
(7, '周九', '2023010007', 5, 1, '2023-09-01', '15900100007', 'zhoujiu@stu.edu.cn', 1),
(8, '吴十', '2023010008', 5, 2, '2023-09-01', '15900100008', 'wushi@stu.edu.cn', 1),
(9, '郑华', '2022010001', 6, 1, '2022-09-01', '15900100009', 'zhenghua@stu.edu.cn', 1),
(10, '冯丽', '2022010002', 7, 2, '2022-09-01', '15900100010', 'fengli@stu.edu.cn', 1);

-- 课程数据
INSERT INTO course (id, name, code, teacher_id, department_id, credit, hours, course_type, semester, max_students, description, status) VALUES
(1, '高等数学', 'MATH101', 1, 1, 4, 64, 1, '2023-2024-1', 200, '微积分基础课程', 1),
(2, 'Java程序设计', 'CS201', 6, 4, 3, 48, 1, '2023-2024-1', 100, 'Java语言基础与面向对象编程', 1),
(3, '数据结构', 'CS202', 1, 4, 4, 64, 1, '2023-2024-2', 100, '线性表、树、图等数据结构', 1),
(4, '软件工程', 'SE301', 7, 6, 3, 48, 1, '2023-2024-2', 100, '软件开发流程与方法', 1),
(5, '计算机网络', 'NE301', 4, 5, 3, 48, 1, '2023-2024-2', 80, 'TCP/IP协议与网络编程', 1),
(6, '人工智能导论', 'AI301', 5, 7, 2, 32, 2, '2023-2024-2', 60, 'AI基础概念与算法入门', 1),
(7, '数据库原理', 'CS303', 2, 1, 3, 48, 1, '2023-2024-2', 100, '关系数据库与SQL语言', 1),
(8, 'Web开发技术', 'SE302', 8, 6, 2, 32, 2, '2023-2024-2', 60, '前后端Web开发技术', 1);

-- 选课记录数据
INSERT INTO course_selection (student_id, course_id, semester, status) VALUES
(1, 1, '2023-2024-1', 1), (1, 2, '2023-2024-1', 1),
(2, 1, '2023-2024-1', 1), (2, 2, '2023-2024-1', 1),
(3, 1, '2023-2024-1', 1), (3, 2, '2023-2024-1', 1),
(4, 2, '2023-2024-1', 1), (4, 4, '2023-2024-1', 1),
(5, 2, '2023-2024-1', 1), (5, 4, '2023-2024-1', 1),
(6, 2, '2023-2024-1', 1), (6, 4, '2023-2024-1', 1),
(7, 2, '2023-2024-1', 1), (7, 5, '2023-2024-1', 1),
(8, 2, '2023-2024-1', 1), (8, 5, '2023-2024-1', 1),
(1, 3, '2023-2024-2', 1), (1, 7, '2023-2024-2', 1),
(2, 3, '2023-2024-2', 1), (2, 7, '2023-2024-2', 1),
(3, 3, '2023-2024-2', 1), (3, 5, '2023-2024-2', 1),
(4, 3, '2023-2024-2', 1), (4, 6, '2023-2024-2', 1),
(5, 3, '2023-2024-2', 1), (5, 8, '2023-2024-2', 1),
(9, 3, '2023-2024-2', 1), (9, 7, '2023-2024-2', 1),
(10, 3, '2023-2024-2', 1), (10, 8, '2023-2024-2', 1);

-- 成绩数据
INSERT INTO score (student_id, course_id, score_value, grade_level, semester, score_type, is_passed, remark) VALUES
(1, 1, 92.00, 'A', '2023-2024-1', 1, 1, NULL),
(1, 2, 88.50, 'B+', '2023-2024-1', 1, 1, NULL),
(2, 1, 85.00, 'B+', '2023-2024-1', 1, 1, NULL),
(2, 2, 91.00, 'A', '2023-2024-1', 1, 1, NULL),
(3, 1, 78.00, 'B', '2023-2024-1', 1, 1, NULL),
(3, 2, 82.00, 'B', '2023-2024-1', 1, 1, NULL),
(4, 2, 95.00, 'A', '2023-2024-1', 1, 1, NULL),
(4, 4, 87.00, 'B+', '2023-2024-1', 1, 1, NULL),
(5, 2, 72.00, 'B-', '2023-2024-1', 1, 1, NULL),
(5, 4, 68.00, 'C+', '2023-2024-1', 1, 1, NULL),
(6, 2, 90.00, 'A', '2023-2024-1', 1, 1, NULL),
(6, 4, 84.00, 'B', '2023-2024-1', 1, 1, NULL),
(7, 2, 55.00, 'F', '2023-2024-1', 1, 0, '需补考'),
(7, 5, 76.00, 'B', '2023-2024-1', 1, 1, NULL),
(8, 2, 63.00, 'C', '2023-2024-1', 1, 1, NULL),
(8, 5, 88.00, 'B+', '2023-2024-1', 1, 1, NULL),
(9, 1, 89.00, 'B+', '2023-2024-1', 1, 1, NULL),
(10, 1, 94.00, 'A', '2023-2024-1', 1, 1, NULL);

-- 用户数据 (密码: 123456)
INSERT INTO sys_user (username, password_hash, role, ref_id, status) VALUES
('admin', '$2a$10$sYimekaqjW5USVepZGo8a.rWcXKCZ2Gts8.8le1463yMYr/DGAz16', 'admin', NULL, 1),
('teacher1', '$2a$10$sYimekaqjW5USVepZGo8a.rWcXKCZ2Gts8.8le1463yMYr/DGAz16', 'teacher', 1, 1),
('teacher2', '$2a$10$sYimekaqjW5USVepZGo8a.rWcXKCZ2Gts8.8le1463yMYr/DGAz16', 'teacher', 7, 1),
('student1', '$2a$10$sYimekaqjW5USVepZGo8a.rWcXKCZ2Gts8.8le1463yMYr/DGAz16', 'student', 1, 1),
('student2', '$2a$10$sYimekaqjW5USVepZGo8a.rWcXKCZ2Gts8.8le1463yMYr/DGAz16', 'student', 4, 1);
