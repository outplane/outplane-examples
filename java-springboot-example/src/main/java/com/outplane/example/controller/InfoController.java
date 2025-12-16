package com.outplane.example.controller;

import com.outplane.example.model.InfoResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@RestController
public class InfoController {

    @GetMapping("/")
    public ResponseEntity<Void> root() {
        return ResponseEntity.status(302).header("Location", "/info").build();
    }

    @GetMapping("/info")
    public InfoResponse info(HttpServletRequest request) {
        Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        Collections.list(request.getHeaderNames()).forEach(name -> headers.put(name, request.getHeader(name)));

        Map<String, String> env = new TreeMap<>(System.getenv());

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        return new InfoResponse(
                "Spring Boot example reporting environment variables and user agent on Out Plane",
                UUID.randomUUID().toString(),
                Instant.now().toString(),
                request.getMethod(),
                request.getRequestURI(),
                request.getRemoteAddr(),
                request.getHeader("Host"),
                request.getScheme(),
                request.getHeader("User-Agent"),
                headers,
                env,
                Map.of(
                        "javaVersion", System.getProperty("java.version", ""),
                        "pid", String.valueOf(ProcessHandle.current().pid()),
                        "uptimeMs", String.valueOf(uptimeMs)
                )
        );
    }
}
