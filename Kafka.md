Kafka

Kafka brokers: Kafka brokers are standalone servers that make up the storage layer.

Kafka cluster: Kafka cluster consists of multiple kafka broker nodes.

Topic: Kafka topics are at the high level and messages are sent to and read from the topic. Topics are the categories used to organize messages and they have unique names inside a kafka cluster.

Partition: Topics are partitioned and distributed across the brokers to enable parallelization and high throughput

Replica: Each partition can be replicated across the brokers. This is like placing a copy of a partition into another broker for data replication and high availability.

Replication factor = how partitions are distributed among different brokers

Kafka Replication Factor: Kafka replication factor refers to the total number of replicas (including the leader) for each partition. This determines the fault tolerance and availability of the partition.

Segment: Each partition is broken down into segments. Segments are actual files that hold the data in a disk on the broker server (The physical storage unit).

segment.ms decide how long msg stays default7
segment.bytes segment file size def 1gb

# kafkaTemplate.send(topic, key, message); Based on key hash the partition is decided.

Partitions are set during the creation of the topic via Kafka's Admin API, CLI, or configuration.

The Kafka producer typically doesn't specify the number of partitions — it's automatically handled by Kafka (based on key or custom partitioner).
The Kafka consumer automatically gets assigned partitions by Kafka.

kafkaTemplate.send("payment-topic", paymentEvent);
@KafkaListener(topics = "payment-topic")
public void consume(PaymentEvent event) {  // process  }

@KafkaListener(topics = "orders", groupId = "order-service")

# ===============================================================================================
# industry grade sender

Topic: student-registered
Key: studentId
Payload: DomainEvent<StudentRegistered>


public class DomainEvent<T> {

    private String eventId;          // UUID
    private String eventType;        // STUDENT_REGISTERED
    private String aggregateId;      // studentId
    private String correlationId;    // saga / request
    private Instant occurredAt;
    private int version;
    private T payload;
}
public class StudentRegistered {

    private String studentId;
    private String courseId;
    private String semester;
}

public void publishStudentRegistered(Student student) {
    DomainEvent<StudentRegistered> event =
        DomainEvent.<StudentRegistered>builder()
            .eventId(UUID.randomUUID().toString())
            .eventType("STUDENT_REGISTERED")
            .aggregateId(student.getId())
            .correlationId(MDC.get("correlationId"))
            .occurredAt(Instant.now())
            .version(1)
            .payload(new StudentRegistered(
                student.getId(),
                student.getCourseId(),
                student.getSemester()
            ))
            .build();
    Message<DomainEvent<StudentRegistered>> message =
        MessageBuilder
            .withPayload(event)
            .setHeader(KafkaHeaders.TOPIC, "student-registered")
            .setHeader(KafkaHeaders.KEY, student.getId())
            .setHeader("eventType", event.getEventType())
            .setHeader("correlationId", event.getCorrelationId())
            .build();
    kafkaTemplate.send(message);
}

kafkaTemplate.send(message)
    .whenComplete((result, ex) -> {
        if (ex != null) {
            log.error("Failed to publish STUDENT_REGISTERED", ex);
            // trigger retry / alert
        }
    });

<!-- settings  -->
spring.kafka.producer.acks=all
spring.kafka.producer.enable-idempotence=true
spring.kafka.producer.retries=2147483647
spring.kafka.producer.max-in-flight-requests-per-connection=5
spring.kafka.producer.compression-type=snappy

Every service can:
Log correlationId
Enforce idempotency via eventId
Handle version upgrades safely

Send With Transaction (Very Common)
@Transactional("kafkaTransactionManager")
public void registerStudent(Student student) {
    studentRepository.save(student);
    kafkaTemplate.send(message);
}


--------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------

# Listener Industry grade

@Slf4j
@Component
public class StudentRegisteredListener {

    private final EnrollmentRepository enrollmentRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public StudentRegisteredListener(
            EnrollmentRepository enrollmentRepository,
            ProcessedEventRepository processedEventRepository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.enrollmentRepository = enrollmentRepository;
        this.processedEventRepository = processedEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 3000),
        dltTopicSuffix = "-DLT"
    )

#   @Transactional("kafkaTransactionManager") //Container-managed offset commits

    @KafkaListener(
        topics = "student-registered",
        groupId = "exam-service"
    )
    public void onStudentRegistered(
            DomainEvent<StudentRegistered> event,
            @Header(KafkaHeaders.RECEIVED_MESSAGE_KEY) String studentId) {

        log.info("Received STUDENT_REGISTERED for studentId={}", studentId);

        // 1️⃣ Idempotency check
        if (processedEventRepository.existsById(event.getEventId())) {
            log.info("Event {} already processed, skipping", event.getEventId());
            return;
        }

        // 2️⃣ Business validation
        validate(event);

        // 3️⃣ Persist state
        enrollmentRepository.save(
            new Enrollment(
                event.getPayload().getStudentId(),
                event.getPayload().getCourseId(),
                event.getPayload().getSemester()
            )
        );

        // 4️⃣ Publish next saga event
        publishExamEnrolled(event);

        // 5️⃣ Mark event processed
        processedEventRepository.save(
            new ProcessedEvent(event.getEventId())
        );
    }

    private void validate(DomainEvent<StudentRegistered> event) {
        if (event.getPayload().getStudentId() == null) {
            throw new IllegalArgumentException("Invalid student event");
        }
    }

    private void publishExamEnrolled(DomainEvent<StudentRegistered> event) {

        DomainEvent<ExamEnrolled> enrolledEvent =
            DomainEvent.<ExamEnrolled>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("EXAM_ENROLLED")
                .aggregateId(event.getAggregateId())
                .correlationId(event.getCorrelationId())
                .occurredAt(Instant.now())
                .version(1)
                .payload(new ExamEnrolled(
                    event.getPayload().getStudentId(),
                    event.getPayload().getCourseId()
                ))
                .build();

        kafkaTemplate.send(
            MessageBuilder
                .withPayload(enrolledEvent)
                .setHeader(KafkaHeaders.TOPIC, "exam-enrolled")
                .setHeader(KafkaHeaders.KEY, event.getAggregateId())
                .setHeader("correlationId", event.getCorrelationId())
                .build()
        );
    }
}

