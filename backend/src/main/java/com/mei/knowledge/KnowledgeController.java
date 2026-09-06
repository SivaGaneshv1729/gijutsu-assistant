package com.mei.knowledge;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentSummary>> listDocuments() {
        return ResponseEntity.ok(knowledgeService.listDocuments());
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteDocument(@PathVariable UUID id) {
        boolean deleted = knowledgeService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}