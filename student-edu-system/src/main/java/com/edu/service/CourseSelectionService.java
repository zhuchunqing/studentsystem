package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.CourseSelectionRequest;
import com.edu.entity.Course;
import com.edu.entity.CourseSelection;
import com.edu.repository.CourseRepository;
import com.edu.repository.CourseSelectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseSelectionService {

    private final CourseSelectionRepository courseSelectionRepository;
    private final CourseRepository courseRepository;

    public Page<CourseSelection> listByCourse(Long courseId, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        return courseSelectionRepository.findByCourseIdAndStatus(courseId, 1, pageRequest);
    }

    public Page<CourseSelection> list(int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        return courseSelectionRepository.findAll(pageRequest);
    }

    @Transactional
    public CourseSelection select(CourseSelectionRequest request) {
        // Check if already selected
        if (courseSelectionRepository.existsByStudentIdAndCourseIdAndSemesterAndStatus(
                request.getStudentId(), request.getCourseId(), request.getSemester(), 1)) {
            throw new BusinessException("已选择该课程");
        }

        // Check course capacity
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new BusinessException("课程不存在"));
        if (course.getStatus() != 1) {
            throw new BusinessException("课程未开课");
        }

        long currentCount = courseSelectionRepository.countByCourseIdAndSemesterAndStatus(
                request.getCourseId(), request.getSemester(), 1);
        if (course.getMaxStudents() != null && currentCount >= course.getMaxStudents()) {
            throw new BusinessException("课程选课人数已满");
        }

        CourseSelection selection = new CourseSelection();
        selection.setStudentId(request.getStudentId());
        selection.setCourseId(request.getCourseId());
        selection.setSemester(request.getSemester());
        selection.setStatus(1);
        return courseSelectionRepository.save(selection);
    }

    @Transactional
    public void drop(Long id) {
        CourseSelection selection = courseSelectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("选课记录不存在"));
        if (selection.getStatus() != 1) {
            throw new BusinessException("该课程已退选");
        }
        selection.setStatus(0);
        selection.setDroppedAt(LocalDateTime.now());
        courseSelectionRepository.save(selection);
    }
}
