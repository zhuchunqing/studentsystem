package com.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ScoreStatisticsResponse {

    private long totalStudents;
    private double averageScore;
    private double maxScore;
    private double minScore;
    private double passRate;
    private Map<String, Long> gradeDistribution;
}
