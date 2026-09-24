package com.mei.rag;

public class RagRequest {
    private String query;
    private String language;

    public RagRequest() {}

    public RagRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
