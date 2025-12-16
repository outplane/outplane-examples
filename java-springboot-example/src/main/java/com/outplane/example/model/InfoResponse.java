package com.outplane.example.model;

import java.util.Map;

public record InfoResponse(
        String message,
        String requestId,
        String timestamp,
        String method,
        String path,
        String ip,
        String host,
        String protocol,
        String userAgent,
        Map<String, String> headers,
        Map<String, String> env,
        Map<String, String> runtime
) {
}
