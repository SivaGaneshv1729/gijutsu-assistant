package com.mei.document;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentUploadService {

    private final DocumentUploadRepository repository;

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
}
