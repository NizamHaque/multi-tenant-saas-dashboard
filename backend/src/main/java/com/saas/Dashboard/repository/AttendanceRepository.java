package com.saas.Dashboard.repository;

import com.saas.Dashboard.entity.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findAllByTenantId(String tenantId);
    List<AttendanceRecord> findAllByTenantIdAndDate(String tenantId, LocalDate date);
    List<AttendanceRecord> findAllByTenantIdAndUserEmail(String tenantId, String userEmail);
    Optional<AttendanceRecord> findByTenantIdAndUserEmailAndDate(
        String tenantId, String userEmail, LocalDate date);
    boolean existsByTenantIdAndUserEmailAndDate(
        String tenantId, String userEmail, LocalDate date);
}
