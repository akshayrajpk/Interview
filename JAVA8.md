@Autowired
private UserRepository userRepository;

@Autowired
private Executor excelExecutor;

public void storeAsync(List<User> users) {

    List<List<User>> batches = partition(users, 500);

    List<CompletableFuture<Void>> futures =
        batches.stream()
               .map(batch ->
                   CompletableFuture.runAsync(
                       () -> userRepository.saveAll(batch),
                       excelExecutor
                   )
               )
               .toList();

    CompletableFuture.allOf(
        futures.toArray(new CompletableFuture[0])
    ).join(); // wait for all to complete
}

public List<User> parseExcel(InputStream inputStream) {
    List<User> users = new ArrayList<>();

    Workbook workbook = WorkbookFactory.create(inputStream);
    Sheet sheet = workbook.getSheetAt(0);

    for (Row row : sheet) {
        if (row.getRowNum() == 0) continue; // header

        User user = new User(
            row.getCell(0).getStringCellValue(),
            row.getCell(1).getStringCellValue()
        );
        users.add(user);
    }
    return users;
}

@Bean
public Executor excelExecutor() {
    return Executors.newFixedThreadPool(10);
}

@Service
public class ExcelImportService {

    public void importExcel(InputStream inputStream) {

        List<User> users = parseExcel(inputStream);

        storeAsync(users);
    }
}

CompletableFuture<Void> future =
    CompletableFuture.runAsync(() -> save(batch), executor)
        .exceptionally(ex -> {
            log.error("Batch failed", ex);
            return null;
        });
