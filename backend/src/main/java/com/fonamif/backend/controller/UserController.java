package com.fonamif.backend.controller;

import com.fonamif.backend.model.User;
import com.fonamif.backend.payload.response.MessageResponse;
import com.fonamif.backend.repository.DepartmentRepository;
import com.fonamif.backend.repository.UserRepository;
import com.fonamif.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    // Admin: List all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users.stream().map(this::toUserMap).collect(Collectors.toList()));
    }

    // Admin or Director: List users by department
    @GetMapping("/department/{deptId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DIRECTOR')")
    public ResponseEntity<?> getUsersByDepartment(@PathVariable Long deptId) {
        List<User> users = userRepository.findByDepartmentId(deptId);
        return ResponseEntity.ok(users.stream().map(this::toUserMap).collect(Collectors.toList()));
    }

    // Agent: Update own profile (email, phone, fullName)
    @PutMapping("/profile")
    @PreAuthorize("hasRole('AGENT') or hasRole('DIRECTOR') or hasRole('ADMIN') or hasRole('GUARD')")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> updates, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setFullName(updates.get("fullName"));
        }
        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }

    // Get current user profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        return ResponseEntity.ok(toUserMap(user));
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("fullName", user.getFullName());
        map.put("role", user.getRole().name());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("qrCodeData", user.getQrCodeData());
        if (user.getDepartment() != null) {
            map.put("departmentId", user.getDepartment().getId());
            map.put("departmentName", user.getDepartment().getName());
            map.put("departmentCode", user.getDepartment().getCode());
        }
        return map;
    }
}
