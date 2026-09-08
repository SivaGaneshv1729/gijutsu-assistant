package com.mei.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getLogs(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(auditService.getRecentLogs(limit));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(auditService.getAuditStats());
    }
}
