package com.mei.rag;

import com.mei.user.Role;
import lombok.Getter;
import lombok.Setter;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class RagService {

    private static final String QUERY_PATH = "/api/v1/query";

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public RagService(RestTemplate restTemplate, String aiServiceUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
    }

    public RagResponse queryAiService(RagRequest ragRequest) {
        String accessLevel = getAccessLevelFromContext();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", ragRequest.getQuery());
        requestBody.put("access_level", accessLevel);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    aiServiceUrl + QUERY_PATH,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return new RagResponse(responseEntity.getBody());
        } catch (RestClientException ex) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("answer", "The intelligence engine is currently unavailable. Please ensure the AI service is running.");
            errorBody.put("citations", java.util.List.of());
            errorBody.put("error", ex.getMessage());
            return new RagResponse(errorBody);
        }
    }

    private String getAccessLevelFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            Optional<String> role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .findFirst();
            if (role.isPresent()) {
                return role.get();
            }
        }
        return Role.OPERATOR.name();
    }
}