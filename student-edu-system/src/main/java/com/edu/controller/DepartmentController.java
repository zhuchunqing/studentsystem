package com.edu.controller;

import com.edu.common.Result;
import com.edu.dto.request.DepartmentRequest;
import com.edu.dto.response.DepartmentTreeResponse;
import com.edu.entity.Department;
import com.edu.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "院系管理")
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(summary = "获取院系树形列表")
    @GetMapping
    public Result<List<DepartmentTreeResponse>> listTree() {
        return Result.success(departmentService.getDepartmentTree());
    }

    @Operation(summary = "获取院系详情")
    @GetMapping("/{id}")
    public Result<Department> getById(@PathVariable Long id) {
        return Result.success(departmentService.getById(id));
    }

    @Operation(summary = "创建院系")
    @PostMapping
    public Result<Department> create(@Valid @RequestBody DepartmentRequest request) {
        return Result.success(departmentService.create(request));
    }

    @Operation(summary = "更新院系")
    @PutMapping("/{id}")
    public Result<Department> update(@PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        return Result.success(departmentService.update(id, request));
    }

    @Operation(summary = "删除院系")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return Result.success();
    }
}
