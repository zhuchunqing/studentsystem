package com.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentRequest {

    @NotBlank(message = "院系名称不能为空")
    private String name;

    private Long parentId;

    private String dean;

    private String description;
}
