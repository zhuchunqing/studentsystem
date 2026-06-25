package com.edu.controller;

import com.edu.common.PageResult;
import com.edu.common.Result;
import com.edu.dto.request.ScoreBatchRequest;
import com.edu.dto.request.ScoreRequest;
import com.edu.dto.response.ScoreStatisticsResponse;
import com.edu.dto.response.StudentScoreResponse;
import com.edu.entity.Score;
import com.edu.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "成绩管理")
@RestController
@RequestMapping("/api/v1/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @Operation(summary = "获取成绩列表")
    @GetMapping
    public Result<PageResult<StudentScoreResponse>> list(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String semester,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<Score> page = scoreService.list(studentId, courseId, classId, semester, pageNum, pageSize);
        var responses = page.getContent().stream().map(scoreService::toStudentScoreResponse).toList();
        PageResult<StudentScoreResponse> result = new PageResult<>(responses, page.getTotalElements(), pageNum, pageSize);
        return Result.success(result);
    }

    @Operation(summary = "获取成绩详情")
    @GetMapping("/{id}")
    public Result<StudentScoreResponse> getById(@PathVariable Long id) {
        return Result.success(scoreService.toStudentScoreResponse(scoreService.getById(id)));
    }

    @Operation(summary = "录入单条成绩")
    @PostMapping
    public Result<Score> create(@Valid @RequestBody ScoreRequest request) {
        return Result.success(scoreService.create(request));
    }

    @Operation(summary = "批量录入成绩")
    @PostMapping("/batch")
    public Result<Void> batchCreate(@Valid @RequestBody ScoreBatchRequest request) {
        scoreService.batchCreate(request);
        return Result.success();
    }

    @Operation(summary = "修改成绩")
    @PutMapping("/{id}")
    public Result<Score> update(@PathVariable Long id, @Valid @RequestBody ScoreRequest request) {
        return Result.success(scoreService.update(id, request));
    }

    @Operation(summary = "审核成绩")
    @PutMapping("/{id}/audit")
    public Result<Score> audit(@PathVariable Long id, @RequestParam boolean approved) {
        return Result.success(scoreService.audit(id, approved));
    }

    @Operation(summary = "成绩统计分析")
    @GetMapping("/statistics")
    public Result<ScoreStatisticsResponse> statistics(
            @RequestParam Long courseId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String semester) {
        return Result.success(scoreService.getStatistics(courseId, classId, semester));
    }
}
