package com.edu.repository;

import com.edu.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Page<Teacher> findByDepartmentId(Long departmentId, Pageable pageable);

    boolean existsByEmployeeNo(String employeeNo);
}
