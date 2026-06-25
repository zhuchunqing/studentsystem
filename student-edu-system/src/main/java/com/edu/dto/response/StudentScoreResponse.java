package com.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class StudentScoreResponse {

    private Long scoreId;
    private String studentName;
    private String studentNo;
    private String courseName;
    private String courseCode;
    private BigDecimal scoreValue;
    private String gradeLevel;
    private String semester;
    private Integer scoreType;
    private Boolean isPassed;
}
