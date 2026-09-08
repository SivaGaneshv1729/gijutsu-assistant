package com.mei.analytics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getDocumentStats() {
        Integer totalDocs = jdbcTemplate.queryForObject("SELECT COUNT(*)::int FROM documents", Integer.class);
        Integer totalChunks = jdbcTemplate.queryForObject("SELECT COUNT(*)::int FROM document_chunks", Integer.class);
        List<Map<String, Object>> byType = jdbcTemplate.queryForList(
                "SELECT type, COUNT(*)::int AS count FROM documents GROUP BY type ORDER BY count DESC"
        );
        List<Map<String, Object>> byAccess = jdbcTemplate.queryForList(
                "SELECT access_level, COUNT(*)::int AS count FROM documents GROUP BY access_level ORDER BY count DESC"
        );
        return Map.of(
                "total_documents", totalDocs != null ? totalDocs : 0,
                "total_chunks", totalChunks != null ? totalChunks : 0,
                "by_type", byType,
                "by_access_level", byAccess
        );
    }

    public List<Map<String, Object>> getTopDocuments(int limit) {
        return jdbcTemplate.queryForList(
                "SELECT d.name, d.type, d.access_level, COUNT(dc.id)::int AS chunk_count " +
                "FROM documents d LEFT JOIN document_chunks dc ON dc.document_id = d.id " +
                "GROUP BY d.id ORDER BY chunk_count DESC LIMIT ?",
                limit
        );
    }

    public Map<String, Object> getSystemOverview() {
        Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*)::int FROM users", Integer.class);
        Integer docCount = jdbcTemplate.queryForObject("SELECT COUNT(*)::int FROM documents", Integer.class);
        Integer chunkCount = jdbcTemplate.queryForObject("SELECT COUNT(*)::int FROM document_chunks", Integer.class);
        return Map.of(
                "users", userCount != null ? userCount : 0,
                "documents", docCount != null ? docCount : 0,
                "chunks", chunkCount != null ? chunkCount : 0
        );
    }
}
