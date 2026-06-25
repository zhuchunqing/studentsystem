package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.TeacherRequest;
import com.edu.entity.Teacher;
import com.edu.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "教师管理")
@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @Operation(summary = "获取教师列表")
    @GetMapping
    public Result<PageResult<Teacher>> list(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<Teacher> page = teacherService.list(departmentId, pageNum, pageSize);
        PageResult<Teacher> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取教师详情")
    @GetMapping("/{id}")
    public Result<Teacher> getById(@PathVariable Long id) {
        return Result.success(teacherService.getById(id));
    }

    @Operation(summary = "创建教师")
    @PostMapping
    public Result<Teacher> create(@Valid @RequestBody TeacherRequest request) {
        return Result.success(teacherService.create(request));
    }

    @Operation(summary = "更新教师")
    @PutMapping("/{id}")
    public Result<Teacher> update(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        return Result.success(teacherService.update(id, request));
    }

    @Operation(summary = "删除教师")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return Result.success();
    }
}
