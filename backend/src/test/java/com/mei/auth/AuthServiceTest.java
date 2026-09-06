package com.mei.auth;

import com.mei.security.JwtService;
import com.mei.user.Role;
import com.mei.user.User;
import com.mei.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatcher;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.argThat;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_forcedToOperatorRole_evenIfAdminRequested() {
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        RegisterRequest request = RegisterRequest.builder()
                .username("sneaky")
                .email("sneaky@mei.local")
                .password("password123")
                .role(Role.ADMIN)
                .build();

        when(repository.findByUsername("sneaky")).thenReturn(Optional.empty());
        when(repository.findByEmail("sneaky@mei.local")).thenReturn(Optional.empty());

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        ArgumentMatcher<User> operatorMatcher = saved -> saved.getRole() == Role.OPERATOR;
        verify(repository).save(argThat(operatorMatcher));
    }

    @Test
    void register_rejectsDuplicateUsername() {
        RegisterRequest request = RegisterRequest.builder()
                .username("engineer")
                .email("new@mei.local")
                .password("password123")
                .build();

        when(repository.findByUsername("engineer"))
                .thenReturn(Optional.of(mock(User.class)));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");

        verify(repository, never()).save(any());
    }
}