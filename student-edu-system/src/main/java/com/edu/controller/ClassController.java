package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.ClassRequest;
import com.edu.entity.Clazz;
import com.edu.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "班级管理")
@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @Operation(summary = "获取班级列表")
    @GetMapping
    public Result<PageResult<Clazz>> list(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<Clazz> page = classService.list(departmentId, pageNum, pageSize);
        PageResult<Clazz> result = new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取班级详情")
    @GetMapping("/{id}")
    public Result<Clazz> getById(@PathVariable Long id) {
        return Result.success(classService.getById(id));
    }

    @Operation(summary = "创建班级")
    @PostMapping
    public Result<Clazz> create(@Valid @RequestBody ClassRequest request) {
        return Result.success(classService.create(request));
    }

    @Operation(summary = "更新班级")
    @PutMapping("/{id}")
    public Result<Clazz> update(@PathVariable Long id, @Valid @RequestBody ClassRequest request) {
        return Result.success(classService.update(id, request));
    }

    @Operation(summary = "删除班级")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return Result.success();
    }
}
