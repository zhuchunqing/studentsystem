package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.TeacherRequest;
import com.edu.entity.Teacher;
import com.edu.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public Page<Teacher> list(Long departmentId, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        if (departmentId != null) {
            return teacherRepository.findByDepartmentId(departmentId, pageRequest);
        }
        return teacherRepository.findAll(pageRequest);
    }

    public Teacher getById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("教师不存在"));
    }

    @Transactional
    public Teacher create(TeacherRequest request) {
        if (teacherRepository.existsByEmployeeNo(request.getEmployeeNo())) {
            throw new BusinessException("工号已存在");
        }
        Teacher teacher = new Teacher();
        teacher.setName(request.getName());
        teacher.setEmployeeNo(request.getEmployeeNo());
        teacher.setDepartmentId(request.getDepartmentId());
        teacher.setTitle(request.getTitle());
        teacher.setPhone(request.getPhone());
        teacher.setEmail(request.getEmail());
        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher update(Long id, TeacherRequest request) {
        Teacher teacher = getById(id);
        teacher.setName(request.getName());
        teacher.setEmployeeNo(request.getEmployeeNo());
        teacher.setDepartmentId(request.getDepartmentId());
        teacher.setTitle(request.getTitle());
        teacher.setPhone(request.getPhone());
        teacher.setEmail(request.getEmail());
        return teacherRepository.save(teacher);
    }

    @Transactional
    public void delete(Long id) {
        teacherRepository.deleteById(id);
    }
}
