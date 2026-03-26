package com.fonamif.backend.controller;

import com.fonamif.backend.repository.UserRepository;
import com.fonamif.backend.security.jwt.JwtUtils;
import com.fonamif.backend.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend is reachable!");
        response.put("userCount", userRepository.count());
        response.put("usernames", userRepository.findAll().stream()
                .map(u -> u.getUsername())
                .collect(Collectors.toList()));
        
        // Diagnostic for admin user
        userRepository.findByUsername("admin").ifPresent(user -> {
            response.put("adminExists", true);
            response.put("adminPasswordMatches", passwordEncoder.matches("admin123", user.getPassword()));
        });
        
        return response;
    }

    @GetMapping("/test-jwt")
    public Map<String, Object> testJwt() {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername("admin");
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            
            String token = jwtUtils.generateJwtToken(auth);
            response.put("status", "OK");
            response.put("tokenGenerated", true);
            response.put("tokenLength", token.length());
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("tokenGenerated", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
        }
        return response;
    }
}
