package com.edu.repository;

import com.edu.entity.CourseSelection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseSelectionRepository extends JpaRepository<CourseSelection, Long> {

    Page<CourseSelection> findByCourseIdAndStatus(Long courseId, Integer status, Pageable pageable);

    boolean existsByStudentIdAndCourseIdAndSemesterAndStatus(Long studentId, Long courseId, String semester, Integer status);

    long countByCourseIdAndSemesterAndStatus(Long courseId, String semester, Integer status);
}
