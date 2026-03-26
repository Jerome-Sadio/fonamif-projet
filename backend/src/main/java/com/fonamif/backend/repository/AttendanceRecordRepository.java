package com.fonamif.backend.repository;

import com.fonamif.backend.model.AttendanceRecord;
import com.fonamif.backend.model.AttendanceType;
import com.fonamif.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByUser(User user);

    List<AttendanceRecord> findByUser_Department_Id(Long departmentId);

    // Date range queries
    List<AttendanceRecord> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    List<AttendanceRecord> findByUserAndTimestampBetween(User user, LocalDateTime start, LocalDateTime end);

    List<AttendanceRecord> findByUser_Department_IdAndTimestampBetween(Long deptId, LocalDateTime start,
            LocalDateTime end);

    // Count queries for dashboard stats
    long countByTimestampBetweenAndType(LocalDateTime start, LocalDateTime end, AttendanceType type);

    long countByUser_Department_IdAndTimestampBetweenAndType(Long deptId, LocalDateTime start, LocalDateTime end,
            AttendanceType type);

    long countByTimestampBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);

    long countByUser_Department_IdAndTimestampBetweenAndStatus(Long deptId, LocalDateTime start, LocalDateTime end,
            String status);

    // Guard: find scans by guard
    List<AttendanceRecord> findByScannedBy(User guard);

    List<AttendanceRecord> findTop20ByScannedByOrderByTimestampDesc(User guard);

    // Recent records
    List<AttendanceRecord> findTop20ByOrderByTimestampDesc();

    List<AttendanceRecord> findTop20ByUser_Department_IdOrderByTimestampDesc(Long deptId);
}
