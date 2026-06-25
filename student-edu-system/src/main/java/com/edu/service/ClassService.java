package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.ClassRequest;
import com.edu.entity.Clazz;
import com.edu.repository.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;

    public Page<Clazz> list(Long departmentId, int pageNum, int pageSize) {
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);
        if (departmentId != null) {
            return classRepository.findByDepartmentId(departmentId, pageRequest);
        }
        return classRepository.findAll(pageRequest);
    }

    public Clazz getById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new BusinessException("班级不存在"));
    }

    @Transactional
    public Clazz create(ClassRequest request) {
        Clazz clazz = new Clazz();
        clazz.setName(request.getName());
        clazz.setDepartmentId(request.getDepartmentId());
        clazz.setAdvisorId(request.getAdvisorId());
        clazz.setGrade(request.getGrade());
        clazz.setMajor(request.getMajor());
        return classRepository.save(clazz);
    }

    @Transactional
    public Clazz update(Long id, ClassRequest request) {
        Clazz clazz = getById(id);
        clazz.setName(request.getName());
        clazz.setDepartmentId(request.getDepartmentId());
        clazz.setAdvisorId(request.getAdvisorId());
        clazz.setGrade(request.getGrade());
        clazz.setMajor(request.getMajor());
        return classRepository.save(clazz);
    }

    @Transactional
    public void delete(Long id) {
        classRepository.deleteById(id);
    }
}
