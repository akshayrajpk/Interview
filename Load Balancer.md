https://www.youtube.com/watch?v=ecuEkmFs5Vk service discovery 

https://www.youtube.com/watch?v=xv0Be4QfkH0 VImp https://www.youtube.com/watch?v=xv0Be4QfkH0

https://www.youtube.com/watch?v=0IDA6LXCUQo client vs serverside

https://www.youtube.com/watch?v=Q4XUptm9S8w fukk oda

https://www.youtube.com/watch?v=RqfaTIWc3LQ 

client -> Route 53 region -> cdn -> firewall -> External LB (app, network) -> ApiGateway (auth, ) -> LB -> Cache -> services -> Kafka

@Enable eureka server and @Enable eureka client @loadbalanced

Load Balancer MAIN Kubernetes handles: Service discovery, Load balancing, Health checks
Server-Side LB NGINX Server-Side Load Balancing Kubernetes Server-Side Load Balancing (Most Common)

NGINX, AWS ALB / ELB, Azure Load Balancer, Kubernetes Service

External load Balancer NGINX Give lost of ip instances -> proxy_pass 

Route through http://STUDENT-SERVICE/students not http://localhost:8081/students

For internal microservice communication, Spring Cloud LoadBalancer combined with service discovery (Eureka/Kubernetes DNS) is used.

Client-side load balancing in Spring Boot allows the calling service to pick a service instance from the discovery registry (Eureka/Consul) using algorithms like round-robin or random, avoiding a centralized load balancer.

Call Service by Name :

@GetMapping("/{studentId}")
    public String getStudentInfo(@PathVariable String studentId) {
        // student-service is service name in Eureka
        String url = "http://student-service/students/" + studentId;
        return restTemplate.getForObject(url, String.class);
    }

Spring Cloud LoadBalancer provides default round-robin.

# @LoadBalanced is used ONLY when:
A Spring component needs to call another microservice by SERVICE NAME over HTTP
Used with RestTemplate WebClient

@Bean
@LoadBalanced on Rest template bean

Load balancer inside a service:
@SpringBootApplication
@EnableDiscoveryClient  // Service Discovery

@Configuration
public class WebClientConfig {
    @Bean
    @LoadBalanced   // ⭐ THIS enables client-side load balancing //Client-side LB
    public WebClient.Builder loadBalancedWebClientBuilder() { //Web client, Rest template only
        return WebClient.builder();
    }
}

Controller
   ↓
Business Service
   ↓
Client Service (WebClient)
   ↓
Spring Cloud LoadBalancer
   ↓
Eureka / K8s DNS
   ↓
Target Microservice Instance


Service A
  |
  |-- ask Service Discovery (Eureka / Consul)
  |
  |-- get list of Service B instances
  |
  |-- select one instance (round-robin, random, etc.)
  |
  |-- send request directly
  v
Service B (one instance)


Client
  |
[ External Load Balancer ]
  |
[ API Gateway ]
  |-- Auth
  |-- Rate Limiting
  |
[ Service A ]
  |
  |-- (Client-side LB → Discovery → Pick instance)
  |           OR
  |-- (Service-side LB → Proxy → Instance)
  |
[ Service B ]


----------------------------------------------------------------------

Rate limiter: token bucket NGINX

rate limiter --> LB

RateLimiterConfig

extends once per req filter 

 protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("Too Many Requests");


=====================================================================================================================

Redis cache:

@Cacheable(value = "users", key = "#id")
@CacheEvict(value = "users", key = "#id")
@cachePut()


-------------------------=================================-----------------------------


@CircuitBreaker(name = "studentService", fallbackMethod = "fallback")
@Retry(name = "studentService")
@Bulkhead(name = "studentService", type = Bulkhead.Type.THREADPOOL)
@TimeLimiter(name = "studentService")
public CompletableFuture<Student> getStudent(String id) {
    return ...
}

👉 Example Scenario

Remote service becomes slow

Timeout triggers

Retry attempts (2–3 times)

Failures increase

Circuit breaker opens

Further calls fail fast

