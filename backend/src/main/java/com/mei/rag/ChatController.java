package com.mei.rag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final RagService ragService;
    private final ObjectMapper objectMapper;

    public ChatController(ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository, RagService ragService, ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.ragService = ragService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createSession(@RequestBody(required = false) ChatSession request) {
        ChatSession session = new ChatSession();
        session.setTitle(request != null && request.getTitle() != null ? request.getTitle() : "New Uplink");
        ChatSession saved = sessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        // Return sessions ordered by updated_at descending
        List<ChatSession> sessions = sessionRepository.findAll();
        sessions.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        if (sessionRepository.existsById(id)) {
            sessionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable String id) {
        Optional<ChatSession> sessionOpt = sessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<ChatMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/sessions/{id}/message")
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable String id, @RequestBody RagRequest ragRequest) {
        Optional<ChatSession> sessionOpt = sessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ChatSession session = sessionOpt.get();

        // 1. Save user message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole("user");
        userMsg.setContent(ragRequest.getQuery());
        messageRepository.save(userMsg);

        // Update session title if it's "New Uplink" and this is the first message
        if ("New Uplink".equals(session.getTitle())) {
            String newTitle = ragRequest.getQuery();
            if (newTitle.length() > 30) {
                newTitle = newTitle.substring(0, 30) + "...";
            }
            session.setTitle(newTitle);
            sessionRepository.save(session);
        }

        // 2. Query AI Service
        RagResponse ragResponse = ragService.queryAiService(ragRequest);

        // 3. Save assistant message
        ChatMessage assistantMsg = new ChatMessage();
        assistantMsg.setSession(session);
        assistantMsg.setRole("assistant");
        
        Map<String, Object> responseData = ragResponse.getData();
        String answer = responseData != null && responseData.containsKey("answer") 
                ? responseData.get("answer").toString() 
                : "No response from AI.";
        
        assistantMsg.setContent(answer);
        
        try {
            if (responseData != null && responseData.containsKey("citations")) {
                Object citationsObj = responseData.get("citations");
                if (citationsObj != null) {
                    assistantMsg.setCitationsJson(objectMapper.writeValueAsString(citationsObj));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        ChatMessage savedAssistantMsg = messageRepository.save(assistantMsg);

        return ResponseEntity.ok(savedAssistantMsg);
    }
}
