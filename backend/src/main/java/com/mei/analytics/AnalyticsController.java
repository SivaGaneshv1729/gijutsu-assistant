package com.mei.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/documents")
    public ResponseEntity<Map<String, Object>> getDocumentStats() {
        return ResponseEntity.ok(analyticsService.getDocumentStats());
    }

    @GetMapping("/documents/top")
    public ResponseEntity<List<Map<String, Object>>> getTopDocuments(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopDocuments(limit));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getSystemOverview() {
        return ResponseEntity.ok(analyticsService.getSystemOverview());
    }
}
