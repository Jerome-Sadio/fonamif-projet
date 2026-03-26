package com.fonamif.backend;

import com.fonamif.backend.model.Department;
import com.fonamif.backend.model.Role;
import com.fonamif.backend.model.User;
import com.fonamif.backend.repository.DepartmentRepository;
import com.fonamif.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Clear all existing data if somehow create-drop didn't or for cleanliness
        userRepository.deleteAll();
        departmentRepository.deleteAll();

        // Create a default direction
        Department dgDept = new Department();
        dgDept.setName("Direction Générale");
        dgDept.setCode("DG");
        dgDept = departmentRepository.save(dgDept);

        // ============================================================
        // Requested Users
        // ============================================================

        // 1. Admin
        createUser("admin", "admin123", "Administrateur", Role.ADMIN, dgDept);

        // 2. Garde
        createUser("garde", "garde123", "Agent de Garde", Role.GUARD, dgDept);

        // 3. Directeur
        createUser("directeur", "directeur123", "Directeur", Role.DIRECTOR, dgDept);

        // 4. Agent
        createUser("agent", "agent123", "Agent Test", Role.AGENT, dgDept);

        System.out.println("============================================");
        System.out.println("  FONAMIF Database Reset & Initialized!");
        System.out.println("  Users created: admin, garde, directeur, agent");
        System.out.println("============================================");
    }

    private User createUser(String username, String password, String fullName, Role role, Department department) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        user.setDepartment(department);
        user.setQrCodeData("QR-" + username);
        user.setFingerprintTemplate("BIO-" + username);
        user.setBarcodeData("BAR-" + username);
        return userRepository.save(user);
    }
}
