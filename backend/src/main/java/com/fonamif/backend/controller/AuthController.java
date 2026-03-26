package com.fonamif.backend.controller;

import com.fonamif.backend.model.Department;
import com.fonamif.backend.model.Role;
import com.fonamif.backend.model.User;
import com.fonamif.backend.payload.request.LoginRequest;
import com.fonamif.backend.payload.request.SignupRequest;
import com.fonamif.backend.payload.response.JwtResponse;
import com.fonamif.backend.payload.response.MessageResponse;
import com.fonamif.backend.repository.DepartmentRepository;
import com.fonamif.backend.repository.UserRepository;
import com.fonamif.backend.security.jwt.JwtUtils;
import com.fonamif.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Get department info for the user
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        Long departmentId = null;
        String departmentName = null;
        if (user != null && user.getDepartment() != null) {
            departmentId = user.getDepartment().getId();
            departmentName = user.getDepartment().getName();
        }

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName(),
                roles,
                departmentId,
                departmentName));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());

        String strRole = signUpRequest.getRole();
        Role role;

        if (strRole == null) {
            role = Role.AGENT;
        } else {
            switch (strRole.toLowerCase()) {
                case "admin":
                    role = Role.ADMIN;
                    break;
                case "director":
                    role = Role.DIRECTOR;
                    break;
                case "guard":
                    role = Role.GUARD;
                    break;
                default:
                    role = Role.AGENT;
            }
        }
        user.setRole(role);

        // Assign department if provided
        if (signUpRequest.getDepartmentId() != null) {
            Long deptId = signUpRequest.getDepartmentId();
            Department dept = departmentRepository.findById(deptId).orElse(null);
            user.setDepartment(dept);
        }

        // Generate QR code data for identification
        user.setQrCodeData("QR-" + signUpRequest.getUsername());
        user.setFingerprintTemplate("BIO-" + signUpRequest.getUsername());
        user.setBarcodeData("BAR-" + signUpRequest.getUsername());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
