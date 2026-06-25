package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentRequest {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "学号不能为空")
    private String studentNo;

    private Long classId;

    private Integer gender;

    @NotNull(message = "入学日期不能为空")
    private LocalDate enrollmentDate;

    private String phone;

    private String email;
}
