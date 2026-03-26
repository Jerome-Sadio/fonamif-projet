package com.fonamif.backend.controller;

import com.fonamif.backend.model.*;
import com.fonamif.backend.payload.response.DashboardStats;
import com.fonamif.backend.payload.response.ScanResponse;
import com.fonamif.backend.repository.AttendanceRecordRepository;
import com.fonamif.backend.repository.DepartmentRepository;
import com.fonamif.backend.repository.UserRepository;
import com.fonamif.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    // ===== ADMIN Dashboard: Global stats across all FONAMIF =====
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStats getAdminStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long totalAgents = userRepository.findByRole(Role.AGENT).size();
        long presentCount = attendanceRecordRepository.countByTimestampBetweenAndType(startOfDay, endOfDay,
                AttendanceType.IN);
        long lateCount = attendanceRecordRepository.countByTimestampBetweenAndStatus(startOfDay, endOfDay, "LATE");
        long absentCount = Math.max(0, totalAgents - presentCount);

        DashboardStats stats = new DashboardStats(totalAgents, presentCount, lateCount, absentCount);

        // Recent activity logs
        List<AttendanceRecord> recentRecords = attendanceRecordRepository.findTop20ByOrderByTimestampDesc();
        List<DashboardStats.RecentLog> logs = recentRecords.stream().map(r -> new DashboardStats.RecentLog(
                r.getId(),
                r.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                r.getUser().getFullName(),
                r.getType() == AttendanceType.IN ? "ENTRÉE" : "SORTIE",
                r.getUser().getDepartment() != null ? r.getUser().getDepartment().getCode() : "N/A"))
                .collect(Collectors.toList());
        stats.setRecentLogs(logs);

        return stats;
    }

    // ===== DIRECTOR Dashboard: Stats for their direction only =====
    @GetMapping("/director")
    @PreAuthorize("hasRole('DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getDirectorStats(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        if (user == null || user.getDepartment() == null) {
            return ResponseEntity.ok(new DashboardStats(0, 0, 0, 0));
        }

        Long deptId = user.getDepartment().getId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long totalAgents = userRepository.countByDepartmentId(deptId);
        long presentCount = attendanceRecordRepository.countByUser_Department_IdAndTimestampBetweenAndType(deptId,
                startOfDay, endOfDay, AttendanceType.IN);
        long lateCount = attendanceRecordRepository.countByUser_Department_IdAndTimestampBetweenAndStatus(deptId,
                startOfDay, endOfDay, "LATE");
        long absentCount = Math.max(0, totalAgents - presentCount);

        DashboardStats stats = new DashboardStats(totalAgents, presentCount, lateCount, absentCount);
        stats.setDepartmentName(user.getDepartment().getName());

        // Recent logs for this department
        List<AttendanceRecord> recentRecords = attendanceRecordRepository
                .findTop20ByUser_Department_IdOrderByTimestampDesc(deptId);
        List<DashboardStats.RecentLog> logs = recentRecords.stream().map(r -> new DashboardStats.RecentLog(
                r.getId(),
                r.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                r.getUser().getFullName(),
                r.getType() == AttendanceType.IN ? "ENTRÉE" : "SORTIE",
                r.getUser().getDepartment() != null ? r.getUser().getDepartment().getCode() : "N/A"))
                .collect(Collectors.toList());
        stats.setRecentLogs(logs);

        return ResponseEntity.ok(stats);
    }

    // ===== GUARD Dashboard: Recent scans they performed =====
    @GetMapping("/guard")
    @PreAuthorize("hasRole('GUARD')")
    public ResponseEntity<?> getGuardStats(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long guardId = userDetails.getId();
        User guard = guardId != null ? userRepository.findById(guardId).orElse(null) : null;

        if (guard == null) {
            return ResponseEntity.ok(List.of());
        }

        List<AttendanceRecord> recentScans = attendanceRecordRepository.findTop20ByScannedByOrderByTimestampDesc(guard);

        List<ScanResponse> scans = recentScans.stream().map(r -> {
            ScanResponse sr = new ScanResponse();
            sr.setAgentName(r.getUser().getFullName());
            sr.setDepartmentName(r.getUser().getDepartment() != null ? r.getUser().getDepartment().getName() : "N/A");
            sr.setType(r.getType() == AttendanceType.IN ? "ENTRÉE" : "SORTIE");
            sr.setStatus(r.getStatus() != null && r.getStatus().equals("LATE") ? "EN RETARD" : "À L'HEURE");
            sr.setTimestamp(r.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            return sr;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(scans);
    }
}
