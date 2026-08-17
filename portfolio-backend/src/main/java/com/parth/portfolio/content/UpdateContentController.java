package com.parth.portfolio.content;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;

@RestController
@RequestMapping("/api/update-content")
public class UpdateContentController {

    private static final Logger log = LoggerFactory.getLogger(UpdateContentController.class);
    private final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    @PostMapping
    public ResponseEntity<?> updateContent(@RequestBody JsonNode payload, HttpServletRequest request) {
        String host = request.getHeader("host");
        boolean isLocal = host != null && (host.contains("localhost") || host.contains("127.0.0.1"));

        if (!isLocal) {
            log.info("Production content update request: skipped writing files to disk, mock success returned.");
            return ResponseEntity.ok().body("{\"success\": true, \"message\": \"Parsed resume data successfully saved to client-side localStorage. Direct disk writing skipped since app is running in cloud production.\"}");
        }

        String baseDir = System.getProperty("user.dir");
        // We write to portfolio-frontend/src/app/content/
        File contentDir = new File(baseDir, "../portfolio-frontend/src/app/content");
        if (!contentDir.exists()) {
            contentDir.mkdirs();
        }

        try {
            if (payload.has("personal")) {
                writeTSFile(contentDir, "personal.ts", "personal", payload.get("personal"), "");
            }
            if (payload.has("experience")) {
                writeTSFile(contentDir, "experience.ts", "experience", payload.get("experience"), "ExperienceItem[]");
            }
            if (payload.has("education")) {
                JsonNode eduNode = payload.get("education");
                if (eduNode.isArray() && eduNode.size() > 0) {
                    eduNode = eduNode.get(0);
                }
                JsonNode mappedEdu = mapEducation(eduNode);
                writeTSFile(contentDir, "education.ts", "education", mappedEdu, "");
            }
            if (payload.has("skills")) {
                JsonNode skillsNode = payload.get("skills");
                JsonNode mappedSkills = skillsNode;
                if (skillsNode.isArray() && skillsNode.size() > 0 && !skillsNode.get(0).has("items")) {
                    mappedSkills = mapRawSkillsToCategories(skillsNode);
                }
                writeTSFile(contentDir, "skills.ts", "skillCategories", mappedSkills, "SkillCategory[]");
            }

            return ResponseEntity.ok().body("{\"success\": true, \"message\": \"Local workspace source files (portfolio-frontend/src/app/content/*.ts) successfully updated and rewritten to disk!\"}");
        } catch (Exception e) {
            log.error("Failed to write content files: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Disk write failed: " + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }

    private JsonNode mapEducation(JsonNode eduData) {
        if (eduData == null || !eduData.has("school")) {
            return eduData;
        }

        ObjectNode mapped = mapper.createObjectNode();
        mapped.put("institution", eduData.path("school").asText());
        mapped.put("location", eduData.path("location").asText());
        
        String field = eduData.path("field").asText("");
        String degree = eduData.path("degree").asText("");
        mapped.put("degree", field.isEmpty() ? degree : degree + " in " + field);

        String cgpa = "8.9";
        JsonNode details = eduData.path("details");
        List<String> coursework = new ArrayList<>();
        if (details.isArray()) {
            for (JsonNode detail : details) {
                String dText = detail.asText();
                if (dText.toLowerCase().contains("gpa") || dText.toLowerCase().contains("cgpa")) {
                    cgpa = dText.replaceAll("[^0-9.]", "");
                } else {
                    coursework.add(dText);
                }
            }
        }
        mapped.put("cgpa", cgpa);
        mapped.put("period", eduData.path("period").asText());
        
        ArrayNode cwNode = mapped.putArray("coursework");
        for (String c : coursework) {
            cwNode.add(c);
        }

        return mapped;
    }

    private void writeTSFile(File contentDir, String filename, String variableName, JsonNode data, String typeDeclaration) throws IOException {
        File file = new File(contentDir, filename);
        StringBuilder sb = new StringBuilder();

        if ("experience.ts".equals(filename)) {
            sb.append("export type ExperienceItem = {\n  role: string\n  company: string\n  location: string\n  period: string\n  bullets: string[]\n}\n\n");
        } else if ("education.ts".equals(filename)) {
            sb.append("export type EducationItem = {\n  institution: string\n  location: string\n  degree: string\n  cgpa: string\n  period: string\n  coursework: string[]\n}\n\n");
        } else if ("skills.ts".equals(filename)) {
            sb.append("export type Skill = {\n  name: string\n  icon: string\n  url: string\n  color: string\n}\n\nexport type SkillCategory = {\n  name: string\n  items: Skill[]\n}\n\n");
        }

        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
        sb.append(String.format("export const %s%s = %s;\n", variableName, typeDeclaration.isEmpty() ? "" : ": " + typeDeclaration, json));

        try (FileWriter fw = new FileWriter(file, StandardCharsets.UTF_8)) {
            fw.write(sb.toString());
        }
        log.info("Successfully wrote content file: {}", file.getAbsolutePath());
    }

    private static class SkillMeta {
        String icon;
        String url;
        String color;
        SkillMeta(String icon, String url, String color) {
            this.icon = icon;
            this.url = url;
            this.color = color;
        }
    }

    private static final Map<String, SkillMeta> DEFAULT_SKILLS = new HashMap<>() {{
        put("java", new SkillMeta("SiOracle", "https://docs.oracle.com/en/java/", "#007396"));
        put("spring boot", new SkillMeta("SiSpringboot", "https://spring.io/projects/spring-boot", "#6DB33F"));
        put("spring security", new SkillMeta("SiSpringsecurity", "https://spring.io/projects/spring-security", "#6DB33F"));
        put("typescript", new SkillMeta("SiTypescript", "https://www.typescriptlang.org/", "#3178C6"));
        put("angular.js", new SkillMeta("SiAngular", "https://angular.io/", "#DD0031"));
        put("mysql", new SkillMeta("SiMysql", "https://dev.mysql.com/doc/", "#4479A1"));
        put("mongodb", new SkillMeta("SiMongodb", "https://www.mongodb.com/docs/", "#47A248"));
        put("azure", new SkillMeta("SiMicrosoftazure", "https://learn.microsoft.com/en-us/azure/", "#0078D4"));
        put("docker", new SkillMeta("SiDocker", "https://docs.docker.com/", "#2496ED"));
        put("kubernetes", new SkillMeta("SiKubernetes", "https://kubernetes.io/docs/", "#326CE5"));
        put("rancher", new SkillMeta("SiRancher", "https://rancher.com/docs/", "#0075A8"));
        put("helm", new SkillMeta("SiHelm", "https://helm.sh/docs/", "#0F1689"));
        put("rest api", new SkillMeta("SiOpenapi", "https://restfulapi.net/", "#6BA539"));
        put("kafka", new SkillMeta("SiApachekafka", "https://kafka.apache.org/documentation/", "#231F20"));
        put("temporal", new SkillMeta("SiTemporal", "https://docs.temporal.io/", "#000000"));
        put("grafana", new SkillMeta("SiGrafana", "https://grafana.com/docs/", "#F46800"));
        put("prometheus", new SkillMeta("SiPrometheus", "https://prometheus.io/docs/", "#E6522C"));
        put("datadog", new SkillMeta("SiDatadog", "https://docs.datadoghq.com/", "#632CA6"));
        put("git", new SkillMeta("SiGit", "https://git-scm.com/doc", "#F05032"));
        put("linux", new SkillMeta("SiLinux", "https://www.kernel.org/doc/", "#FCC624"));
        put("jira", new SkillMeta("SiJira", "https://www.atlassian.com/software/jira/guides", "#0052CC"));
        put("confluence", new SkillMeta("SiConfluence", "https://www.atlassian.com/software/confluence/guides", "#172B4D"));
        put("sonarqube", new SkillMeta("SiSonarqube", "https://docs.sonarqube.org/", "#4E9BCD"));
        put("jfrog", new SkillMeta("SiJfrog", "https://www.jfrog.com/confluence/", "#41BF47"));
        put("snyk", new SkillMeta("SiSnyk", "https://docs.snyk.io/", "#4C4A73"));
    }};

    private JsonNode mapRawSkillsToCategories(JsonNode skillsArray) {
        Map<String, List<ObjectNode>> categories = new LinkedHashMap<>();
        categories.put("Programming & Frameworks", new ArrayList<>());
        categories.put("Databases", new ArrayList<>());
        categories.put("Cloud & DevOps", new ArrayList<>());
        categories.put("Integration & Messaging", new ArrayList<>());
        categories.put("Monitoring & Observability", new ArrayList<>());
        categories.put("Tools", new ArrayList<>());

        for (JsonNode skill : skillsArray) {
            String name = skill.path("name").asText();
            String category = skill.path("category").asText().toLowerCase();
            String lowerName = name.toLowerCase();

            SkillMeta matched = DEFAULT_SKILLS.get(lowerName);
            ObjectNode item = mapper.createObjectNode();
            item.put("name", name);
            item.put("icon", matched != null ? matched.icon : "SiSimpleicons");
            item.put("url", matched != null ? matched.url : "https://www.google.com/search?q=" + name);
            item.put("color", matched != null ? matched.color : "#94a3b8");

            if ("frontend".equals(category) || "backend".equals(category)) {
                if (Arrays.asList("mysql", "mongodb", "postgresql", "redis", "sql", "nosql").contains(lowerName)) {
                    categories.get("Databases").add(item);
                } else if (Arrays.asList("kafka", "temporal", "rest api", "openapi", "grpc", "graphql", "rabbitmq").contains(lowerName)) {
                    categories.get("Integration & Messaging").add(item);
                } else {
                    categories.get("Programming & Frameworks").add(item);
                }
            } else if ("devops".equals(category)) {
                if (Arrays.asList("grafana", "prometheus", "datadog", "elk", "splunk", "cloudwatch").contains(lowerName)) {
                    categories.get("Monitoring & Observability").add(item);
                } else {
                    categories.get("Cloud & DevOps").add(item);
                }
            } else {
                categories.get("Tools").add(item);
            }
        }

        ArrayNode result = mapper.createArrayNode();
        for (Map.Entry<String, List<ObjectNode>> entry : categories.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                ObjectNode catNode = mapper.createObjectNode();
                catNode.put("name", entry.getKey());
                ArrayNode itemsNode = catNode.putArray("items");
                for (ObjectNode skillItem : entry.getValue()) {
                    itemsNode.add(skillItem);
                }
                result.add(catNode);
            }
        }
        return result;
    }
}
