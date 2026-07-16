package com.parth.portfolio.jobmatch;

public class JobMatchRequest {
    private String jobDescription;
    private String customApiKey;
    private String apiProvider;

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
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
}
