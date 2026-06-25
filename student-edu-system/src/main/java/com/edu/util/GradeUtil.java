package com.edu.util;

public class GradeUtil {

    public static String toGradeLevel(double score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    public static boolean isPassed(double score) {
        return score >= 60;
    }
}
