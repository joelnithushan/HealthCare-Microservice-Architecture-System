package com.healthcare.userservice.repo;

import com.healthcare.userservice.model.Role;
import com.healthcare.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNic(String nic);
    Optional<User> findBySlmcNumber(String slmcNumber);
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByResetToken(String resetToken);
    long countByRole(Role role);
}
