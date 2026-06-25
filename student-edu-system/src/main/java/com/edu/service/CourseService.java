package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.CourseRequest;
import com.edu.entity.Course;
import com.edu.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public Page<Course> list(Long departmentId, Integer courseType, String semester, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        return courseRepository.findByFilters(departmentId, courseType, semester, pageRequest);
    }

    public Course getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("课程不存在"));
    }

    @Transactional
    public Course create(CourseRequest request) {
        Course course = new Course();
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setTeacherId(request.getTeacherId());
        course.setDepartmentId(request.getDepartmentId());
        course.setCredit(request.getCredit());
        course.setHours(request.getHours());
        course.setCourseType(request.getCourseType());
        course.setSemester(request.getSemester());
        course.setMaxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 100);
        course.setDescription(request.getDescription());
        return courseRepository.save(course);
    }

    @Transactional
    public Course update(Long id, CourseRequest request) {
        Course course = getById(id);
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setTeacherId(request.getTeacherId());
        course.setDepartmentId(request.getDepartmentId());
        course.setCredit(request.getCredit());
        course.setHours(request.getHours());
        course.setCourseType(request.getCourseType());
        course.setSemester(request.getSemester());
        course.setMaxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 100);
        course.setDescription(request.getDescription());
        return courseRepository.save(course);
    }

    @Transactional
    public void delete(Long id) {
        courseRepository.deleteById(id);
    }
}
