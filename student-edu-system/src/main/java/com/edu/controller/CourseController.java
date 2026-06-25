package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.CourseRequest;
import com.edu.entity.Course;
import com.edu.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "课程管理")
@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @Operation(summary = "获取课程列表")
    @GetMapping
    public Result<PageResult<Course>> list(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer courseType,
            @RequestParam(required = false) String semester,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<Course> page = courseService.list(departmentId, courseType, semester, pageNum, pageSize);
        PageResult<Course> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取课程详情")
    @GetMapping("/{id}")
    public Result<Course> getById(@PathVariable Long id) {
        return Result.success(courseService.getById(id));
    }

    @Operation(summary = "创建课程")
    @PostMapping
    public Result<Course> create(@Valid @RequestBody CourseRequest request) {
        return Result.success(courseService.create(request));
    }

    @Operation(summary = "更新课程")
    @PutMapping("/{id}")
    public Result<Course> update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return Result.success(courseService.update(id, request));
    }

    @Operation(summary = "删除课程")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return Result.success();
    }
}
