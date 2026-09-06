package com.mei.knowledge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KnowledgeService {

    private final JdbcTemplate jdbcTemplate;

    public KnowledgeService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DocumentSummary> listDocuments() {
        String sql = """
            SELECT d.id, d.name, d.type, d.access_level, d.created_at,
                   COUNT(dc.id)::int AS chunk_count
            FROM documents d
            LEFT JOIN document_chunks dc ON dc.document_id = d.id
            GROUP BY d.id
            ORDER BY d.created_at ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new DocumentSummary(
                rs.getString("id"),
                rs.getString("name"),
                rs.getString("type"),
                rs.getString("access_level"),
                rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null,
                rs.getInt("chunk_count")
        ));
    }

    public boolean deleteDocument(UUID id) {
        int deleted = jdbcTemplate.update("DELETE FROM documents WHERE id = ?", id);
        return deleted > 0;
    }
}