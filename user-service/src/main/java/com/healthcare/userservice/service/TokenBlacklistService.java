package com.healthcare.userservice.service;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory JWT blacklist. Each entry holds the token's original expiry —
 * entries are pruned on every access so the map size stays bounded by the
 * number of tokens still within their original TTL.
 *
 * Note: single-instance only. A horizontally scaled deployment should back
 * this with Redis (or similar) so revocations are visible across replicas.
 */
@Service
public class TokenBlacklistService {

    private final ConcurrentHashMap<String, Long> revoked = new ConcurrentHashMap<>();

    public void revoke(String token, Date originalExpiry) {
        if (token == null || originalExpiry == null) return;
        prune();
        revoked.put(token, originalExpiry.getTime());
    }

    public boolean isRevoked(String token) {
        if (token == null) return false;
        prune();
        return revoked.containsKey(token);
    }

    private void prune() {
        long now = System.currentTimeMillis();
        revoked.entrySet().removeIf(e -> e.getValue() < now);
    }
}
