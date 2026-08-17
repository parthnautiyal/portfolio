package com.parth.portfolio;

import org.springframework.boot.autoconfigure.condition.ConditionalOnResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Only active when Angular is embedded (combined deployment). Inactive for backend-only Render deploy.
@ConditionalOnResource(resources = "classpath:/static/index.html")
@Controller
public class SpaController {

    // Forward all non-API, non-asset routes to index.html for Angular's client-side router.
    // Regex excludes paths starting with "api", paths containing a dot (static assets), and "health".
    @GetMapping(value = {
        "/{path:^(?!api|health)[^\\.]*}",
        "/{path:^(?!api|health)[^\\.]*}/**"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
