package com.myapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.ZonedDateTime;
import java.security.SecureRandom;
import java.util.Base64;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
        System.out.println("\n========================================");
        System.out.println("🚀 Spring Boot Application Started!");
        System.out.println("📡 Server running on: http://localhost:8080");
        System.out.println("📊 API Endpoint: http://localhost:8080/api/users");
        System.out.println("🗄️  Connected to Supabase Database");
        System.out.println("========================================\n");
    }

    // CORS Configuration
    @org.springframework.context.annotation.Bean
    public org.springframework.web.servlet.config.annotation.WebMvcConfigurer corsConfigurer() {
        return new org.springframework.web.servlet.config.annotation.WebMvcConfigurer() {
            @Override
            public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:5173",
                                "https://mxxjgqhlokmyljdgpwkx.supabase.co")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}

// ==================== USER ENTITY ====================
@Entity
@Table(name = "users")
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id", columnDefinition = "UUID")
    private java.util.UUID userId;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "user_image", columnDefinition = "TEXT")
    private String userImage;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    private java.time.ZonedDateTime createdAt;

    // Constructors
    public User() {
        this.createdAt = java.time.ZonedDateTime.now();
    }

    public User(String username, String password, String fullName, String userImage) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.userImage = userImage;
        this.createdAt = java.time.ZonedDateTime.now();
    }

    // Getters and Setters
    public java.util.UUID getUserId() {
        return userId;
    }

    public void setUserId(java.util.UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public java.time.ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

// ==================== SESSION ENTITY ====================
@Entity
@Table(name = "sessions")
class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "session_id", columnDefinition = "UUID")
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "login_time", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    private ZonedDateTime loginTime;

    @Column(name = "logout_time", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private ZonedDateTime logoutTime;

    @Column(name = "device_info", columnDefinition = "TEXT")
    private String deviceInfo;

    @Column(name = "is_active")
    private Boolean isActive;

    // Constructors
    public Session() {
        this.loginTime = ZonedDateTime.now();
        this.isActive = true;
    }

    public Session(UUID userId, String token, String deviceInfo) {
        this.userId = userId;
        this.token = token;
        this.deviceInfo = deviceInfo;
        this.loginTime = ZonedDateTime.now();
        this.isActive = true;
    }

    // Getters and Setters
    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public ZonedDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(ZonedDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public ZonedDateTime getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(ZonedDateTime logoutTime) {
        this.logoutTime = logoutTime;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

// ==================== REPOSITORIES ====================
interface UserRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}

interface SessionRepository extends JpaRepository<Session, UUID> {
    Optional<Session> findByToken(String token);

    List<Session> findByUserIdAndIsActive(UUID userId, Boolean isActive);

    @Modifying
    @Transactional
    @Query("UPDATE Session s SET s.isActive = false, s.logoutTime = :logoutTime WHERE s.token = :token")
    void deactivateSession(String token, ZonedDateTime logoutTime);
}

// ==================== REST API CONTROLLER ====================
@RestController
@RequestMapping("/api/users")
class UserController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private SessionRepository sessionRepo;

    // Token generator utility
    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[48];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // Get device info from request
    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        return "IP: " + ipAddress + " | User-Agent: " + userAgent;
    }

    // Health Check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("✅ API is running!");
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = repo.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable java.util.UUID id) {
        Optional<User> user = repo.findById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = repo.findByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new user (Sign Up)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody User user, HttpServletRequest request) {
        try {
            // Validate required fields
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Username is required"));
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Password is required"));
            }

            if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Full name is required"));
            }

            // Check if username already exists
            if (repo.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("Username already exists"));
            }

            // Set created timestamp
            user.setCreatedAt(ZonedDateTime.now());

            // Save user to database
            User savedUser = repo.save(user);

            // Generate session token
            String token = generateToken();
            String deviceInfo = getDeviceInfo(request);

            // Create and save session
            Session session = new Session(savedUser.getUserId(), token, deviceInfo);
            sessionRepo.save(session);

            // Return response with user data and token
            SignupResponse response = new SignupResponse(
                    savedUser.getUserId(),
                    savedUser.getUsername(),
                    savedUser.getFullName(),
                    savedUser.getUserImage(),
                    savedUser.getCreatedAt(),
                    token,
                    session.getSessionId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create user: " + e.getMessage()));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Username is required"));
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Password is required"));
            }

            Optional<User> userOpt = repo.findByUsername(loginRequest.getUsername());

            if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginRequest.getPassword())) {
                User user = userOpt.get();

                // Generate session token
                String token = generateToken();
                String deviceInfo = getDeviceInfo(request);

                // Create and save session
                Session session = new Session(user.getUserId(), token, deviceInfo);
                sessionRepo.save(session);

                // Return response with user data and token
                LoginResponse response = new LoginResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getUserImage(),
                        token,
                        session.getSessionId(),
                        session.getLoginTime());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid username or password"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Login failed: " + e.getMessage()));
        }
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable java.util.UUID id, @RequestBody User userDetails) {
        Optional<User> optionalUser = repo.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setUsername(userDetails.getUsername());
            user.setFullName(userDetails.getFullName());
            user.setPassword(userDetails.getPassword());
            user.setUserImage(userDetails.getUserImage());

            User updatedUser = repo.save(user);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable java.util.UUID id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== SESSION ENDPOINTS ====================

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest logoutRequest) {
        try {
            if (logoutRequest.getToken() == null || logoutRequest.getToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Token is required"));
            }

            Optional<Session> sessionOpt = sessionRepo.findByToken(logoutRequest.getToken());

            if (sessionOpt.isPresent()) {
                Session session = sessionOpt.get();
                session.setIsActive(false);
                session.setLogoutTime(ZonedDateTime.now());
                sessionRepo.save(session);

                return ResponseEntity.ok(new MessageResponse("Logout successful"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Session not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Logout failed: " + e.getMessage()));
        }
    }

    // Validate token
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody ValidateTokenRequest tokenRequest) {
        try {
            if (tokenRequest.getToken() == null || tokenRequest.getToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Token is required"));
            }

            Optional<Session> sessionOpt = sessionRepo.findByToken(tokenRequest.getToken());

            if (sessionOpt.isPresent() && sessionOpt.get().getIsActive()) {
                Session session = sessionOpt.get();
                Optional<User> userOpt = repo.findById(session.getUserId());

                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    TokenValidationResponse response = new TokenValidationResponse(
                            true,
                            user.getUserId(),
                            user.getUsername(),
                            user.getFullName(),
                            user.getUserImage(),
                            session.getSessionId());
                    return ResponseEntity.ok(response);
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new TokenValidationResponse(false));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Token validation failed: " + e.getMessage()));
        }
    }

    // Get active sessions for user
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<?> getUserSessions(@PathVariable UUID userId) {
        try {
            List<Session> sessions = sessionRepo.findByUserIdAndIsActive(userId, true);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch sessions: " + e.getMessage()));
        }
    }
}

// ==================== REQUEST/RESPONSE DTOs ====================

// Login Request
class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

// Logout Request
class LogoutRequest {
    private String token;

    public LogoutRequest() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

// Validate Token Request
class ValidateTokenRequest {
    private String token;

    public ValidateTokenRequest() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

// Signup Response
class SignupResponse {
    private UUID userId;
    private String username;
    private String fullName;
    private String userImage;
    private ZonedDateTime createdAt;
    private String token;
    private UUID sessionId;

    public SignupResponse() {
    }

    public SignupResponse(UUID userId, String username, String fullName, String userImage,
            ZonedDateTime createdAt, String token, UUID sessionId) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.userImage = userImage;
        this.createdAt = createdAt;
        this.token = token;
        this.sessionId = sessionId;
    }

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }
}

// Login Response
class LoginResponse {
    private UUID userId;
    private String username;
    private String fullName;
    private String userImage;
    private String token;
    private UUID sessionId;
    private ZonedDateTime loginTime;

    public LoginResponse() {
    }

    public LoginResponse(UUID userId, String username, String fullName, String userImage,
            String token, UUID sessionId, ZonedDateTime loginTime) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.userImage = userImage;
        this.token = token;
        this.sessionId = sessionId;
        this.loginTime = loginTime;
    }

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public ZonedDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(ZonedDateTime loginTime) {
        this.loginTime = loginTime;
    }
}

// Token Validation Response
class TokenValidationResponse {
    private Boolean valid;
    private UUID userId;
    private String username;
    private String fullName;
    private String userImage;
    private UUID sessionId;

    public TokenValidationResponse() {
    }

    public TokenValidationResponse(Boolean valid) {
        this.valid = valid;
    }

    public TokenValidationResponse(Boolean valid, UUID userId, String username, String fullName,
            String userImage, UUID sessionId) {
        this.valid = valid;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.userImage = userImage;
        this.sessionId = sessionId;
    }

    // Getters and Setters
    public Boolean getValid() {
        return valid;
    }

    public void setValid(Boolean valid) {
        this.valid = valid;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }
}

// Error Response
class ErrorResponse {
    private String error;

    public ErrorResponse() {
    }

    public ErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}

// Message Response
class MessageResponse {
    private String message;

    public MessageResponse() {
    }

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
