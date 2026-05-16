package com.healthcare.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final SecretKey secretKey;

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/google",
            "/api/auth/send-otp",
            "/api/auth/verify-otp",
            "/api/auth/forgot-password",
            "/api/auth/reset-password");

    // GET paths that are intentionally public (no auth required)
    private static final List<String> PUBLIC_GET_PREFIXES = List.of(
            "/api/v1/doctors",
            "/api/doctors",
            "/api/v1/symptoms",
            "/api/symptoms");

    // URL segments that are always public regardless of method (profile images)
    private static final String PROFILE_IMAGE_SEGMENT = "/profile-image";

    public JwtAuthenticationFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow open endpoints without authentication
        for (String openEndpoint : OPEN_ENDPOINTS) {
            if (path.startsWith(openEndpoint)) {
                return chain.filter(exchange);
            }
        }

        String method = request.getMethod().name();

        // Allow OPTIONS requests for CORS pre-flight
        if ("OPTIONS".equals(method)) {
            return chain.filter(exchange);
        }

        // Allow narrow set of public GET paths (doctor/symptom browsing, profile images)
        if ("GET".equals(method)) {
            for (String prefix : PUBLIC_GET_PREFIXES) {
                if (path.startsWith(prefix)) {
                    return chain.filter(exchange);
                }
            }
            if (path.contains(PROFILE_IMAGE_SEGMENT)) {
                return chain.filter(exchange);
            }
        }

        // Check for Authorization header
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Add user info to headers for downstream services
            String userId = claims.get("userId") != null ? claims.get("userId").toString() : "";
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Username", claims.getSubject())
                    .header("X-User-Role", claims.get("role", String.class))
                    .header("X-User-Id", userId)
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
