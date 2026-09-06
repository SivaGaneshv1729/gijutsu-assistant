package com.mei.rag;

public class RagRequest {
    private String query;

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
}
