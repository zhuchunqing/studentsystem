package com.edu.repository;

import com.edu.entity.Clazz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassRepository extends JpaRepository<Clazz, Long> {

    Page<Clazz> findByDepartmentId(Long departmentId, Pageable pageable);

    long countByDepartmentId(Long departmentId);
}
