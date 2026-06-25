package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.ScoreBatchRequest;
import com.edu.dto.request.ScoreRequest;
import com.edu.dto.response.ScoreStatisticsResponse;
import com.edu.dto.response.StudentScoreResponse;
import com.edu.entity.Course;
import com.edu.entity.Score;
import com.edu.entity.Student;
import com.edu.repository.CourseRepository;
import com.edu.repository.ScoreRepository;
import com.edu.repository.StudentRepository;
import com.edu.util.GradeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public Page<Score> list(Long studentId, Long courseId, Long classId, String semester, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        return scoreRepository.findByFilters(studentId, courseId, classId, semester, pageRequest);
    }

    public Score getById(Long id) {
        return scoreRepository.findById(id)
                .orElseThrow(() -> new BusinessException("成绩记录不存在"));
    }

    @Transactional
    public Score create(ScoreRequest request) {
        Score score = new Score();
        score.setStudentId(request.getStudentId());
        score.setCourseId(request.getCourseId());
        score.setSemester(request.getSemester());
        score.setScoreType(request.getScoreType() != null ? request.getScoreType() : 1);
        score.setRemark(request.getRemark());
        if (request.getScoreValue() != null) {
            fillScoreFields(score, request.getScoreValue());
        }
        return scoreRepository.save(score);
    }

    @Transactional
    public void batchCreate(ScoreBatchRequest request) {
        for (ScoreBatchRequest.ScoreItem item : request.getRecords()) {
            Score score = new Score();
            score.setStudentId(item.getStudentId());
            score.setCourseId(request.getCourseId());
            score.setSemester(request.getSemester());
            score.setScoreType(request.getScoreType());
            if (item.getScoreValue() != null) {
                fillScoreFields(score, item.getScoreValue());
            }
            scoreRepository.save(score);
        }
    }

    @Transactional
    public Score update(Long id, ScoreRequest request) {
        Score score = getById(id);
        score.setStudentId(request.getStudentId());
        score.setCourseId(request.getCourseId());
        score.setSemester(request.getSemester());
        score.setScoreType(request.getScoreType() != null ? request.getScoreType() : score.getScoreType());
        score.setRemark(request.getRemark());
        if (request.getScoreValue() != null) {
            fillScoreFields(score, request.getScoreValue());
        }
        return scoreRepository.save(score);
    }

    @Transactional
    public Score audit(Long id, boolean approved) {
        Score score = getById(id);
        if (approved) {
            // Mark as published — in a real system, add a status field
            // For now, audit just validates the score is set
            if (score.getScoreValue() == null) {
                throw new BusinessException("成绩分数未填写，无法审核通过");
            }
        }
        return score;
    }

    public ScoreStatisticsResponse getStatistics(Long courseId, Long classId, String semester) {
        Long targetCourse = courseId;
        if (targetCourse == null) {
            throw new BusinessException("请指定课程ID进行统计");
        }

        Double avg = scoreRepository.getAverageScore(targetCourse, semester);
        Double max = scoreRepository.getMaxScore(targetCourse, semester);
        Double min = scoreRepository.getMinScore(targetCourse, semester);
        Long passed = scoreRepository.countPassed(targetCourse, semester);
        Long total = scoreRepository.countTotal(targetCourse, semester);

        List<Object[]> distribution = scoreRepository.getGradeDistribution(targetCourse, semester);
        Map<String, Long> gradeMap = new HashMap<>();
        for (Object[] row : distribution) {
            gradeMap.put((String) row[0], (Long) row[1]);
        }

        double passRate = total > 0 ? (double) passed / total : 0;

        return new ScoreStatisticsResponse(
                total,
                avg != null ? avg : 0,
                max != null ? max : 0,
                min != null ? min : 0,
                passRate,
                gradeMap
        );
    }

    private void fillScoreFields(Score score, BigDecimal scoreValue) {
        score.setScoreValue(scoreValue);
        double val = scoreValue.doubleValue();
        score.setGradeLevel(GradeUtil.toGradeLevel(val));
        score.setIsPassed(GradeUtil.isPassed(val) ? 1 : 0);
    }

    public StudentScoreResponse toStudentScoreResponse(Score score) {
        Student student = studentRepository.findById(score.getStudentId()).orElse(null);
        Course course = courseRepository.findById(score.getCourseId()).orElse(null);

        return new StudentScoreResponse(
                score.getId(),
                student != null ? student.getName() : null,
                student != null ? student.getStudentNo() : null,
                course != null ? course.getName() : null,
                course != null ? course.getCode() : null,
                score.getScoreValue(),
                score.getGradeLevel(),
                score.getSemester(),
                score.getScoreType(),
                score.getIsPassed() != null && score.getIsPassed() == 1
        );
    }
}
