package com.example.e_commerce.security;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class TokenService {

    private static final String SECRET = "e-commerce-dev-token-secret";
    private static final String ALGO = "HmacSHA256";

    public String issue(String userId) {
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(userId.getBytes(StandardCharsets.UTF_8));
        return payload + "." + sign(payload);
    }

    public String resolveUserId(String token) {
        if (token == null) return null;
        int dot = token.indexOf('.');
        if (dot < 0) return null;
        String payload = token.substring(0, dot);
        String signature = token.substring(dot + 1);
        if (!sign(payload).equals(signature)) return null;
        try {
            return new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(ALGO);
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), ALGO));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign token", e);
        }
    }
}
