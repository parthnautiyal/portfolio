package com.parth.portfolio.chat;

import java.util.List;
import java.util.Map;

public class ChatRequest {
    private String message;
    private List<Map<String, String>> history;
    private String customApiKey;
    private String apiProvider;
    private String kbContext;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<Map<String, String>> getHistory() {
        return history;
    }

    public void setHistory(List<Map<String, String>> history) {
        this.history = history;
    }

    public String getCustomApiKey() {
        return customApiKey;
    }

    public void setCustomApiKey(String customApiKey) {
        this.customApiKey = customApiKey;
    }

    public String getApiProvider() {
        return apiProvider;
    }

    public void setApiProvider(String apiProvider) {
        this.apiProvider = apiProvider;
    }

    public String getKbContext() {
        return kbContext;
    }

    public void setKbContext(String kbContext) {
        this.kbContext = kbContext;
    }
}
