package com.fonamif.backend.controller;

import com.fonamif.backend.model.Department;
import com.fonamif.backend.payload.response.MessageResponse;
import com.fonamif.backend.repository.DepartmentRepository;
import com.fonamif.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    UserRepository userRepository;

    // List all departments (accessible to all authenticated users)
    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(departments.stream().map(this::toDeptMap).collect(Collectors.toList()));
    }

    // Get single department
    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartment(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        Department dept = departmentRepository.findById(id).orElse(null);
        if (dept == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDeptMap(dept));
    }

    // Admin: Create department
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> body) {
        Department dept = new Department();
        dept.setName(body.get("name"));
        dept.setCode(body.get("code"));
        departmentRepository.save(dept);
        return ResponseEntity.ok(new MessageResponse("Department created successfully!"));
    }

    // Admin: Update department
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        Department dept = departmentRepository.findById(id).orElse(null);
        if (dept == null) {
            return ResponseEntity.notFound().build();
        }
        if (body.containsKey("name"))
            dept.setName(body.get("name"));
        if (body.containsKey("code"))
            dept.setCode(body.get("code"));
        departmentRepository.save(dept);
        return ResponseEntity.ok(new MessageResponse("Department updated successfully!"));
    }

    private Map<String, Object> toDeptMap(Department dept) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", dept.getId());
        map.put("name", dept.getName());
        map.put("code", dept.getCode());
        if (dept.getResponsable() != null) {
            map.put("responsableId", dept.getResponsable().getId());
            map.put("responsableName", dept.getResponsable().getFullName());
        }
        map.put("agentCount", userRepository.countByDepartmentId(dept.getId()));
        return map;
    }
}
