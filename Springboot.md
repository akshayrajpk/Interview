Springboot versions

2.5 2021
2.7 2023


-------------------------------------

400 – Bad Request
Use when:

Invalid JSON
Missing required fields
Validation failed

401 – Unauthorized
403 – Forbidden User is authenticated but not allowed
404 – Not Found Resource doesn’t exist

409 – Conflict (VERY IMPORTANT)
Use when: Resource conflict, Duplicate data

500 – Internal Server Error
502 – Bad Gateway
503 – Service Unavailable
504 – Gateway Timeout

===================================

public class ApiResponse<T> {

    private boolean success;
    private int status;
    private String message;
    private T data;
    private Instant timestamp;

    public ApiResponse(boolean success, int status, String message, T data) {
        this.success = success;
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
    }

    // getters
}


public class ResponseUtil {
    public static <T> ResponseEntity<ApiResponse<T>> ok(
            String message, T data) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, 200, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(
            String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, 201, message, data));
    }

    public static ResponseEntity<ApiResponse<Void>> badRequest(
            String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, 400, message, null));
    }
}

# DTO
public record UserResponse(Long id, String name, String email) {}
public record CreateUserRequest(String name, String email) {}
public record UpdateUserRequest(String name, String email) {}
public record PatchUserRequest(String name) {}

======================================================================


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    /* ---------------- GET ---------------- */

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(
            @PathVariable Long id) {

        UserResponse user = service.getById(id);

        return ResponseUtil.ok("User fetched successfully", user);
    }

    /* ---------------- POST ---------------- */

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(
            @RequestBody CreateUserRequest request) {

        UserResponse createdUser = service.create(request);

        return ResponseUtil.created(
                "User created successfully", createdUser);
    }

    /* ---------------- PUT ---------------- */

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        UserResponse updated = service.update(id, request);

        return ResponseUtil.ok("User fully updated", updated);
    }

    /* ---------------- PATCH ---------------- */

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> patch(
            @PathVariable Long id,
            @RequestBody PatchUserRequest request) {

        UserResponse patched = service.patch(id, request);

        return ResponseUtil.ok("User partially updated", patched);
    }
}


========= Service -==================
public interface UserService {

    UserResponse create(CreateUserRequest request);

    UserResponse getById(Long id);

    UserResponse update(Long id, UpdateUserRequest request);

    UserResponse patch(Long id, PatchUserRequest request);

    void delete(Long id);
}

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /* ---------------- CREATE ---------------- */

    @Override
    public UserResponse create(CreateUserRequest request) {

        // Business validation
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());

        User saved = userRepository.save(user);

        return mapToResponse(saved);
    }

    /* ---------------- GET ---------------- */

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id " + id));

        return mapToResponse(user);
    }

    /* ---------------- PUT (FULL UPDATE) ---------------- */

    @Override
    public UserResponse update(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id " + id));

        // FULL REPLACEMENT
        user.setName(request.name());
        user.setEmail(request.email());

        return mapToResponse(userRepository.save(user));
    }

    /* ---------------- PATCH (PARTIAL UPDATE) ---------------- */

    @Override
    public UserResponse patch(Long id, PatchUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id " + id));

        // PARTIAL UPDATE
        if (request.name() != null) {
            user.setName(request.name());
        }

        return mapToResponse(userRepository.save(user));
    }

    /* ---------------- DELETE ---------------- */

    @Override
    public void delete(Long id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "User not found with id " + id);
        }

        userRepository.deleteById(id);
    }

    /* ---------------- MAPPER ---------------- */

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}



=====================
@PutMapping("/users/{id}")
public User updateUser(
    @PathVariable Long id,
    @RequestBody User request
) {
    User existing = userRepo.findById(id)
        .orElseThrow(() -> new NotFoundException());

    // PUT → replace
    existing.setName(request.getName());
    existing.setEmail(request.getEmail());
    existing.setPhone(request.getPhone()); // can become null

    return userRepo.save(existing);
}

@PatchMapping("/users/{id}")
public User patchUser(
    @PathVariable Long id,
    @RequestBody Map<String, Object> updates
) {
    User existing = userRepo.findById(id)
        .orElseThrow(() -> new NotFoundException());

    if (updates.containsKey("name")) {
        existing.setName((String) updates.get("name"));
    }

    if (updates.containsKey("email")) {
        existing.setEmail((String) updates.get("email"));
    }

    return userRepo.save(existing);
}
===================== With Builder =========================

@PutMapping("/users/{id}")
public User replaceUser(
        @PathVariable Long id,
        @RequestBody UserRequest request) {

    User existing = userRepo.findById(id)
            .orElseThrow(() -> new NotFoundException());

    User updated = User.builder()
            .id(existing.getId())          // preserve identity
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())     // may be null → correct
            .createdAt(existing.getCreatedAt())
            .build();

    return userRepo.save(updated);
}

DTO Patch 

@Data
public class UserPatchRequest {
    private Optional<String> name = Optional.empty();
    private Optional<String> email = Optional.empty();
    private Optional<String> phone = Optional.empty();
}

@PatchMapping("/users/{id}")
public User patchUser(
        @PathVariable Long id,
        @Valid @RequestBody UserPatchRequest request) {

    User existing = userRepo.findById(id)
            .orElseThrow(() -> new NotFoundException());

    User updated = User.builder()
            .id(existing.getId())
            .name(request.getName().orElse(existing.getName()))
            .email(request.getEmail().orElse(existing.getEmail()))
            .phone(request.getPhone().orElse(existing.getPhone()))
            .createdAt(existing.getCreatedAt())
            .build();

    return userRepo.save(updated);
}

========================================
# Dto validations

public record AddressRequest(
    @NotBlank
    String street,

    @NotBlank
    String city,

    @Pattern(
        regexp = "\\d{5,6}",
        message = "Invalid zip code"
    )
    String zipCode
) {}

public record CreateUserRequest(

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 100)
    String name,

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    String email
) {}

====================================================================
# Status
@PostMapping
public ResponseEntity<UserResponse> create(@RequestBody UserRequest req) {
    UserResponse saved = service.create(req);
    return ResponseEntity
#            .status(HttpStatus.CREATED)
            .body(saved);
}