@KafkaListener(
    topics = "student-registered-DLT",
    groupId = "exam-service-dlt"
)
public void handleDLQ(
        DomainEvent<StudentRegistered> event,
        @Headers Map<String, Object> headers) {

    log.error(
        "DLQ event {} failed permanently. Reason: {}",
        event.getEventId(),
        headers.get("kafka_dlt-exception-message")
    );

    kafkaTemplate.send(
        "exam-enrollment-failed",
        event.getAggregateId(),
        new ExamEnrollmentFailed(
            event.getAggregateId(),
            "PERMANENT_FAILURE"
        )
    );
}

# Consumer
spring.kafka.consumer.enable-auto-commit=false
spring.kafka.consumer.isolation-level=read_committed
spring.kafka.consumer.max-poll-records=10

# Listener
spring.kafka.listener.ack-mode=MANUAL

# Retry Topics
spring.kafka.retry.topic.enabled=true

<!-- Required Producer Settings (Because Consumer Produces) -->
spring.kafka.producer.enable-idempotence=true
spring.kafka.producer.acks=all
spring.kafka.producer.retries=2147483647
spring.kafka.producer.transaction-id-prefix=exam-tx-




===============================================================================================
-----------------------------------------------------------------------------------

# A consumer group is a set of consumers that coordinate to consume messages from one or more Kafka topics in parallel.

Each consumer in a consumer group reads messages from different partitions of the topic.
Kafka guarantees that each partition will be consumed by only one consumer within a consumer group at any given time.

Key Features of Kafka Consumer Groups:
Parallel Consumption: Kafka divides topics into partitions. By having multiple consumers in the same group, you can have parallel consumption (scale horizontally).

Fault Tolerance: If one consumer fails, Kafka will rebalance and assign the partitions of the failed consumer to the remaining consumers in the group. This increases resilience.

Message Processing Guarantee: Kafka ensures exactly-once or at-least-once delivery semantics depending on the settings.

