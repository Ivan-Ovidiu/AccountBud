package com.Accountancy.app.security;

import com.Accountancy.app.entities.User;
import com.Accountancy.app.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * OAuth2 success handler with three-branch logic:
 *
 *  1. Email unknown → create user with status=PENDING, redirect with ?status=pending
 *  2. Email known, status=PENDING   → redirect with ?status=pending (no token)
 *  3. Email known, status=REJECTED  → redirect with ?status=rejected (no token)
 *  4. Email known, status=ACTIVE    → issue pre-auth token, redirect to /select-company
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        // ── Branch 1: brand-new user → create as PENDING ─────────────────────
        if (userRepository.findByEmail(email).isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email.split("@")[0]);
            newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRole(User.Role.VIEWER);
            newUser.setIsActive(false);          // not active until approved
            newUser.setStatus(User.Status.PENDING);
            userRepository.save(newUser);

            response.sendRedirect(frontendUrl + "/oauth-callback?status=pending"
                    + "&name=" + encode(name != null ? name : email));
            return;
        }

        User user = userRepository.findByEmail(email).orElseThrow();

        // ── Branch 2: PENDING → still waiting ────────────────────────────────
        if (user.getStatus() == User.Status.PENDING) {
            response.sendRedirect(frontendUrl + "/oauth-callback?status=pending"
                    + "&name=" + encode(user.getName()));
            return;
        }

        // ── Branch 3: REJECTED → access denied ───────────────────────────────
        if (user.getStatus() == User.Status.REJECTED) {
            response.sendRedirect(frontendUrl + "/oauth-callback?status=rejected"
                    + "&name=" + encode(user.getName()));
            return;
        }

        // ── Branch 4: ACTIVE → issue pre-auth token, go to company select ────
        String preAuthToken = jwtUtil.generatePreAuthToken(
                user.getEmail(), user.getRole().name());

        response.sendRedirect(frontendUrl + "/select-company"
                + "?preAuthToken=" + preAuthToken
                + "&email=" + encode(user.getEmail())
                + "&name="  + encode(user.getName())
                + "&role="  + user.getRole().name());
    }

    private String encode(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8");
        } catch (Exception e) {
            return value;
        }
    }
}