package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.CourseSelectionRequest;
import com.edu.entity.CourseSelection;
import com.edu.service.CourseSelectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "选课管理")
@RestController
@RequestMapping("/api/v1/course-selections")
@RequiredArgsConstructor
public class CourseSelectionController {

    private final CourseSelectionService courseSelectionService;

    @Operation(summary = "获取选课记录列表")
    @GetMapping
    public Result<PageResult<CourseSelection>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<CourseSelection> page = courseSelectionService.list(pageNum, pageSize);
        PageResult<CourseSelection> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取课程选课学生列表")
    @GetMapping("/courses/{courseId}/selections")
    public Result<PageResult<CourseSelection>> listByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<CourseSelection> page = courseSelectionService.listByCourse(courseId, pageNum, pageSize);
        PageResult<CourseSelection> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "学生选课")
    @PostMapping
    public Result<CourseSelection> select(@Valid @RequestBody CourseSelectionRequest request) {
        return Result.success(courseSelectionService.select(request));
    }

    @Operation(summary = "学生退选")
    @PutMapping("/{id}/drop")
    public Result<Void> drop(@PathVariable Long id) {
        courseSelectionService.drop(id);
        return Result.success();
    }
}