Example Scenario:
Topic: orders with 4 partitions
Consumer Group: order-service with 2 consumers
The 2 consumers will read from 2 partitions each. The partitions will be evenly distributed between the consumers.

-----------------------------------------------------
A rebalance happens when:

A new consumer joins a consumer group

A consumer leaves or fails

The number of partitions in the topic changes (e.g., if more partitions are added)

When a rebalance occurs:

Kafka reassigns partitions to the available consumers in the group.

Consumers may stop processing messages temporarily during a rebalance, which can cause a slight latency increase.

The goal of a rebalance is to redistribute partitions as evenly as possible across the consumers in the group.

Message Duplication: Both consumer groups read the same messages from the topic. The messages are not duplicated across groups. They are independently processed.

Independent Offsets: Each consumer group tracks its own offsets for the same topic. Kafka does not share offsets between groups. So, Group A may have consumed up to offset 100, while Group B could have consumed up to offset 50, for example.
==================================================================================================
1. Adjusting concurrency
The most common way to add more consumers within a single application instance is to set the concurrency property in your application.properties or application.yml file. This tells Spring Boot to create multiple threads (consumers) to handle messages from the same topic and consumer group [1, 2]. 
properties

# application.properties
# spring.kafka.listener.concurrency=3

This configuration will create three concurrent consumers for all @KafkaListener methods in your application that do not override this setting [1, 3]. 

Per-Listener Concurrency
You can also set the concurrency for a specific listener by adding the concurrency attribute to the 
@KafkaListener annotation: 

@KafkaListener(topics = "myTopic", groupId = "myGroup", concurrency = "4")
public void listenToMyTopic(String message) {
    // ... handle message ...
}

This consumer will run with four threads, overriding the global default [1]. 

2. Scaling Application Instances
In a production environment, you typically scale consumers by running multiple instances of your Spring Boot application [4]. When multiple instances of the same application (using the same groupId) are running, Kafka automatically distributes the topic partitions among the available consumers. 

    If you have one instance running with concurrency=3, you have 3 consumers.
    If you deploy three instances, each with concurrency=1, you also have 3 consumers total, but they are distributed across separate JVMs [4]. 

Using container orchestration tools like Kubernetes is ideal for this, as it allows you to dynamically scale the number of application pods (instances) based on load [4]. 
Important Considerations

    Partitions are key: You can only have as many active consumers in a group as you have partitions in the topic [1, 3]. If a topic has 5 partitions, setting concurrency=10 (or running 10 app instances) will result in 5 consumers being idle. Each consumer will be assigned at most one partition [1, 3].
    Rebalancing: When consumers are added or removed (e.g., due to scaling), Kafka initiates a group rebalance, reassigning partitions to ensure even distribution among the active consumers [4].
    Stateful Consumers: Be mindful of shared state if you scale up concurrency within a single application instance. Stateless processing is simpler to scale [4]


    ---------------------------------------------------------
@RetryableTopic(
  attempts = "3",
  backoff = @Backoff(delay = 5000),
  dltTopicSuffix = "-dlt"
)
@KafkaListener(topics = "orders")
public void consume(OrderEvent event) {
    ...
}

b) Dead Letter Topic (DLT)

After retries exhausted:

Failed Event → DLT
Handled manually or via compensating action.

===================================================================================
✅ DOs (Producer)

✅ Enable acks=all
✅ Enable idempotence
✅ Use keys for ordering
✅ Use retries (producer-side)
✅ Log and track send failures
✅ Use async send() with callback

❌ DON’Ts (Producer)

❌ Fire-and-forget
❌ No key (breaks ordering)
❌ Rely on KafkaListener try/catch to save data
❌ Ignore send exceptions
❌ Disable retries in production

2️⃣ Kafka Consumer – DOs & DON’Ts
✅ DOs (Consumer)

✅ Use manual acknowledgment
✅ Use RetryableTopic
✅ Use DLQ
✅ Make consumer idempotent
✅ Fail fast → let Kafka retry
✅ Log with message key + offset

❌ DON’Ts (Consumer)

❌ Catch exception and swallow it
❌ Auto-commit offsets
❌ Long blocking logic inside listener
❌ Business retries inside listener
❌ Assume Kafka guarantees exactly-once magically


