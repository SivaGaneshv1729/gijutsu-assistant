package com.mei.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String username, String action, String resourceType, String resourceId, String details, String ipAddress, boolean success) {
        AuditLog entry = AuditLog.builder()
                .username(username)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .ipAddress(ipAddress)
                .success(success)
                .build();
        auditLogRepository.save(entry);
        log.info("AUDIT: user={} action={} resource={}/{} success={}", username, action, resourceType, resourceId, success);
    }

    public void logLogin(String username, String ipAddress, boolean success) {
        log(username, "LOGIN", "auth", username, success ? "Login successful" : "Login failed", ipAddress, success);
    }

    public void logRegister(String username, String ipAddress) {
        log(username, "REGISTER", "user", username, "New operator account created", ipAddress, true);
    }

    public void logQuery(String username, String query) {
        log(username, "RAG_QUERY", "query", null, query.length() > 200 ? query.substring(0, 200) : query, null, true);
    }

    public void logDocumentDelete(String username, String documentId, String documentName) {
        log(username, "DELETE_DOCUMENT", "document", documentId, documentName, null, true);
    }

    public List<AuditLog> getRecentLogs(int limit) {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc().subList(0, Math.min(limit, 50));
    }

    public Map<String, Object> getAuditStats() {
        long totalLogs = auditLogRepository.count();
        long loginAttempts = auditLogRepository.countByAction("LOGIN");
        long queries = auditLogRepository.countByAction("RAG_QUERY");
        long deletes = auditLogRepository.countByAction("DELETE_DOCUMENT");
        return Map.of(
                "total_events", totalLogs,
                "login_attempts", loginAttempts,
                "rag_queries", queries,
                "document_deletes", deletes
        );
    }
}
