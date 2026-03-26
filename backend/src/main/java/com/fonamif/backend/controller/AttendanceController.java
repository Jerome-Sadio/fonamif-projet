package com.fonamif.backend.controller;

import com.fonamif.backend.model.*;
import com.fonamif.backend.payload.request.ScanRequest;
import com.fonamif.backend.payload.response.MessageResponse;
import com.fonamif.backend.payload.response.ScanResponse;
import com.fonamif.backend.repository.AttendanceRecordRepository;
import com.fonamif.backend.repository.UserRepository;
import com.fonamif.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/scan")
    @PreAuthorize("hasRole('GUARD')")
    public ResponseEntity<?> scanAttendance(@Valid @RequestBody ScanRequest scanRequest,
            Authentication authentication) {
        // Get the guard who is scanning
        UserDetailsImpl guardDetails = (UserDetailsImpl) authentication.getPrincipal();
        User guard = userRepository.findById(guardDetails.getId()).orElse(null);
        if (guard == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Guard not found."));
        }

        Optional<User> userOptional = Optional.empty();
        AttendanceMethod method;

        try {
            method = AttendanceMethod.valueOf(scanRequest.getMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Attendance Method"));
        }

        switch (method) {
            case BIOMETRIC:
                userOptional = userRepository.findByFingerprintTemplate(scanRequest.getData());
                break;
            case QR_CODE:
                userOptional = userRepository.findByQrCodeData(scanRequest.getData());
                break;
            case BARCODE:
                userOptional = userRepository.findByBarcodeData(scanRequest.getData());
                break;
        }

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Agent non trouvé pour ce code."));
        }

        User user = userOptional.get();
        LocalDateTime now = LocalDateTime.now();

        // Determine IN or OUT based on today's last record
        AttendanceType type = AttendanceType.IN;
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<AttendanceRecord> todayRecords = attendanceRecordRepository
                .findByUserAndTimestampBetween(user, startOfDay, endOfDay);

        if (!todayRecords.isEmpty()) {
            AttendanceRecord lastRecord = todayRecords.get(todayRecords.size() - 1);
            if (lastRecord.getType() == AttendanceType.IN) {
                type = AttendanceType.OUT;
            }
        }

        // Determine status (Late if IN after 9:00)
        String status = "ON_TIME";
        if (type == AttendanceType.IN && now.getHour() >= 9) {
            status = "LATE";
        }

        // Create the attendance record
        AttendanceRecord record = new AttendanceRecord();
        record.setUser(user);
        record.setTimestamp(now);
        record.setType(type);
        record.setMethod(method);
        record.setStatus(status);
        record.setScannedBy(guard);

        attendanceRecordRepository.save(record);

        // Build enriched response
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : "N/A";
        String displayType = type == AttendanceType.IN ? "ENTRÉE" : "SORTIE";
        String displayStatus = status.equals("LATE") ? "EN RETARD" : "À L'HEURE";
        String displayTime = now.format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        ScanResponse response = new ScanResponse(
                displayType + " enregistrée pour " + user.getFullName(),
                user.getFullName(),
                deptName,
                displayType,
                displayStatus,
                displayTime);

        return ResponseEntity.ok(response);
    }

    // Get attendance history for the current user (Agent sees own records)
    @GetMapping("/my-records")
    @PreAuthorize("hasRole('AGENT') or hasRole('DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyRecords(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<AttendanceRecord> records = attendanceRecordRepository.findByUserAndTimestampBetween(user, startOfDay,
                endOfDay);

        return ResponseEntity.ok(records.stream().map(r -> {
            ScanResponse sr = new ScanResponse();
            sr.setAgentName(r.getUser().getFullName());
            sr.setDepartmentName(r.getUser().getDepartment() != null ? r.getUser().getDepartment().getName() : "N/A");
            sr.setType(r.getType() == AttendanceType.IN ? "ENTRÉE" : "SORTIE");
            sr.setStatus(r.getStatus() != null && r.getStatus().equals("LATE") ? "EN RETARD" : "À L'HEURE");
            sr.setTimestamp(r.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            return sr;
        }).toList());
    }
}
