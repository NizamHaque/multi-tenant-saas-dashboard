package com.saas.Dashboard.controller;

import com.saas.Dashboard.entity.AttendanceRecord;
import com.saas.Dashboard.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<AttendanceRecord> markPresent() {
        return ResponseEntity.ok(attendanceService.markPresent());
    }

    @GetMapping("/today/status")
    public ResponseEntity<Map<String, Object>> getTodayStatus() {
        return ResponseEntity.ok(attendanceService.getTodayStatus());
    }

    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttendanceRecord>> getHistory() {
        return ResponseEntity.ok(attendanceService.getFullHistory());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(attendanceService.getAttendanceAnalytics());
    }
}
