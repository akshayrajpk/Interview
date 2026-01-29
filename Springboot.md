Design patterns:
https://www.designgurus.io/blog/19-essential-microservices-patterns-for-system-design-interviews?gad_source=1&gad_campaignid=23163907085&gclid=EAIaIQobChMIxJ7DxbOGkgMV36dmAh3Fqif0EAAYASAAEgK0bPD_BwE

Prototype in singleton:
@Component
public class SingletonBean {
    @Autowired
    private ObjectProvider<PrototypeBean> prototypeProvider;
    public void process() {
        PrototypeBean prototype = prototypeProvider.getObject();
        prototype.doWork();
    }
}
@Component
public class SingletonBean {
    public void process() {
        PrototypeBean prototype = getPrototype();
        prototype.doWork();
    }
    @Lookup
    protected PrototypeBean getPrototype() {
        return null; // Spring overrides this
    }
}
=========================================================================================
Bean Lifecycle

Constructor --> @Autowired
↓
BeanNameAware
↓
BeanFactoryAware
↓
ApplicationContextAware
↓
BeanPostProcessor.beforeInit
↓
@PostConstruct
↓
InitializingBean.afterPropertiesSet
↓
Custom init-method
↓
BeanPostProcessor.afterInit
↓
READY

The Spring IoC container initializes by reading configuration and building bean definitions, then instantiates singleton beans, resolves dependencies via constructor or setter injection, applies BeanFactoryPostProcessors and BeanPostProcessors, creates proxies for AOP concerns like transactions and security, manages the full bean lifecycle, and finally exposes fully initialized beans via the ApplicationContext.


====================================
@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/public/**").permitAll() // Public access
                    .requestMatchers("/admin/**").hasRole("ADMIN") // Role-based access
                    .anyRequest().authenticated() // All other requests require authentication
            );
        return http.build();
    }

=============================================
@Service
public class ProductService {

    // Only users with the 'ADMIN' role can access this method
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long productId) {
        // business logic
    }

    // Only the user whose username matches the 'username' argument can access this method
    @PreAuthorize("#username == authentication.principal.username")
    public UserProfile getUserProfile(String username) {
        // business logic
    }
}


========================================
Validations 

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRequest {

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 30)
    private String name;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Please provide a valid email")
    private String email;

    // Getters and setters...
}

//Controller

@PostMapping("/users")
    public ResponseEntity<String> addUser(@Valid @RequestBody UserRequest userRequest) {
        // Business logic if validation passes
        return ResponseEntity.ok("User is valid");
    }


# permgen vs metaspace

# volatile vs atomic keyword in java

| Memory Area   | Description                                                 | Lifetime / Management                                    | Size Limits                                            |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **Stack**     | Stores method calls and local variables                     | Automatically managed; space is freed when method exits. | Fixed size (can cause `StackOverflowError`)            |
| **Heap**      | Stores objects created using `new`                          | Managed by **Garbage Collector**                         | Configurable via `-Xmx` (max size)                     |
| **Metaspace** | Stores class metadata (class definitions, static variables) | Managed by JVM, dynamically grows (in Java 8+)           | Dynamic size; configurable with `-XX:MaxMetaspaceSize` |


==================================================================

application-{profile}.properties
---
spring:
  profiles: dev
server:
  port: 8081
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dev_db
    username: dev_user
    password: dev_password

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class DataSourceConfig {
    // Injecting values from application-dev.properties or application-prod.properties
    @Value("${db.url}")
    private String dbUrl;

    @Value("${db.username}")
    private String dbUsername;

    @Value("${db.password}")
    private String dbPassword;

    // Development profile bean
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        return new DataSource(dbUrl, dbUsername, dbPassword);
    }

    // Production profile bean
    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        return new DataSource(dbUrl, dbUsername, dbPassword);
    }
}

