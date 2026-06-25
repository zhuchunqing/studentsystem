package com.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DepartmentTreeResponse {

    private Long id;
    private String name;
    private String dean;
    private List<DepartmentTreeResponse> children;
}
