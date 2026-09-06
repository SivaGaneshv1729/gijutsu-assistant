package com.mei.knowledge;

import java.time.LocalDateTime;

public record DocumentSummary(
        String id,
        String name,
        String type,
        String accessLevel,
        LocalDateTime createdAt,
        int chunkCount
) {}