package com.mei.config;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public SystemController(JdbcTemplate jdbcTemplate, RestTemplate restTemplate, String aiServiceUrl) {
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean database = true;
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            database = count != null;
        } catch (Exception e) {
            database = false;
        }
        return ResponseEntity.ok(Map.of(
                "status", database ? "UP" : "DOWN",
                "database", database
        ));
    }

    @GetMapping("/ai-health")
    public ResponseEntity<Map<String, Object>> aiHealth() {
        try {
            Map<String, Object> body = restTemplate.getForObject(aiServiceUrl + "/health", Map.class);
            return ResponseEntity.ok(Map.of(
                    "status", body != null ? body.getOrDefault("status", "unknown") : "unknown"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "down"));
        }
    }
}