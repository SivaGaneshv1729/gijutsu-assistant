package com.mei.rag;

import java.util.Map;

public class RagResponse {
    private Map<String, Object> data;

    public RagResponse() {
    }

    public RagResponse(Map<String, Object> data) {
        this.data = data;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
