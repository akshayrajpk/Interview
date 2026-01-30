import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    // getters & setters
}

--------------------------

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Pagination comes for free
}

import org.springframework.data.domain.Page;
public interface UserService {
    Page<User> getUsers(int page, int size);
}

---------------------------

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Override
    public Page<User> getUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size));
    }
}

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping
    public Page<User> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getUsers(page, size);
    }
}


GET /api/users?page=0&size=5

{
  "content": [
    {
      "id": 1,
      "name": "John",
      "email": "john@test.com"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 5
  },
  "totalElements": 23,
  "totalPages": 5,
  "last": false,
  "first": true
}

====== Sorted Pagination =======
@GetMapping("/sorted")
public Page<User> getUsersSorted(
        @RequestParam int page,
        @RequestParam int size,
        @RequestParam String sortBy
) {
    return userService.getUsersSorted(page, size, sortBy);
}

public Page<User> getUsersSorted(int page, int size, String sortBy) {
    return userRepository.findAll(
        PageRequest.of(page, size, Sort.by(sortBy))
    );
}

public class PageResponse<T> {
    private List<T> data;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}


======================= Filter Included ======================
GET /api/users?page=0&size=10&status=ACTIVE&country=INDIA&role=ADMIN

@GetMapping("/api/users")
public Page<User> getUsers(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
) {
    return userService.getUsers(status, country, role, page, size);
}




