package com.edu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course_selection", uniqueConstraints = {
        @UniqueConstraint(name = "uk_selection", columnNames = {"student_id", "course_id", "semester"})
})
public class CourseSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "selected_at", nullable = false)
    private LocalDateTime selectedAt;

    @Column(name = "dropped_at")
    private LocalDateTime droppedAt;

    @PrePersist
    protected void onCreate() {
        selectedAt = LocalDateTime.now();
    }
}
