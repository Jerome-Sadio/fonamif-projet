package com.fonamif.backend.controller;

import com.fonamif.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend is reachable!");
        response.put("userCount", userRepository.count());
        response.put("usernames", userRepository.findAll().stream()
                .map(u -> u.getUsername())
                .collect(java.util.stream.Collectors.toList()));
        
        // Diagnostic for admin user
        userRepository.findByUsername("admin").ifPresent(user -> {
            response.put("adminExists", true);
            response.put("adminPasswordMatches", passwordEncoder.matches("admin123", user.getPassword()));
        });
        
        return response;
    }
}
