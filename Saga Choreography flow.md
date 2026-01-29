Saga Choreography flow

Let’s assume:
OrderService → produces event
PaymentService → consumes it
Saga choreography is used

orderProducer.send(new OrderCreatedEvent(orderId));

@RetryableTopic(attempts = "3")
@KafkaListener(topics = "order-created")
public void consume(OrderCreatedEvent event) {
    processPayment(event); // ❌ throws exception // Consumer fails
}

Step 3: Retry Exhausted → Message Goes to DLQ
✔ Message is NOT lost
✔ Offset is committed
✔ Saga must now compensate

order-created
   ↓
order-created-retry-0
   ↓
order-created-retry-1
   ↓
order-created-DLT   ✅

2️⃣ CRITICAL: Who Reads the DLQ? The SAME failing service (PaymentService)

Correct Saga Choreography Flow
OrderService → OrderCreated
PaymentService → PaymentCompleted / PaymentFailed
InventoryService → InventoryReserved / InventoryFailed

@KafkaListener(topics = "order-created-DLT")
public void handlePaymentFailure(
        OrderCreatedEvent event,
        @Headers Map<String, Object> headers) {
    log.error("Payment failed permanently for order {}", event.getOrderId());
    // Publish compensation event
    kafkaTemplate.send(
        "payment-failed",
        event.getOrderId(),
        new PaymentFailedEvent(event.getOrderId())
    );
}

@KafkaListener(topics = "payment-failed")
public void onPaymentFailed(PaymentFailedEvent event) {
    // Compensating action
    orderRepository.updateStatus(
        event.getOrderId(),
        OrderStatus.CANCELLED
    );
    // Optional: notify user
}

<!--  -->
// Kafka Transactions + Saga (CRITICAL PART)
Kafka transactions ensure:
Either consume + produce both happen OR neither happen

@Transactional("kafkaTransactionManager")
@KafkaListener(topics = "order-created")
public void process(OrderCreatedEvent event) {
    // 1️⃣ Idempotency check
    if (alreadyProcessed(event.getOrderId())) return;
    // 2️⃣ Update DB
    paymentRepository.save(event.getOrderId());
    // 3️⃣ Produce next saga event
    kafkaTemplate.send(
        "payment-completed",
        event.getOrderId(),
        new PaymentCompletedEvent(event.getOrderId())
    );
}









