package com.edu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "score", uniqueConstraints = {
        @UniqueConstraint(name = "uk_score", columnNames = {"student_id", "course_id", "semester", "score_type"})
})
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "score_value", precision = 5, scale = 2)
    private BigDecimal scoreValue;

    @Column(name = "grade_level", length = 10)
    private String gradeLevel;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(name = "score_type", nullable = false)
    private Integer scoreType = 1;

    @Column(name = "is_passed")
    private Integer isPassed = 0;

    private String remark;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