@Configuration
public class KafkaProducerConfig {
    @Bean
    public ProducerFactory<String, OrderEvent> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // IMPORTANT SETTINGS
        config.put(ProducerConfig.ACKS_CONFIG, "all"); // strongest durability
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.RETRIES_CONFIG, 5);
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, OrderEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}


@Service
public class OrderProducer {
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;
    public OrderProducer(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    public void sendOrder(OrderEvent event) {
        // KEY is important for ordering
        kafkaTemplate.send("order-topic", event.getOrderId(), event)
            .addCallback(
                result -> {
                    // SUCCESS
                    System.out.println("Sent order " + event.getOrderId());
                },
                ex -> {
                    // FAILURE → log + alert
                    System.err.println("Failed to send order " + event.getOrderId());
                }
            );
    }
}

@Configuration
@EnableKafka
public class KafkaConsumerConfig {
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderEvent>
    kafkaListenerContainerFactory(
            ConsumerFactory<String, OrderEvent> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, OrderEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);

        // MANUAL ACK
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);

        return factory;
    }
}

@Component
public class OrderConsumer {
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 2000, multiplier = 2),
        autoCreateTopics = "true",
        dltTopicSuffix = "-DLT"
    )
    @KafkaListener(
        topics = "order-topic",
        groupId = "order-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void listen(
            OrderEvent event,
            Acknowledgment ack
    ) {

        // DO NOT CATCH EXCEPTION HERE
        processOrder(event);

        // ACK ONLY AFTER SUCCESS
        ack.acknowledge();
    }

    private void processOrder(OrderEvent event) {
        if (event.isInvalid()) {
            throw new RuntimeException("Invalid order");
        }
        System.out.println("Processed order " + event.getOrderId());
    }
}

public void processOrder(OrderEvent event) {
    if (orderAlreadyProcessed(event.getOrderId())) {
        return;
    }
    saveOrder(event);
}

Producer

acks=all

enable.idempotence=true

retries enabled

message key used

Consumer

manual ack

RetryableTopic

DLQ

idempotent logic

no try/catch swallowing


=================================================================================
Producer retries are send retries, NOT business retries.
They happen before the message is committed to Kafka.
Producer config acks=all enable.idempotence=true retries=5

Producer sends record to leader
Leader writes to log
Leader waits for ISR replicas
ACK sent back to producer
If ACK not received → producer retries automatically

Manual Acknowledgment (CORRECT WAY)
@KafkaListener(...)
public void listen(Event e, Acknowledgment ack) {
    process(e);
    ack.acknowledge();
}


What Happens If You NEVER Ack?
This is critical.
Case: Listener crashes before ack
Offset not committed
↓
Consumer restarts
↓
Message reprocessed

✔ Safe
❌ Possible duplicate processing

Case: Listener keeps failing
Same message re-delivered
↓
Same message re-delivered
↓
INFINITE LOOP

his is why RetryableTopic / DLQ is required.

What you MUST combine with manual ack:
Feature	Why
RetryableTopic	Controlled retries
DLQ	Final failure handling
Idempotent consumer	Prevent duplicates
Proper exception handling	Fail fast

@RetryableTopic(attempts = "3")
@KafkaListener(topics = "order-topic", ackMode = "MANUAL")
public void listen(OrderEvent event, Acknowledgment ack) {
    process(event); // throws exception if fails
    ack.acknowledge(); // commit only on success
}

What Happens If No Ack + RetryableTopic?
Scenario	Outcome
Exception thrown	Message sent to retry topic
Ack not called	Offset not committed
Retry exhausted	Message sent to DLT
Consumer restarts	Message re-delivered

listenerMethodCompletedWithoutException == SUCCESS if use try catch in listener

How DLQ Actually Works
With @RetryableTopic
Main Topic
   ↓
Retry Topic 1
   ↓
Retry Topic 2
   ↓
Retry Topic 3
   ↓
DLT (Dead Letter Topic)

@RetryableTopic(
    attempts = "3",
    backoff = @Backoff(delay = 2000),
    dltTopicSuffix = "-DLT",
    autoCreateTopics = "true" //Creates retry topics
)
@KafkaListener(topics = "order-topic")
public void listen(OrderEvent event) {
    process(event);
}

