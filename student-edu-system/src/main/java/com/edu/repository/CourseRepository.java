package com.edu.repository;

import com.edu.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Page<Course> findByDepartmentIdAndCourseTypeAndSemester(
            Long departmentId, Integer courseType, String semester, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE (:departmentId IS NULL OR c.departmentId = :departmentId) " +
            "AND (:courseType IS NULL OR c.courseType = :courseType) " +
            "AND (:semester IS NULL OR c.semester = :semester)")
    Page<Course> findByFilters(@Param("departmentId") Long departmentId,
                              @Param("courseType") Integer courseType,
                              @Param("semester") String semester,
                              Pageable pageable);
}
