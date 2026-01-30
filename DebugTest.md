Logging

slf4j
logger.debug("Printing variable value: {}", variable);

@Slf4j
log.info("Student created, studentId={}", studentId);
log.error("Enrollment failed", ex);
log.debug("Calling student-service");


    ERROR: Denotes that something failed, and the application might not be able to continue running.
    WARN: Indicates a potential problem that might not immediately affect functionality but warrants attention.
    INFO: Provides general information about the application’s operation. Typically used to confirm things are working as expected.
    DEBUG: Offers detailed insights for developers to diagnose issues or understand the flow.
    TRACE: Gives more granular details than DEBUG, often including iterative or repetitive processes.


==============================================================
Profilers

application.properties (or application.yml): This file contains default and common configurations that apply to all environments unless overridden by a specific profile. You can also set the active profile here using 

spring.profiles.active=dev.

@Profile("prod") SPRING_PROFILES_ACTIVE=prod  

@Profile({"dev", "test"})

Use @Profile for:
✔ Different beans
✔ Different implementations
✔ Different infrastructure

@Configuration
@Profile("prod")
public class ProdDatabaseConfig {

    @Bean
    public DataSource dataSource() {
        // production-specific data source implementation
    }
}


=========================================================
Tools Used

Splunk - Log monitoring
index=prod_logs service=enrollment-service level=ERROR

Logstach -> Config Input where the log is Output elastic serch
, elastic search, Kibana

Dynatrace - Time and health check


==========================================================
# Swagger
@Api: To describe the entire controller.

@ApiOperation: To describe each API operation (endpoint).

@ApiParam: To describe method parameters.

@ApiResponse: To describe possible responses.


@Api(tags = "User Management")
@RestController
public class UserController {

    @ApiOperation(value = "Get a user by ID", notes = "Provide an ID to look up a specific user from the system")
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Successfully retrieved user"),
        @ApiResponse(code = 404, message = "User not found")
    })
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        // Get user by ID
        return new User(id, "John Doe");

200 OK: Successful request

201 Created: Resource created successfully

400 Bad Request: Invalid request (e.g., missing parameters)

401 Unauthorized: Authentication required

403 Forbidden: Access denied

404 Not Found: Resource not found

500 Internal Server Error: Server error

429 Too Many Requests


=======================================


Object
 └── Throwable
      ├── Error
      │    ├── OutOfMemoryError
      │    └── StackOverflowError
      │
      └── Exception
           ├── IOException (checked)
           ├── SQLException (checked)
           │
           └── RuntimeException (unchecked)
                ├── NullPointerException
                ├── ArithmeticException
                └── IllegalArgumentException
