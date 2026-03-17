package com.parth.portfolio.projects;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class Project {

    private String id;
    private String name;
    private String description;
    private String url;
    private List<String> stack;
    private OffsetDateTime lastUpdated;
    private List<String> topics;
    private Integer stars;

}

