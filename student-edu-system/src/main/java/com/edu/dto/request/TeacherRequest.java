package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeacherRequest {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "工号不能为空")
    private String employeeNo;

    private Long departmentId;

    private String title;

    private String phone;

    private String email;
}