Bulkhead prevents thread exhaustion
============================================================================================

Client
  |
[ External Load Balancer ]
  |
[ API Gateway ]
  |-- Auth
  |-- Rate Limiting
  |
[ Service A ]
  |
  |-- (Client-side LB → Discovery → Pick instance)
  |           OR
  |-- (Service-side LB → Proxy → Instance)
  |
[ Service B ]


Client-side LB is often combined with:

Retry

Circuit Breaker

Timeout

Bulkhead




-----------------------------------------------------
resilience4j:
  thread-pool-bulkhead:
    instances:
      studentService:
        coreThreadPoolSize: 5
        maxThreadPoolSize: 10
        queueCapacity: 20

  timelimiter:
    instances:
      studentService:
        timeoutDuration: 2s

  retry:
    instances:
      studentService:
        maxAttempts: 3
        waitDuration: 200ms

  circuitbreaker:
    instances:
      studentService:
        failureRateThreshold: 50
        waitDurationInOpenState: 30s


Scenario 1: Dependency is Slow
Bulkhead OK
→ TimeLimiter expires
→ Retry triggers
→ Circuit breaker records failure
→ Fallback


Outcome:

Threads freed

No cascade

Failure contained


Scenario 2: Dependency is Down
Failures accumulate
→ Circuit breaker opens
→ Calls fail fast
→ No retries
→ Bulkhead threads protected

System stays responsive


Scenario 3: Traffic Spike
Thread pool full
→ Bulkhead rejects
→ No retry
→ Circuit breaker unaffected


Outcome:

Service doesn’t crash

Backpressure applied

Bulkhead protects threads, TimeLimiter protects time, Retry handles transient errors, and Circuit Breaker prevents repeated failures — in that order.


@Bulkhead(name = "paymentService")
@TimeLimiter(name = "paymentService")
@Retry(name = "paymentService")
@CircuitBreaker(name = "paymentService", fallbackMethod = "fallback")
public CompletableFuture<Payment> pay() {
    return CompletableFuture.supplyAsync(() -> paymentClient.pay());
}


=========================================================================
Full Program

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
                .baseUrl("http://payment-service")
                .build();
    }
}

@Component
@RequiredArgsConstructor
public class PaymentClient {
    private final WebClient webClient;
    public Mono<PaymentResponse> pay(PaymentRequest request) {
        return webClient.post()
                .uri("/pay")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PaymentResponse.class);
    }
}

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentClient paymentClient;

    @Bulkhead(name = "paymentService", type = Bulkhead.Type.SEMAPHORE)
    @Retry(name = "paymentService")
    @CircuitBreaker(
            name = "paymentService",
            fallbackMethod = "paymentFallback"
    )
    @TimeLimiter(name = "paymentService")
    public Mono<PaymentResponse> makePayment(PaymentRequest request) {

        log.info("Calling Payment Service");
        return paymentClient.pay(request);
    }

    // 🔥 Fallback must match method signature + Throwable
    private Mono<PaymentResponse> paymentFallback(
            PaymentRequest request,
            Throwable ex) {

        log.error("Payment service failed, fallback triggered", ex);

        return Mono.just(
                new PaymentResponse("FAILED", "Payment service unavailable")
        );
    }
}


@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public Mono<ResponseEntity<PaymentResponse>> pay(
            @RequestBody PaymentRequest request) {

        return paymentService.makePayment(request)
                .map(ResponseEntity::ok);
    }

     @PostMapping
    public CompletableFuture<ResponseEntity<PaymentResponse>> pay(
            @RequestBody PaymentRequest request) {

        return paymentService.makePayment(request)
                .thenApply(ResponseEntity::ok);
    }
}

Request
 ↓
Bulkhead → limits concurrency
 ↓
TimeLimiter → fails slow calls
 ↓
Retry → handles transient failures
 ↓
CircuitBreaker → stops cascading failures
 ↓
Payment Service

“We use WebClient with Resilience4j, applying bulkhead, timeout, retry, and circuit breaker at service level to prevent cascading failures and ensure graceful degradation.”


