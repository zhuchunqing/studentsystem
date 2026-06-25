package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ScoreBatchRequest {

    @NotNull(message = "课程ID不能为空")
    private Long courseId;

    @NotBlank(message = "学期不能为空")
    private String semester;

    private Integer scoreType = 1;

    @NotEmpty(message = "成绩记录不能为空")
    private List<ScoreItem> records;

    @Data
    public static class ScoreItem {
        private Long studentId;
        private BigDecimal scoreValue;
    }
}
