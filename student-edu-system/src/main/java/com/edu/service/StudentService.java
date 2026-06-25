package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.StudentRequest;
import com.edu.entity.Student;
import com.edu.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public Page<Student> list(Long classId, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        if (classId != null) {
            return studentRepository.findByClassId(classId, pageRequest);
        }
        return studentRepository.findAll(pageRequest);
    }

    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("学生不存在"));
    }

    @Transactional
    public Student create(StudentRequest request) {
        if (studentRepository.existsByStudentNo(request.getStudentNo())) {
            throw new BusinessException("学号已存在");
        }
        Student student = new Student();
        student.setName(request.getName());
        student.setStudentNo(request.getStudentNo());
        student.setClassId(request.getClassId());
        student.setGender(request.getGender());
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setPhone(request.getPhone());
        student.setEmail(request.getEmail());
        return studentRepository.save(student);
    }

    @Transactional
    public Student update(Long id, StudentRequest request) {
        Student student = getById(id);
        student.setName(request.getName());
        student.setStudentNo(request.getStudentNo());
        student.setClassId(request.getClassId());
        student.setGender(request.getGender());
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setPhone(request.getPhone());
        student.setEmail(request.getEmail());
        return studentRepository.save(student);
    }

    @Transactional
    public void delete(Long id) {
        studentRepository.deleteById(id);
    }

    @Transactional
    public List<Student> batchImport(List<StudentRequest> requests) {
        return requests.stream().map(this::create).toList();
    }
}
