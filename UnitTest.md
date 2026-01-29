@ExtendWith(MockitoExtension.class) // enables Mockito
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    void shouldReturnStudentWhenStudentExists() {
        // ARRANGE (mock data)
        Student student = new Student("1", "John");

        Mockito.when(studentRepository.findById("1"))
               .thenReturn(Optional.of(student));

        // ACT (call real method)
        Student result = studentService.getStudent("1");

        // ASSERT (verify result)
        assertEquals("John", result.getName());
    }
}

4️⃣ HOW @Mock and @InjectMocks WORK (CRITICAL)

This is the part most people don’t really understand.

Step-by-Step Runtime Flow
Step 1: Mockito Creates a Fake Object
@Mock
private StudentRepository studentRepository;


Mockito creates:

FakeStudentRepository
(no DB, no logic)


This fake object:

Records method calls

Returns whatever you configure

Step 2: Mockito Injects Mock into Service
@InjectMocks
private StudentService studentService;


Mockito does:

studentService = new StudentService(studentRepository);


So now:

StudentService
  |
  ---> Fake StudentRepository

  Step 3: You Define Mock Behavior
Mockito.when(studentRepository.findById("1"))
       .thenReturn(Optional.of(student));


This means:

When findById("1") is called
Return this specific object

No DB. No SQL. No Spring.

Step 4: Call Real Method
Student result = studentService.getStudent("1");


Execution flow:

studentService.getStudent("1")
   ↓
studentRepository.findById("1")  ← MOCK INTERCEPTS
   ↓
returns Optional.of(student)
   ↓
service logic continues


✔ Only service logic is tested
✔ Dependency is fully controlled

@Test
void shouldThrowExceptionWhenStudentNotFound() {
    // ARRANGE
    Mockito.when(studentRepository.findById("2"))
           .thenReturn(Optional.empty());

    // ACT + ASSERT
    RuntimeException ex = assertThrows(
            RuntimeException.class,
            () -> studentService.getStudent("2")
    );

    assertEquals("Student not found", ex.getMessage());
}

@Test
void shouldCallRepositoryOnce() {
    Student student = new Student("1", "John");

    Mockito.when(studentRepository.findById("1"))
           .thenReturn(Optional.of(student));

    studentService.getStudent("1");

    Mockito.verify(studentRepository, times(1))
           .findById("1");
}
