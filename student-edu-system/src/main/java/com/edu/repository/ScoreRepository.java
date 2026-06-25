package com.edu.repository;

import com.edu.entity.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findByStudentIdAndSemester(Long studentId, String semester);

    List<Score> findByCourseIdAndSemester(Long courseId, String semester);

    @Query("SELECT s FROM Score s WHERE " +
            "(:studentId IS NULL OR s.studentId = :studentId) " +
            "AND (:courseId IS NULL OR s.courseId = :courseId) " +
            "AND (:classId IS NULL OR s.studentId IN (SELECT st.id FROM Student st WHERE st.classId = :classId)) " +
            "AND (:semester IS NULL OR s.semester = :semester)")
    Page<Score> findByFilters(@Param("studentId") Long studentId,
                              @Param("courseId") Long courseId,
                              @Param("classId") Long classId,
                              @Param("semester") String semester,
                              Pageable pageable);

    @Query("SELECT AVG(s.scoreValue) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1")
    Double getAverageScore(@Param("courseId") Long courseId, @Param("semester") String semester);

    @Query("SELECT MAX(s.scoreValue) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1")
    Double getMaxScore(@Param("courseId") Long courseId, @Param("semester") String semester);

    @Query("SELECT MIN(s.scoreValue) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1")
    Double getMinScore(@Param("courseId") Long courseId, @Param("semester") String semester);

    @Query("SELECT COUNT(s) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1 AND s.isPassed = 1")
    Long countPassed(@Param("courseId") Long courseId, @Param("semester") String semester);

    @Query("SELECT COUNT(s) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1")
    Long countTotal(@Param("courseId") Long courseId, @Param("semester") String semester);

    @Query("SELECT s.gradeLevel, COUNT(s) FROM Score s WHERE s.courseId = :courseId AND s.semester = :semester AND s.scoreType = 1 GROUP BY s.gradeLevel ORDER BY s.gradeLevel")
    List<Object[]> getGradeDistribution(@Param("courseId") Long courseId, @Param("semester") String semester);
}
