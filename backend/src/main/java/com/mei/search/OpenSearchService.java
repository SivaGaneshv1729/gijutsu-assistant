package com.mei.search;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class OpenSearchService {

    private final RestTemplate restTemplate;
    private final String openSearchUrl;

    public OpenSearchService(RestTemplate restTemplate,
                             @Value("${opensearch.url:http://localhost:9200}") String openSearchUrl) {
        this.restTemplate = restTemplate;
        this.openSearchUrl = openSearchUrl;
    }

    public boolean isAvailable() {
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(openSearchUrl, Map.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> search(String index, String query, int size) {
        String url = openSearchUrl + "/" + index + "/_search";
        Map<String, Object> body = Map.of(
                "query", Map.of(
                        "match", Map.of("content", query)
                ),
                "size", size
        );
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            log.warn("OpenSearch query failed: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    public Map<String, Object> indexDocument(String index, String id, Map<String, Object> document) {
        String url = openSearchUrl + "/" + index + "/_doc/" + id;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(document, headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.PUT, request, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            log.warn("OpenSearch index failed: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}
