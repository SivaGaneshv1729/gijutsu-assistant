package com.mei.document;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentUploadService {

    private final DocumentUploadRepository repository;
    private final Path fileStorageLocation;

    public DocumentUploadService(
            DocumentUploadRepository repository,
            @Value("${app.upload-dir:/app/uploads}") String uploadDir) {
        this.repository = repository;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public DocumentUpload recordUpload(String filename, String uploader, Long fileSize) {
        DocumentUpload upload = DocumentUpload.builder()
                .filename(filename)
                .uploader(uploader)
                .fileSize(fileSize)
                .status("processing")
                .build();
        return repository.save(upload);
    }

    public void markComplete(DocumentUpload upload, int chunkCount) {
        upload.setStatus("completed");
        upload.setChunkCount(chunkCount);
        repository.save(upload);
    }

    public void markFailed(DocumentUpload upload, String error) {
        upload.setStatus("failed");
        upload.setError(error);
        repository.save(upload);
    }

    public List<DocumentUpload> getRecentUploads() {
        return repository.findTop20ByOrderByCreatedAtDesc();
    }

    public List<DocumentUpload> getUploadsByUser(String username) {
        return repository.findByUploaderOrderByCreatedAtDesc(username);
    }

    public String saveFile(MultipartFile file) {
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            // Guard against path traversal: resolve, then ensure the result stays
            // inside the configured upload directory (CWE-22).
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("File not found " + fileName);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}