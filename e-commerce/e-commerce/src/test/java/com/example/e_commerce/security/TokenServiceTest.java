package com.example.e_commerce.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TokenServiceTest {

    private final TokenService tokenService = new TokenService();

    @Test
    void issueThenResolve_roundTripsToOriginalUserId() {
        String userId = "user-123";

        String token = tokenService.issue(userId);
        String resolved = tokenService.resolveUserId(token);

        assertThat(token).contains(".");
        assertThat(resolved).isEqualTo(userId);
    }

    @Test
    void resolveUserId_tamperedSignature_returnsNull() {
        String token = tokenService.issue("user-123");
        int dot = token.indexOf('.');
        String payload = token.substring(0, dot);
        String tampered = payload + ".tamperedSignatureValue";

        assertThat(tokenService.resolveUserId(tampered)).isNull();
    }

    @Test
    void resolveUserId_tamperedPayload_returnsNull() {
        String token = tokenService.issue("user-123");
        int dot = token.indexOf('.');
        String signature = token.substring(dot + 1);
        String tamperedPayload = "dXNlci05OTk" ;
        String tampered = tamperedPayload + "." + signature;

        assertThat(tokenService.resolveUserId(tampered)).isNull();
    }

    @Test
    void resolveUserId_malformedTokenWithoutDot_returnsNull() {
        assertThat(tokenService.resolveUserId("not-a-valid-token")).isNull();
    }

    @Test
    void resolveUserId_nullToken_returnsNull() {
        assertThat(tokenService.resolveUserId(null)).isNull();
    }

    @Test
    void resolveUserId_emptyToken_returnsNull() {
        assertThat(tokenService.resolveUserId("")).isNull();
    }

    @Test
    void issue_differentUserIds_produceDifferentTokens() {
        String tokenA = tokenService.issue("user-A");
        String tokenB = tokenService.issue("user-B");

        assertThat(tokenA).isNotEqualTo(tokenB);
    }
}
