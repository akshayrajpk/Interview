# Factory Pattern

@Service
public class FileProcessingService {

    private final Map<String, FileProcessor> processorMap;

    public FileProcessingService(List<FileProcessor> processors) {
        this.processorMap = processors.stream()
                .collect(Collectors.toMap(
                        p -> p.getSupportedType().toLowerCase(),
                        Function.identity()
                ));
    }

    public void process(MultipartFile file) {

        String fileType = getFileExtension(file.getOriginalFilename());

        FileProcessor processor = processorMap.get(fileType);

        if (processor == null) {
            throw new UnsupportedOperationException(
                    "Unsupported file type: " + fileType
            );
        }

        processor.process(file);
    }

    private String getFileExtension(String fileName) {
        return Optional.ofNullable(fileName)
                .filter(name -> name.contains("."))
                .map(name -> name.substring(name.lastIndexOf(".") + 1))
                .orElseThrow(() -> new IllegalArgumentException("Invalid file name"));
    }
}
