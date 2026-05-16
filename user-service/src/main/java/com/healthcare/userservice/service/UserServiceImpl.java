package com.healthcare.userservice.service;

import com.healthcare.userservice.config.CustomUserDetails;
import com.healthcare.userservice.dto.AuthResponse;
import com.healthcare.userservice.dto.LoginRequest;
import com.healthcare.userservice.dto.RegisterRequest;
import com.healthcare.userservice.dto.UserRequest;
import com.healthcare.userservice.dto.UserResponse;
import com.healthcare.userservice.model.Role;
import com.healthcare.userservice.model.User;
import com.healthcare.userservice.repo.UserRepository;
import com.healthcare.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.util.Optional;
import java.util.Collections;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${seed.admin.password}")
    private String seedAdminPassword;

    @Value("${seed.doctor.password}")
    private String seedDoctorPassword;

    @Value("${seed.patient.password}")
    private String seedPatientPassword;

    private static final int MIN_PASSWORD_LENGTH = 8;

    private void ensurePasswordStrength(String raw) {
        if (raw == null || raw.length() < MIN_PASSWORD_LENGTH) {
            throw new RuntimeException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedData() {
        try { seedAdminUser(); } catch (Exception e) { System.out.println("Admin seed skipped: " + e.getMessage()); }
        try { seedDoctors(); } catch (Exception e) { System.out.println("Doctor seed skipped: " + e.getMessage()); }
        try { seedPatient(); } catch (Exception e) { System.out.println("Patient seed skipped: " + e.getMessage()); }
    }



    private void seedAdminUser() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@gmail.com");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode(seedAdminPassword));
            admin.setRole(Role.ADMIN);
            admin.setSuspended(false);
            admin.setApproved(true);
            admin.setApprovedAt(java.time.LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("Permanent Master Admin Account seeded successfully.");
        } else {
            // Keep the master admin account unsuspended. Do not overwrite its stored hash on every boot.
            User admin = adminOpt.get();
            admin.setSuspended(false);
            admin.setSuspensionReason(null);
            userRepository.save(admin);
        }
    }

    private void seedDoctors() {
        String[][] doctorData = {
            {"Dr. Anura Perera", "anura@mediconnect.com", "751234567V", "0771234561", "Cardiologist", "Asiri Hospital"},
            {"Dr. Nilmini Gunawardena", "nilmini@mediconnect.com", "825678123V", "0771234562", "Pediatrician", "Lanka Hospitals"},
            {"Dr. Rohan De Silva", "rohan@mediconnect.com", "681234567V", "0771234563", "Neurologist", "Nawaloka Hospital"},
            {"Dr. Priyantha Rathnayake", "priyantha@mediconnect.com", "771234987V", "0771234564", "Dermatologist", "Hemas Hospital"},
            {"Dr. Kumara Silva", "kumara@mediconnect.com", "801234567V", "0771234565", "Orthopedic Surgeon", "Durdan's Hospital"},
            {"Dr. Sunil Fernando", "sunil@mediconnect.com", "721234567V", "0771234566", "ENT Surgeon", "Kings Hospital"},
            {"Dr. Mahen Samarasinghe", "mahen@mediconnect.com", "851234567V", "0771234567", "Psychiatrist", "Ninewells Hospital"},
            {"Dr. Lalith Abeysekara", "lalith@mediconnect.com", "601234567V", "0771234568", "General Practitioner", "Central Hospital"},
            {"Dr. Chamilka Fernando", "chamilka@mediconnect.com", "881234567V", "0771234569", "Ophthalmologist", "Eye Hospital Colombo"},
            {"Dr. Nirosha Perera", "nirosha@mediconnect.com", "841234567V", "0771234570", "Obstetrician & Gynecologist", "Castle Street Hospital"},
            {"Dr. Harsha Wickramasinghe", "harsha@mediconnect.com", "811234567V", "0771234571", "Oncologist", "Maharagama Cancer Hospital"},
            {"Dr. Asanga Peiris", "asanga@mediconnect.com", "791234567V", "0771234572", "Urologist", "Kings Hospital"},
            {"Dr. Ruwanthi Senanayake", "ruwanthi@mediconnect.com", "831234567V", "0771234573", "Gastroenterologist", "Lanka Hospitals"},
            {"Dr. Chamara Bandara", "chamara@mediconnect.com", "761234567V", "0771234574", "Endocrinologist", "Hemas Hospital"},
            {"Dr. Dilini Jayawardena", "dilini@mediconnect.com", "871234567V", "0771234575", "Pulmonologist", "Asiri Central Hospital"},
            {"Dr. Shantha Kumara", "shantha@mediconnect.com", "691234567V", "0771234576", "Rheumatologist", "Durdans Hospital"},
            {"Dr. Sanjeewa Silva", "sanjeewa@mediconnect.com", "741234567V", "0771234577", "Nephrologist", "Nawaloka Hospital"},
            {"Dr. Kamal Fernando", "kamal@mediconnect.com", "711234567V", "0771234578", "General Surgeon", "Lanka Hospitals"},
            {"Dr. Malini Dias", "malini@mediconnect.com", "861234567V", "0771234579", "Dental Surgeon", "Kings Hospital"},
            {"Dr. Nalin Perera", "nalin@mediconnect.com", "781234567V", "0771234580", "Physiotherapist", "Hemas Hospital"},
            {"Dr. Saman Wijesinghe", "saman@mediconnect.com", "731234567V", "0771234581", "General Physician", "MediConnect Central"}
        };

        for (String[] data : doctorData) {
            try {
                if (userRepository.findByEmail(data[1]).isEmpty() && userRepository.findByNic(data[2]).isEmpty()) {
                    User doc = new User();
                    doc.setName(data[0]);
                    doc.setEmail(data[1]);
                    doc.setNic(data[2]);
                    doc.setMobileNumber(data[3]);
                    doc.setSpecialization(data[4]);
                    doc.setHospitalAttached(data[5]);
                    doc.setPassword(passwordEncoder.encode(seedDoctorPassword));
                    doc.setRole(Role.DOCTOR);
                    doc.setSlmcNumber("SLMC/" + (int)(Math.random() * 90000 + 10000));
                    doc.setApproved(true);
                    doc.setApprovedAt(java.time.LocalDateTime.now());
                    userRepository.save(doc);
                    System.out.println("Seeded Doctor: " + data[0]);
                }
            } catch (Exception e) {
                System.out.println("Detailed seeding error for " + data[0] + ": " + e.getMessage());
            }
        }
    }

    private void seedPatient() {
        try {
            Optional<User> patientOpt = userRepository.findByEmail("patient@gmail.com");
            Optional<User> patientNicOpt = userRepository.findByNic("961234567V");
            
            if (patientOpt.isEmpty() && patientNicOpt.isEmpty()) {
                User patient = new User();
                patient.setName("Test Patient");
                patient.setEmail("patient@gmail.com");
                patient.setPassword(passwordEncoder.encode(seedPatientPassword));
                patient.setRole(Role.PATIENT);
                patient.setNic("961234567V");
                patient.setMobileNumber("0779999999");
                patient.setGender("Male");
                patient.setDob("1990-01-01");
                userRepository.save(patient);
                System.out.println("Test Patient seeded successfully.");
            } else {
                System.out.println("DEBUG: Test Patient already exists (Email or NIC). Skipping seeding.");
            }
        } catch (Exception e) {
            System.out.println("WARNING: Failed to seed Test Patient: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getNic() != null && userRepository.findByNic(request.getNic()).isPresent()) {
            throw new RuntimeException("NIC already exists");
        }
        if (request.getSlmcNumber() != null && !request.getSlmcNumber().isEmpty() && userRepository.findBySlmcNumber(request.getSlmcNumber()).isPresent()) {
            throw new RuntimeException("SLMC Number already exists");
        }
        if (request.getMobileNumber() != null && userRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            throw new RuntimeException("Mobile Number already exists");
        }

        ensurePasswordStrength(request.getPassword());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        
        user.setMobileNumber(request.getMobileNumber());
        user.setNic(request.getNic());
        user.setGender(request.getGender());
        user.setDob(request.getDob());
        user.setDistrict(request.getDistrict());
        user.setSlmcNumber(request.getSlmcNumber());
        user.setSpecialization(request.getSpecialization());
        user.setHospitalAttached(request.getHospitalAttached());
        user.setAvailability(request.getAvailability());

        User savedUser = userRepository.save(user);

        CustomUserDetails details = new CustomUserDetails(savedUser);
        String token = jwtUtil.generateToken(details, savedUser.getRole().name(), savedUser.getId());
        String refresh = jwtUtil.generateRefreshToken(details, savedUser.getRole().name(), savedUser.getId());

        return new AuthResponse(token, refresh, mapToResponse(savedUser));
    }

    @Override
    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (Boolean.TRUE.equals(user.getSuspended())) {
            throw new RuntimeException("Your account has been suspended. Reason: " + user.getSuspensionReason());
        }

        if (user.getRole() == Role.DOCTOR && !Boolean.TRUE.equals(user.getApproved())) {
            throw new RuntimeException("Your account is pending administrator approval. Please try again later.");
        }

        String token = jwtUtil.generateToken(userDetails, user.getRole().name(), user.getId());
        String refresh = jwtUtil.generateRefreshToken(userDetails, user.getRole().name(), user.getId());
        return new AuthResponse(token, refresh, mapToResponse(user));
    }

    @Override
    public UserResponse createUser(UserRequest userRequest) {
        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setRole(userRequest.getRole());
        user.setPassword(passwordEncoder.encode("default123"));

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Admin Role Protection: prevent changing another admin's role
        if (existingUser.getRole() == Role.ADMIN && userRequest.getRole() != null && userRequest.getRole() != Role.ADMIN) {
            throw new RuntimeException("Cannot change the role of an administrator account.");
        }

        if (userRequest.getName() != null) existingUser.setName(userRequest.getName());
        if (userRequest.getEmail() != null) existingUser.setEmail(userRequest.getEmail());
        if (userRequest.getRole() != null) existingUser.setRole(userRequest.getRole());
        if (userRequest.getPassword() != null && !userRequest.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        // Profile completion fields
        if (userRequest.getMobileNumber() != null && !userRequest.getMobileNumber().equals(existingUser.getMobileNumber())) {
            if (userRepository.findByMobileNumber(userRequest.getMobileNumber()).isPresent()) {
                throw new RuntimeException("Mobile Number already exists");
            }
            existingUser.setMobileNumber(userRequest.getMobileNumber());
        }
        if (userRequest.getNic() != null && !userRequest.getNic().equals(existingUser.getNic())) {
            if (userRepository.findByNic(userRequest.getNic()).isPresent()) {
                throw new RuntimeException("NIC already exists");
            }
            existingUser.setNic(userRequest.getNic());
        }
        if (userRequest.getGender() != null) existingUser.setGender(userRequest.getGender());
        if (userRequest.getDob() != null) existingUser.setDob(userRequest.getDob());
        if (userRequest.getDistrict() != null) existingUser.setDistrict(userRequest.getDistrict());
        if (userRequest.getSlmcNumber() != null) existingUser.setSlmcNumber(userRequest.getSlmcNumber());
        if (userRequest.getSpecialization() != null) existingUser.setSpecialization(userRequest.getSpecialization());
        if (userRequest.getHospitalAttached() != null) existingUser.setHospitalAttached(userRequest.getHospitalAttached());
        if (userRequest.getAvailability() != null) existingUser.setAvailability(userRequest.getAvailability());

        User updatedUser = userRepository.save(existingUser);
        return mapToResponse(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        if (currentUser.getId().equals(id)) {
            throw new RuntimeException("You cannot delete your own admin account.");
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Last Admin Protection: prevent deleting the last admin
        if (existingUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot remove the last administrator account.");
            }
        }

        userRepository.delete(existingUser);
    }

    @Override
    public void forgotPassword(String email) {
        // Silently succeed if the account does not exist — prevents user enumeration.
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(Instant.now().plusSeconds(3600).toEpochMilli());
        userRepository.save(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid password reset token"));

        if (user.getResetTokenExpiry() < Instant.now().toEpochMilli()) {
            throw new RuntimeException("Password reset token has expired");
        }

        ensurePasswordStrength(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public AuthResponse refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token is required.");
        }
        if (tokenBlacklistService.isRevoked(refreshToken)) {
            throw new RuntimeException("Refresh token has been revoked.");
        }
        String tokenType;
        String email;
        try {
            tokenType = jwtUtil.extractTokenType(refreshToken);
            email = jwtUtil.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token.");
        }
        if (!com.healthcare.userservice.util.JwtUtil.TOKEN_TYPE_REFRESH.equals(tokenType)) {
            throw new RuntimeException("Provided token is not a refresh token.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        CustomUserDetails details = new CustomUserDetails(user);
        if (!jwtUtil.validateToken(refreshToken, details)) {
            throw new RuntimeException("Refresh token is expired or invalid.");
        }
        String newAccess = jwtUtil.generateToken(details, user.getRole().name(), user.getId());
        // Return the same refresh token; rotate only after elevated actions.
        return new AuthResponse(newAccess, refreshToken, mapToResponse(user));
    }

    @Override
    public AuthResponse loginWithGoogle(String googleToken, String role) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google Sign-In is not configured.");
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token.");
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            if ("admin@gmail.com".equalsIgnoreCase(email) || "ADMIN".equalsIgnoreCase(role)) {
                throw new RuntimeException("Google SSO is disabled for administrator accounts.");
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isEmpty()) {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                Role userRole = Role.PATIENT;
                if (role != null) {
                    try {
                        userRole = Role.valueOf(role.toUpperCase());
                    } catch (Exception e) {
                        // keep default
                    }
                }
                user.setRole(userRole);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setIsSsoUser(true);
                userRepository.save(user);
            } else {
                user = userOpt.get();
                // Ensure existing users logging in via Google are also flagged as SSO users
                if (user.getIsSsoUser() == null || !user.getIsSsoUser()) {
                    user.setIsSsoUser(true);
                    userRepository.save(user);
                }
            }

            if (Boolean.TRUE.equals(user.getSuspended())) {
                throw new RuntimeException("Your account has been suspended. Reason: " + user.getSuspensionReason());
            }

            CustomUserDetails details = new CustomUserDetails(user);
            String jwt = jwtUtil.generateToken(details, user.getRole().name(), user.getId());
            String refresh = jwtUtil.generateRefreshToken(details, user.getRole().name(), user.getId());
            return new AuthResponse(jwt, refresh, mapToResponse(user));
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token.");
        }
    }

    @Override
    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return mapToResponse(user);
    }

    @Override
    public UserResponse uploadProfilePic(Long id, MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        try {
            user.setProfileImageData(file.getBytes());
            user.setProfileImageContentType(file.getContentType());
            
            // Set internal URL for fetching the image
            String url = "/api/v1/users/" + id + "/profile-image";
            user.setProfilePicUrl(url);
            
            User savedUser = userRepository.save(user);
            return mapToResponse(savedUser);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read profile picture data", e);
        }
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        // Profile fields
        response.setMobileNumber(user.getMobileNumber());
        response.setNic(user.getNic());
        response.setGender(user.getGender());
        response.setDob(user.getDob());
        response.setDistrict(user.getDistrict());
        response.setSlmcNumber(user.getSlmcNumber());
        response.setSpecialization(user.getSpecialization());
        response.setHospitalAttached(user.getHospitalAttached());
        response.setAvailability(user.getAvailability());
        if (user.getProfileImageData() != null) {
            response.setProfilePicUrl(user.getProfilePicUrl());
        } else {
            response.setProfilePicUrl(null);
        }
        response.setAge(user.getAge());
        response.setSuspended(Boolean.TRUE.equals(user.getSuspended()));
        response.setSuspensionReason(user.getSuspensionReason());
        response.setApproved(Boolean.TRUE.equals(user.getApproved()));
        response.setIsSsoUser(Boolean.TRUE.equals(user.getIsSsoUser()));

        // Compute profile completeness based on role
        boolean complete = isNotEmpty(user.getNic()) && isNotEmpty(user.getMobileNumber());
        if (user.getRole() == Role.PATIENT) {
            complete = complete && isNotEmpty(user.getGender()) && isNotEmpty(user.getDob());
        } else if (user.getRole() == Role.DOCTOR) {
            complete = complete && isNotEmpty(user.getSlmcNumber())
                    && isNotEmpty(user.getSpecialization())
                    && isNotEmpty(user.getHospitalAttached());
        }
        // ADMIN is always considered complete
        if (user.getRole() == Role.ADMIN) complete = true;
        response.setProfileComplete(complete);

        return response;
    }

    @Override
    public UserResponse suspendUser(Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Last Admin Protection: prevent suspending the last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot suspend the last administrator account.");
            }
        }

        user.setSuspended(true);
        user.setSuspensionReason(reason);
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse unsuspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setSuspended(false);
        user.setSuspensionReason(null);
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setApproved(true);
        user.setApprovedAt(java.time.LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        // Notify the doctor via themed email
        try {
            emailService.sendApprovalEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.err.println("Non-critical error: Failed to send approval email to " + user.getEmail());
        }

        System.out.println("User " + user.getEmail() + " approved by admin.");
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        user.setApproved(false);
        user.setApprovedAt(null);
        User savedUser = userRepository.save(user);
        System.out.println("User " + user.getEmail() + " access rejected/reset by admin.");
        return mapToResponse(savedUser);
    }

    private boolean isNotEmpty(String s) {
        return s != null && !s.trim().isEmpty();
    }
}
