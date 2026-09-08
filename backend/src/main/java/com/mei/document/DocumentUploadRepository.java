package com.mei.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentUploadRepository extends JpaRepository<DocumentUpload, Long> {

    List<DocumentUpload> findTop20ByOrderByCreatedAtDesc();

    List<DocumentUpload> findByUploaderOrderByCreatedAtDesc(String uploader);
}
