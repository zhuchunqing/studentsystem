package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.DepartmentRequest;
import com.edu.dto.response.DepartmentTreeResponse;
import com.edu.entity.Department;
import com.edu.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentTreeResponse> getDepartmentTree() {
        List<Department> all = departmentRepository.findAll();
        Map<Long, List<Department>> childrenMap = all.stream()
                .filter(d -> d.getParentId() != null)
                .collect(Collectors.groupingBy(Department::getParentId));

        List<Department> roots = all.stream()
                .filter(d -> d.getParentId() == null)
                .toList();

        return roots.stream()
                .map(d -> toTree(d, childrenMap))
                .toList();
    }

    private DepartmentTreeResponse toTree(Department dept, Map<Long, List<Department>> childrenMap) {
        List<Department> children = childrenMap.getOrDefault(dept.getId(), new ArrayList<>());
        List<DepartmentTreeResponse> childNodes = children.stream()
                .map(c -> toTree(c, childrenMap))
                .toList();
        return new DepartmentTreeResponse(dept.getId(), dept.getName(), dept.getDean(), childNodes);
    }

    public Department getById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("院系不存在"));
    }

    @Transactional
    public Department create(DepartmentRequest request) {
        Department dept = new Department();
        dept.setName(request.getName());
        dept.setParentId(request.getParentId());
        dept.setDean(request.getDean());
        dept.setDescription(request.getDescription());
        return departmentRepository.save(dept);
    }

    @Transactional
    public Department update(Long id, DepartmentRequest request) {
        Department dept = getById(id);
        dept.setName(request.getName());
        dept.setParentId(request.getParentId());
        dept.setDean(request.getDean());
        dept.setDescription(request.getDescription());
        return departmentRepository.save(dept);
    }

    @Transactional
    public void delete(Long id) {
        List<Department> children = departmentRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new BusinessException("该院系下有子院系，无法删除");
        }
        departmentRepository.deleteById(id);
    }
}
