      +-----------+
      |   NEW     |
      +-----------+
            |
            v start()
      +-----------+
      | RUNNABLE  |
      +-----------+
            |
      JVM Scheduler
            |
            v
      +-----------+
      |  RUNNING  |
      +-----------+
        /   |   \
       /    |    \
BLOCKED   WAITING  TIMED_WAITING
       \    |    /
        \   v   /
      +-----------+
      | TERMINATED|
      +-----------+

| State             | Description                                       | How to Enter    

| **NEW**           | Thread object created but not started             | `Thread t = new Thread(...);` 
| **RUNNABLE**      | Thread is ready to run; waiting for CPU           | `t.start();`     
| **RUNNING**       | Thread is actively executing                      | JVM scheduler picks it from RUNNABLE   
| **BLOCKED**       | Waiting for a monitor lock (synchronized block)   | Trying to enter a synchronized block held by another thread           |
| **WAITING**       | Waiting indefinitely for another thread to notify | `Object.wait()` without timeout or `LockSupport.park()`               |
| **TIMED_WAITING** | Waiting for a specified time                      | `Thread.sleep(ms)`, `wait(ms)`, `join(ms)`, `LockSupport.parkNanos()` |
| **TERMINATED**    | Thread finished execution                         | `run()` method completes 


public class ThreadLifecycleDemo {
    public static void main(String[] args) throws InterruptedException {
        Object lock = new Object();

        Thread t = new Thread(() -> {
            System.out.println(Thread.currentThread().getState()); // RUNNING
            synchronized(lock) {
                try {
                    lock.wait(1000); // TIMED_WAITING
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("Thread finished"); // TERMINATED soon after
        });

        System.out.println(t.getState()); // NEW
        t.start();
        Thread.sleep(200);
        System.out.println(t.getState()); // RUNNABLE or TIMED_WAITING
        t.join();
        System.out.println(t.getState()); // TERMINATED
    }
}


| Executor                           | Use Case             |
| ---------------------------------- | -------------------- |
| `ThreadPoolTaskExecutor`           | Async tasks, @Async  |
| `TaskScheduler`                    | Scheduled jobs       |
| `ForkJoinPool`                     | Parallel computation |
| `VirtualThreadExecutor` (Java 21+) | Massive concurrency  |


ExecutorService executor = Executors.newFixedThreadPool(10);

executor.submit(() -> processOrder(order));

ExecutorService executor = Executors.newFixedThreadPool(3);

Future<Boolean> inventory = executor.submit(this::checkInventory);
Future<Boolean> payment = executor.submit(this::processPayment);
Future<Boolean> shipping = executor.submit(this::prepareShipping);

inventory.get();
payment.get();
shipping.get();

ExecutorService executor = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors()
);

for (File file : files) {
    executor.submit(() -> processFile(file));
}

ExecutorService executor = Executors.newSingleThreadExecutor();

executor.submit(() -> sendEmail(user));
executor.submit(() -> sendSMS(user));

ScheduledExecutorService scheduler =
        Executors.newScheduledThreadPool(1);

scheduler.scheduleAtFixedRate(
        this::cleanupSessions,
        0,
        10,
        TimeUnit.MINUTES
);


ExecutorService executor = Executors.newFixedThreadPool(5);

consumerRecords.forEach(record ->
    executor.submit(() -> processMessage(record))
);

ExecutorService executor = Executors.newWorkStealingPool();

executor.submit(() -> processChunk(chunk1));
executor.submit(() -> processChunk(chunk2));

| Executor               | Real-Life Use            |
| ---------------------- | ------------------------ |
| `FixedThreadPool`      | API calls, DB operations |
| `CachedThreadPool`     | Short-lived tasks        |
| `SingleThreadExecutor` | Logging, ordering tasks  |
| `ScheduledThreadPool`  | Cron jobs                |
| `WorkStealingPool`     | CPU-intensive tasks      |

enterprise grade 

ThreadPoolExecutor executor = new ThreadPoolExecutor(
        5,
        10,
        60,
        TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(100),
        new ThreadPoolExecutor.CallerRunsPolicy()
);

CompletableFuture.supplyAsync(this::fetchData, executor)
                 .thenApply(this::processData)
                 .thenAccept(this::saveData);


ExecutorService executor = Executors.newFixedThreadPool(2);

CompletableFuture<Void> future =
    CompletableFuture
        .supplyAsync(() -> {
            System.out.println("Fetching - " + Thread.currentThread().getName());
            return "raw-data";
        }, executor)
        .thenApply(data -> {
            System.out.println("Processing - " + Thread.currentThread().getName());
            return data.toUpperCase();
        })
        .thenAccept(result ->
            System.out.println("Saving - " + Thread.currentThread().getName())
        );

System.out.println("Main thread free");

CompletableFuture
    .supplyAsync(this::fetchData, executor)
    .thenApply(this::processData)
    .exceptionally(ex -> {
        log.error("Error occurred", ex);
        return fallbackData;
    })
    .thenAccept(this::saveData);

CompletableFuture
    .supplyAsync(() -> inventoryService.check(), executor)
    .thenApply(result -> pricingService.calculate(result))
    .thenAccept(orderService::save);


<!-- // Sequential execution  -->
ExecutorService executor = Executors.newFixedThreadPool(2);
CompletableFuture
    .runAsync(() -> runS1(), executor)
    .thenRunAsync(() -> runS2(), executor)
    .thenRunAsync(() -> runS1(), executor)
    .thenRunAsync(() -> runS2(), executor);

    <!-- Infinite execution -->
ExecutorService executor = Executors.newSingleThreadExecutor();
Runnable task = () -> {
    while (!Thread.currentThread().isInterrupted()) {
        runS1();
        runS2();
    }
};
executor.submit(task);

runAsync(): Use for tasks that don’t return a result (e.g., logging, sending notifications).

supplyAsync(): Use for asynchronous tasks that compute or fetch a result (e.g., calculating grades, fetching student data).

thenApply(): Use to transform the result of an asynchronous task (e.g., after getting student data, assign them to courses).

thenAccept(): Use to consume the result without returning anything (e.g., logging results, updating audit logs).

thenCompose(): Use to chain dependent asynchronous tasks (e.g., register student and then enroll them in a course).

CompletableFuture.allOf(): Use for parallel execution of independent tasks (e.g., processing multiple student registration tasks in parallel).

=================================================
# Reentrant Locks in Java

Reentrant: A thread can acquire the lock multiple times if it already holds it. Every time the thread enters the lock, the lock’s internal count is incremented, and the thread needs to release it the same number of times before it becomes available for others.

  // Creating a ReentrantLock
    private final ReentrantLock lock = new ReentrantLock();

    public void methodA() {
        lock.lock();  // Acquiring the lock
        try {
            System.out.println("Method A is executing");
            methodB();  // Calling another method which also acquires the lock
        } finally {
            lock.unlock();  // Releasing the lock
        }
    }

    public void methodB() {
        lock.lock();  // Acquiring the lock again (reentrant)
        try {
            System.out.println("Method B is executing");
        } finally {
            lock.unlock();  // Releasing the lock
        }
    }