@KafkaListener(topics = "order-topic-DLT")
public void handleDLQ(OrderEvent event, @Headers Map<String, Object> headers) {
    log.error("DLQ message from topic {} reason {}",
        headers.get("kafka_dlt-original-topic"),
        headers.get("kafka_dlt-exception-message"));
    // Persist, alert, or replay
}


=============================================================================================
# Idempotency

Producer retries can cause duplicate records when:
Network failure
Leader failover
Timeout after write but before ACK

Kafka assigns:
producerId (PID), Sequence number per partition

Same PID + same sequence number → discard duplicate

enable.idempotence=true
acks=all
retries=Integer.MAX_VALUE
max.in.flight.requests.per.connection=5
--------------------------------
Consumer-Side Idempotency (MOST IMPORTANT)
Kafka does NOT handle this automatically.

@Transactional("kafkaTransactionManager")
@KafkaListener(topics = "order-created")
public void listen(OrderCreatedEvent event) {

    if (alreadyProcessed(event.getOrderId())) return;

    updateDB(event);
    kafkaTemplate.send("order-paid", event);
}

Settings enable.auto.commit=false isolation.level=read_committed

| Layer        | Required          |
| ------------ | ----------------- |
| Producer     | Idempotence ON    |
| Consumer     | Manual Ack        |
| Consumer     | Idempotency logic |
| Retry        | RetryableTopic    |
| Failure      | DLQ               |
| Saga         | Compensation      |
| Ordering     | Partition key     |
| Transactions | Optional          |

@KafkaListener(topics = "student-registered-DLT")
public void handleDLQ(StudentRegisteredEvent event) {

    kafkaTemplate.send(
        "exam-enrollment-failed",
        event.getStudentId(),
        new ExamEnrollmentFailedEvent(event.getStudentId(), "SYSTEM_ERROR")
    );
}

DLQ & Saga in Student Domain

@KafkaListener(topics = "student-registered-DLT")
public void handleDLQ(StudentRegisteredEvent event) {

    kafkaTemplate.send(
        "exam-enrollment-failed",
        event.getStudentId(),
        new ExamEnrollmentFailedEvent(event.getStudentId(), "SYSTEM_ERROR")
    );
}

@KafkaListener(topics = "exam-enrollment-failed")
public void handleFailure(ExamEnrollmentFailedEvent event) {

    studentRepository.updateStatus(
        event.getStudentId(),
        StudentStatus.PENDING_RETRY
    );
}

Using Kafka transactions inside a consumer is valid for short, deterministic saga steps such as exam enrollment, but large domains like student registration require sagas, idempotency, and often the outbox pattern to handle long-running workflows and partial failures safely.



===============================================================================
So Is This Code SAFE Without Manual Ack?

Yes — IF AND ONLY IF:
These conditions are met:
| Requirement                        | Needed |
| ---------------------------------- | ------ |
| Kafka transactions enabled         | ✅      |
| Producer idempotence               | ✅      |
| `isolation.level=read_committed`   | ✅      |
| No try/catch swallowing exceptions | ✅      |

# Producer (because listener produces)
spring.kafka.producer.transaction-id-prefix=exam-tx-
spring.kafka.producer.enable-idempotence=true

# Consumer
spring.kafka.consumer.enable-auto-commit=false
spring.kafka.consumer.isolation-level=read_committed

If we remove @Transactional
@KafkaListener(topics = "student-registered")
public void listen(
        DomainEvent<StudentRegistered> event,
        Acknowledgment ack) {

    process(event);

    ack.acknowledge(); // REQUIRED
}

--------------------------

@EnableRetry
@EnableKafka
@Service

  @Retryable(maxAttempts = 5, backoff = @Backoff(delay = 2000, multiplier = 2))
    @KafkaListener(topics = "topicName")

Different Consumer Groups:

Producer → Kafka → Consumer A (Analytics): Processes messages for analytics.

Producer → Kafka → Consumer B (Billing): Processes messages for billing.

Producer → Kafka → Consumer C (Notification): Sends notifications for new orders.


