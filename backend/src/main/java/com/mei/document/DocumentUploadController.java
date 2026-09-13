package com.mei.document;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentUploadController {

    private final DocumentUploadService uploadService;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final String aiServiceUrl;

    @GetMapping("/uploads")
    public ResponseEntity<List<DocumentUpload>> getRecentUploads() {
        return ResponseEntity.ok(uploadService.getRecentUploads());
    }

    @GetMapping("/uploads/user/{username}")
    public ResponseEntity<List<DocumentUpload>> getUploadsByUser(@PathVariable String username) {
        return ResponseEntity.ok(uploadService.getUploadsByUser(username));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = uploadService.saveFile(file);
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String uploader = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        
        // This simulates saving metadata to the database
        DocumentUpload doc = uploadService.recordUpload(file.getOriginalFilename(), uploader, file.getSize());
        
        // Trigger AI-Service ingestion
        try {
            Map<String, String> requestBody = Map.of(
                    "filename", fileName,
                    "original_filename", file.getOriginalFilename(),
                    "access_level", "ADMIN"
            );
            restTemplate.postForEntity(aiServiceUrl + "/api/rag/ingest", requestBody, String.class);
            uploadService.markComplete(doc, 1);
        } catch (Exception e) {
            e.printStackTrace();
            uploadService.markFailed(doc, e.getMessage());
        }

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/documents/images/")
                .path(fileName)
                .toUriString();

        return ResponseEntity.ok(Map.of(
            "fileName", fileName,
            "fileDownloadUri", fileDownloadUri,
            "fileType", file.getContentType(),
            "size", file.getSize()
        ));
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = uploadService.loadFileAsResource(fileName);
        
        String contentType = "application/octet-stream";
        if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
