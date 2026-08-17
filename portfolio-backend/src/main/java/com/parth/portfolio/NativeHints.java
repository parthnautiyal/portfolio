package com.parth.portfolio;

import com.parth.portfolio.chat.ChatRequest;
import com.parth.portfolio.chat.ChatResponse;
import com.parth.portfolio.contact.ContactRequest;
import com.parth.portfolio.jobmatch.JobMatchRequest;
import com.parth.portfolio.projects.Project;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

@Configuration
@ImportRuntimeHints(NativeHints.class)
public class NativeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Jackson POJOs for @RequestBody / @ResponseBody serialization
        hints.reflection()
            .registerType(ChatRequest.class, MemberCategory.values())
            .registerType(ChatResponse.class, MemberCategory.values())
            .registerType(ContactRequest.class, MemberCategory.values())
            .registerType(JobMatchRequest.class, MemberCategory.values())
            .registerType(Project.class, MemberCategory.values());

        // Angular static files served by Spring Boot's ResourceHttpRequestHandler
        hints.resources().registerPattern("static/**");

        // Angular content TS files read by JobMatchController via classpath
        hints.resources().registerPattern("content/**");
    }
}
