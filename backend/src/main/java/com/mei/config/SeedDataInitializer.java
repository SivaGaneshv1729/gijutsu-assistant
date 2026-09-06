package com.mei.config;

import com.mei.user.Role;
import com.mei.user.User;
import com.mei.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeedDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-default-users:true}")
    private boolean seedDefaultUsers;

    @Override
    public void run(String... args) {
        if (!seedDefaultUsers) {
            return;
        }
        if (userRepository.count() > 0) {
            return;
        }

        List<User> defaults = List.of(
                User.builder().username("admin").email("admin@mei.local").password(passwordEncoder.encode("password123")).role(Role.ADMIN).build(),
                User.builder().username("engineer").email("engineer@mei.local").password(passwordEncoder.encode("password123")).role(Role.ENGINEER).build(),
                User.builder().username("operator").email("operator@mei.local").password(passwordEncoder.encode("password123")).role(Role.OPERATOR).build(),
                User.builder().username("manager").email("manager@mei.local").password(passwordEncoder.encode("password123")).role(Role.MANAGER).build()
        );

        userRepository.saveAll(defaults);
        log.info("Seeded {} default users (admin/engineer/operator/manager, password: password123)", defaults.size());
    }
}