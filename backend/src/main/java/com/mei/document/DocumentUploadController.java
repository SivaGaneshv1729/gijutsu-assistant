package com.mei.document;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentUploadController {

    private final DocumentUploadService uploadService;

    @GetMapping("/uploads")
    public ResponseEntity<List<DocumentUpload>> getRecentUploads() {
        return ResponseEntity.ok(uploadService.getRecentUploads());
    }

    @GetMapping("/uploads/user/{username}")
    public ResponseEntity<List<DocumentUpload>> getUploadsByUser(@PathVariable String username) {
        return ResponseEntity.ok(uploadService.getUploadsByUser(username));
    }
}
