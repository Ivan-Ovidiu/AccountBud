package com.Accountancy.app.services;

import com.Accountancy.app.dto.UserDTO.*;
import com.Accountancy.app.entities.User;
import com.Accountancy.app.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── GET all active users — ADMIN only ─────────────────────────────────────
    public List<UserResponse> getAllUsers() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── GET user by id — ADMIN only ───────────────────────────────────────────
    public UserResponse getUserById(Integer id) {
        return toResponse(findById(id));
    }

    // ── GET pending OAuth2 requests — ADMIN only ──────────────────────────────
    public List<UserResponse> getPendingRequests() {
        return userRepository.findByStatus(User.Status.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── POST approve pending user — ADMIN only ────────────────────────────────
    public UserResponse approveUser(Integer id) {
        User user = findById(id);
        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("User is not in PENDING state");
        }
        user.setStatus(User.Status.ACTIVE);
        user.setIsActive(true);
        return toResponse(userRepository.save(user));
    }

    // ── POST reject pending user — ADMIN only ─────────────────────────────────
    public UserResponse rejectUser(Integer id) {
        User user = findById(id);
        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("User is not in PENDING state");
        }
        user.setStatus(User.Status.REJECTED);
        user.setIsActive(false);
        return toResponse(userRepository.save(user));
    }

    // ── POST create user — ADMIN only ─────────────────────────────────────────
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use: " + request.email());
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : User.Role.VIEWER)
                .isActive(true)
                .status(User.Status.ACTIVE)   // manually-created users are ACTIVE immediately
                .build();
        return toResponse(userRepository.save(user));
    }

    // ── PUT update user details — ADMIN only ──────────────────────────────────
    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        User user = findById(id);
        if (!user.getEmail().equals(request.email()) &&
                userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use: " + request.email());
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

    // ── POST change own password ───────────────────────────────────────────────
    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    // ── DELETE soft delete — ADMIN only ───────────────────────────────────────
    public void deactivateUser(Integer id) {
        User user = findById(id);
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equals(currentEmail)) {
            throw new RuntimeException("Cannot deactivate your own account");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getStatus()    // added to DTO
        );
    }
}