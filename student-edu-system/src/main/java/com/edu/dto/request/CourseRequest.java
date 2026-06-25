package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {

    @NotBlank(message = "课程名称不能为空")
    private String name;

    @NotBlank(message = "课程编码不能为空")
    private String code;

    private Long teacherId;

    private Long departmentId;

    @NotNull(message = "学分不能为空")
    private Integer credit;

    @NotNull(message = "学时不能为空")
    private Integer hours;

    @NotNull(message = "课程类型不能为空")
    private Integer courseType;

    @NotBlank(message = "学期不能为空")
    private String semester;

    private Integer maxStudents;

    private String description;
}
