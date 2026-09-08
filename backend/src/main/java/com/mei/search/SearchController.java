package com.mei.search;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final OpenSearchService openSearchService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean available = openSearchService.isAvailable();
        return ResponseEntity.ok(Map.of(
                "status", available ? "ok" : "unavailable",
                "provider", "opensearch"
        ));
    }

    @GetMapping("/hybrid")
    public ResponseEntity<Map<String, Object>> hybridSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "documents") String index,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> results = openSearchService.search(index, query, size);
        return ResponseEntity.ok(results);
    }
}
