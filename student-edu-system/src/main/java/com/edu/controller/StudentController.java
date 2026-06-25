package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.StudentRequest;
import com.edu.entity.Student;
import com.edu.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "学生管理")
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "获取学生列表")
    @GetMapping
    public Result<PageResult<Student>> list(
            @RequestParam(required = false) Long classId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<Student> page = studentService.list(classId, pageNum, pageSize);
        PageResult<Student> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取学生详情")
    @GetMapping("/{id}")
    public Result<Student> getById(@PathVariable Long id) {
        return Result.success(studentService.getById(id));
    }

    @Operation(summary = "创建学生")
    @PostMapping
    public Result<Student> create(@Valid @RequestBody StudentRequest request) {
        return Result.success(studentService.create(request));
    }

    @Operation(summary = "更新学生")
    @PutMapping("/{id}")
    public Result<Student> update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return Result.success(studentService.update(id, request));
    }

    @Operation(summary = "删除学生")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return Result.success();
    }

    @Operation(summary = "批量导入学生")
    @PostMapping("/import")
    public Result<List<Student>> batchImport(@Valid @RequestBody List<StudentRequest> requests) {
        return Result.success(studentService.batchImport(requests));
    }
}
