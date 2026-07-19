package com.parth.portfolio.projects;

import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProjectService {

    private final Map<String, Project> projects = new ConcurrentHashMap<>();

    public ProjectService() {
        // Seed with two key projects so the portfolio is not empty before webhooks are wired.
        Project training = new Project();
        training.setId("training-upskilling-v2");
        training.setName("Training and Upskilling v2");
        training.setDescription("Full-stack e-learning platform with structured course publishing, real-time progress tracking, and dashboards.");
        training.setUrl("https://github.com/your-github-username/training-upskilling-v2");
        training.setStack(List.of("TypeScript", "Angular.js", "MySQL"));
        training.setLastUpdated(OffsetDateTime.now());

        Project pipeline = new Project();
        pipeline.setId("automated-deployment-pipeline");
        pipeline.setName("Automated Deployment Pipeline");
        pipeline.setDescription("Automated CI/CD on AWS EC2 using Jenkins, Ansible, Docker, and Kubernetes.");
        pipeline.setUrl("https://github.com/your-github-username/automated-deployment-pipeline");
        pipeline.setStack(List.of("Jenkins", "AWS EC2", "Ansible", "Docker", "Kubernetes"));
        pipeline.setLastUpdated(OffsetDateTime.now());

        upsert(training);
        upsert(pipeline);
    }

    public List<Project> findAll() {
        return Collections.unmodifiableList(new ArrayList<>(projects.values()));
    }

    public void upsert(Project project) {
        if (project.getId() == null && project.getName() != null) {
            project.setId(project.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        projects.put(project.getId(), project);
    }
}

