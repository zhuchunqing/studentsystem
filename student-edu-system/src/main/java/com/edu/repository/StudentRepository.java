package com.edu.repository;

import com.edu.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Page<Student> findByClassId(Long classId, Pageable pageable);

    boolean existsByStudentNo(String studentNo);
}
