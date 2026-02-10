1️⃣ ENTITY: User (AGGREGATE ROOT)
```java

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
    }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String email;

    /* ---------- ONE TO ONE ---------- */
    @OneToOne(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private Address address;

    /* ---------- ONE TO MANY ---------- */
    @OneToMany(
        mappedBy = "user",
        cascade = {CascadeType.PERSIST, CascadeType.MERGE},
        orphanRemoval = true
    )
    private List<Order> orders = new ArrayList<>();

    /* ---------- CONVENIENCE METHODS ---------- */
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }

    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);
    }

    // getters & setters
}

2️⃣ ENTITY: Address (OWNING SIDE)

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String street;

    @Column(nullable = false, length = 60)
    private String city;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true,
        foreignKey = @ForeignKey(name = "fk_address_user")
    )
    private User user;

    // getters & setters
}

3️⃣ ENTITY: Order (MANY-TO-ONE)
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String product;

    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_user")
    )
    private User user;

    // getters & setters
}


@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @OneToMany(
        mappedBy = "user",
        cascade = {CascadeType.PERSIST, CascadeType.MERGE},
        orphanRemoval = true
    )
    private Set<UserRole> userRoles = new HashSet<>();

    /* -------- Convenience methods -------- */

    public void addRole(Role role, String assignedBy) {
        UserRole userRole = new UserRole(this, role, assignedBy);
        userRoles.add(userRole);
        role.getUserRoles().add(userRole);
    }

    public void removeRole(Role role) {
        userRoles.removeIf(ur -> ur.getRole().equals(role));
        role.getUserRoles().removeIf(ur -> ur.getUser().equals(this));
    }

    // getters & setters
}


@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @OneToMany(mappedBy = "role")
    private Set<UserRole> userRoles = new HashSet<>();

    // getters & setters
}

3️⃣ JOIN ENTITY (🔥 THIS IS THE KEY PART)
@Entity
@Table(
    name = "user_roles",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_user_role",
            columnNames = {"user_id", "role_id"}
        )
    }
)
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* -------- MANY TO ONE -------- */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_user_role_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "role_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_user_role_role")
    )
    private Role role;

    /* -------- METADATA -------- */
    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @Column(nullable = false, length = 100)
    private String assignedBy;

    protected UserRole() {}

    public UserRole(User user, Role role, String assignedBy) {
        this.user = user;
        this.role = role;
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
    }

    // getters & setters
}

```
