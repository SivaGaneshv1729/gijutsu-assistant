package com.mei.knowledge;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;
    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public KnowledgeController(KnowledgeService knowledgeService, RestTemplate restTemplate, @Value("${ai.service.url}") String aiServiceUrl) {
        this.knowledgeService = knowledgeService;
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
    }
    
    @GetMapping("/graph")
    public ResponseEntity<Map> getKnowledgeGraph() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
            aiServiceUrl + "/api/rag/graph",
            HttpMethod.GET,
            entity,
            Map.class
        );
        return ResponseEntity.ok(response.getBody());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentSummary>> listDocuments() {
        return ResponseEntity.ok(knowledgeService.listDocuments());
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<Map<String, Boolean>> deleteDocument(@PathVariable UUID id) {
        boolean deleted = knowledgeService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}