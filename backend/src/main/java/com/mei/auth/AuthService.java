package com.mei.auth;

import com.mei.security.JwtService;
import com.mei.user.Role;
import com.mei.user.User;
import com.mei.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Self-registration through the public endpoint is always limited to OPERATOR.
        // Higher-privileged roles must be provisioned by an administrator seed (or DB).
        Role assignedRole = Role.OPERATOR;

        if (repository.findByUsername(request.getUsername()).isPresent()
                || repository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Username or email is already taken");
        }

        var user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();
        try {
            repository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Username or email is already taken");
        }
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
}