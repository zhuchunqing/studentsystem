package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClassRequest {

    @NotBlank(message = "班级名称不能为空")
    private String name;

    private Long departmentId;

    private Long advisorId;

    @NotBlank(message = "年级不能为空")
    private String grade;

    private String major;
}
