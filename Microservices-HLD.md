# PowerSchool State Reporting - Alberta (PASI Integration)
## Modernized Microservices High-Level Design

---

## 1. Overview

### 1.1 Executive Summary

This document presents the modernized **microservices architecture** for the PowerSchool Alberta State Reporting system. The system synchronizes student information between local PowerSchool SIS instances and **PASI (Provincial Approach to Student Information)** - Alberta Education's provincial student data repository.

The architecture has been redesigned from a monolithic plugin-based system to a **cloud-native, event-driven microservices platform** built on modern technologies including Java 17, Spring Boot 3.x, React, Kubernetes, and AWS managed services.

### 1.2 Core Capabilities

| Capability | Description |
|------------|-------------|
| **Bi-directional Sync** | Real-time synchronization between PowerSchool and PASI |
| **Event-Driven Processing** | Apache Kafka-based event streaming for data changes |
| **High Availability** | Multi-AZ deployment with auto-scaling |
| **Compliance Reporting** | Provincial education compliance and audit trails |
| **Self-Healing** | Automated reconciliation and conflict resolution |

### 1.3 Target Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Redux Toolkit, TanStack Query |
| **API Gateway** | AWS API Gateway + Spring Cloud Gateway |
| **Backend Services** | Java 17, Spring Boot 3.x, Spring Cloud 2023.x |
| **Security** | Spring Security 6, OAuth 2.0/OIDC, JWT |
| **Database** | MySQL 8.0 (AWS RDS), Read Replicas |
| **Caching** | Redis Cluster (AWS ElastiCache) |
| **Messaging** | Apache Kafka (AWS MSK) |
| **Service Discovery** | AWS Cloud Map + Spring Cloud |
| **Configuration** | Spring Cloud Config + AWS Secrets Manager |
| **Containerization** | Docker, Kubernetes (AWS EKS) |
| **Observability** | ELK Stack, Prometheus, Grafana, AWS X-Ray |
| **CI/CD** | GitHub Actions, ArgoCD, Helm |

---

## 2. Modernized Microservices Architecture

### 2.1 Bounded Contexts & Service Decomposition

Based on Domain-Driven Design (DDD) principles, the system is decomposed into the following bounded contexts:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BOUNDED CONTEXTS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │  STUDENT CORE    │  │  ENROLLMENT      │  │  ACADEMIC        │               │
│  │  CONTEXT         │  │  CONTEXT         │  │  CONTEXT         │               │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤               │
│  │ • Student Demo-  │  │ • School Enroll- │  │ • Course Marks   │               │
│  │   graphics       │  │   ment           │  │   (SCM)          │               │
│  │ • ASN Management │  │ • Course Enroll- │  │ • Diploma Exams  │               │
│  │ • Parent/Guardian│  │   ment           │  │ • Transcripts    │               │
│  │ • Citizenship    │  │ • Sections       │  │ • Credentials    │               │
│  │ • Medical Alerts │  │ • Withdrawals    │  │ • Grade Books    │               │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │  DOCUMENT        │  │  SYNCHRONIZATION │  │  NOTIFICATION    │               │
│  │  CONTEXT         │  │  CONTEXT         │  │  CONTEXT         │               │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤               │
│  │ • Student Records│  │ • PASI Sync      │  │ • Alerts         │               │
│  │ • Identity Docs  │  │ • Reconciliation │  │ • Email/SMS      │               │
│  │ • External Store │  │ • Conflict Mgmt  │  │ • Webhooks       │               │
│  │   (K12 Drive/S3) │  │ • Hash Tracking  │  │ • Audit Logs     │               │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Microservices Inventory

| Service | Responsibility | Database | Communication |
|---------|---------------|----------|---------------|
| **student-service** | Student demographics, ASN, names, citizenship | MySQL (student_db) | REST, Kafka |
| **guardian-service** | Parent/guardian management, contacts | MySQL (guardian_db) | REST, Kafka |
| **enrollment-service** | School & course enrollments, sections | MySQL (enrollment_db) | REST, Kafka |
| **academic-service** | Course marks, grades, evaluations | MySQL (academic_db) | REST, Kafka |
| **diploma-exam-service** | Exam registration, sittings, results | MySQL (exam_db) | REST, Kafka |
| **document-service** | Student documents, external storage | MySQL (document_db) + S3 | REST, Kafka |
| **pasi-gateway-service** | PASI SOAP integration, protocol translation | Redis (cache) | REST, SOAP, Kafka |
| **sync-orchestrator-service** | Sync coordination, reconciliation | MySQL (sync_db) | Kafka |
| **notification-service** | Alerts, notifications, webhooks | MySQL (notification_db) | Kafka, WebSocket |
| **validation-service** | Request validation, business rules | Redis (rules cache) | REST |
| **config-service** | Centralized configuration | Git repo + MySQL | REST |
| **auth-service** | Authentication, authorization, JWT | MySQL (auth_db) + Redis | REST |

---

## 3. Component / Service Descriptions

### 3.1 Student Service

**Responsibility:** Manages all student-related data including demographics, Alberta Student Numbers (ASN), names, citizenship, and medical alerts.

```
student-service/
├── src/main/java/com/powerschool/student/
│   ├── controller/
│   │   ├── StudentController.java
│   │   ├── StudentNameController.java
│   │   └── CitizenshipController.java
│   ├── service/
│   │   ├── StudentService.java
│   │   ├── AsnService.java
│   │   └── StudentSearchService.java
│   ├── repository/
│   │   ├── StudentRepository.java
│   │   └── StudentNameRepository.java
│   ├── domain/
│   │   ├── Student.java
│   │   ├── StudentName.java
│   │   └── Citizenship.java
│   ├── event/
│   │   ├── StudentCreatedEvent.java
│   │   ├── StudentUpdatedEvent.java
│   │   └── StudentEventPublisher.java
│   └── integration/
│       └── PasiStudentClient.java
└── src/main/resources/
    └── application.yml
```

**Core Features:**
- Student CRUD operations with optimistic locking
- ASN lookup, assignment, and verification
- Multi-name support (legal, preferred, previous)
- Citizenship tracking with effective dates
- Medical alert management with privacy controls

**Data Owned (student_db):**
```sql
-- Core student table
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    asn VARCHAR(9) UNIQUE,
    legal_first_name VARCHAR(100) NOT NULL,
    legal_last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    email VARCHAR(255),
    pasi_sync_status ENUM('PENDING', 'SYNCED', 'CONFLICT', 'ERROR'),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asn (asn),
    INDEX idx_name (legal_last_name, legal_first_name)
);

-- Student names (1:N)
CREATE TABLE student_names (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    name_type ENUM('LEGAL', 'PREFERRED', 'PREVIOUS') NOT NULL,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    effective_date DATE,
    source VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Citizenship records
CREATE TABLE student_citizenship (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    citizenship_status VARCHAR(50),
    country_code VARCHAR(3),
    effective_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

**Redis Usage:**
- Student profile caching (TTL: 15 minutes)
- ASN lookup cache (TTL: 1 hour)
- Rate limiting for ASN assignment requests

**Sample API Endpoints:**
```
GET    /api/v1/students/{id}
GET    /api/v1/students?asn={asn}
POST   /api/v1/students
PUT    /api/v1/students/{id}
GET    /api/v1/students/{id}/names
POST   /api/v1/students/{id}/names
GET    /api/v1/students/search?lastName={name}&dob={date}
POST   /api/v1/students/{id}/asn/request
```

---

### 3.2 Guardian Service

**Responsibility:** Manages parent/guardian relationships, contact information, and communication preferences.

**Core Features:**
- Guardian CRUD with relationship types
- Address management with normalization
- Phone and email management
- Privacy disclosure restrictions
- Fuzzy matching using Soundex and Levenshtein distance

**Data Owned (guardian_db):**
```sql
CREATE TABLE guardians (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    soundex_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guardian_students (
    guardian_id BIGINT,
    student_id BIGINT,
    relationship VARCHAR(50),
    has_custody BOOLEAN,
    emergency_contact BOOLEAN,
    PRIMARY KEY (guardian_id, student_id)
);

CREATE TABLE guardian_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guardian_id BIGINT,
    address_type VARCHAR(20),
    street_line1 VARCHAR(255),
    street_line2 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(50),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'CA',
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);
```

**Redis Usage:**
- Guardian lookup cache by student
- Address normalization cache
- Phone number formatting cache

---

### 3.3 Enrollment Service

**Responsibility:** Manages school enrollments, course enrollments, sections, and withdrawal processing.

**Core Features:**
- School enrollment lifecycle (entry, active, withdrawn)
- Concurrent enrollment support
- Section management and scheduling
- Course enrollment with prerequisites
- Responsible school tracking

**Data Owned (enrollment_db):**
```sql
CREATE TABLE school_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    school_code VARCHAR(10) NOT NULL,
    school_year VARCHAR(9) NOT NULL,
    entry_date DATE NOT NULL,
    exit_date DATE,
    exit_type VARCHAR(50),
    status ENUM('ACTIVE', 'WITHDRAWN', 'CONCURRENT') DEFAULT 'ACTIVE',
    registration_type VARCHAR(50),
    is_responsible_school BOOLEAN DEFAULT FALSE,
    pasi_ref_id VARCHAR(50),
    INDEX idx_student_school (student_id, school_code, school_year)
);

CREATE TABLE sections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    section_code VARCHAR(20) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    school_code VARCHAR(10) NOT NULL,
    school_year VARCHAR(9) NOT NULL,
    term_id BIGINT,
    teacher_id BIGINT,
    max_enrollment INT,
    pasi_ref_id VARCHAR(50),
    UNIQUE KEY uk_section (section_code, school_code, school_year)
);

CREATE TABLE course_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    enrollment_date DATE,
    drop_date DATE,
    status ENUM('ENROLLED', 'DROPPED', 'COMPLETED'),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);
```

**Redis Usage:**
- Section capacity tracking (real-time seat counts)
- Enrollment status cache
- School calendar caching

---

### 3.4 Academic Service

**Responsibility:** Manages course marks, grade calculations, evaluated marks, and official marks submission.

**Core Features:**
- Evaluated mark submission workflow
- Official mark management
- Grade calculation with weighting
- Mark approval workflows
- Historical grade tracking

**Data Owned (academic_db):**
```sql
CREATE TABLE course_marks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_enrollment_id BIGINT NOT NULL,
    mark_type ENUM('EVALUATED', 'OFFICIAL', 'DIPLOMA_EXAM') NOT NULL,
    mark_value DECIMAL(5,2),
    letter_grade VARCHAR(5),
    credits_earned DECIMAL(3,1),
    completion_date DATE,
    submitted_to_pasi BOOLEAN DEFAULT FALSE,
    pasi_submission_date TIMESTAMP,
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED'),
    INDEX idx_student_marks (student_id, mark_type)
);

CREATE TABLE mark_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_mark_id BIGINT,
    submission_status ENUM('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED'),
    pasi_response_code VARCHAR(20),
    pasi_response_message TEXT,
    submitted_at TIMESTAMP,
    FOREIGN KEY (course_mark_id) REFERENCES course_marks(id)
);
```

**Redis Usage:**
- Grade calculation cache
- Mark submission queue management
- Approval workflow state

---

### 3.5 Diploma Exam Service

**Responsibility:** Manages diploma exam registration, exam sittings, and result processing.

**Core Features:**
- Exam sitting creation and management
- Student exam registration
- Exam result download from PASI
- Accommodation requests
- Mass registration processing

**Data Owned (exam_db):**
```sql
CREATE TABLE diploma_exam_sittings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_code VARCHAR(20) NOT NULL,
    school_code VARCHAR(10) NOT NULL,
    sitting_date DATE NOT NULL,
    sitting_time TIME,
    location VARCHAR(255),
    max_capacity INT,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    pasi_ref_id VARCHAR(50)
);

CREATE TABLE student_exam_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    sitting_id BIGINT NOT NULL,
    registration_status ENUM('REGISTERED', 'WITHDRAWN', 'NO_SHOW', 'COMPLETED'),
    accommodation_code VARCHAR(20),
    exam_mark DECIMAL(5,2),
    blended_mark DECIMAL(5,2),
    FOREIGN KEY (sitting_id) REFERENCES diploma_exam_sittings(id)
);
```

**Redis Usage:**
- Exam sitting capacity tracking
- Registration deadline caching
- Result notification queue

---

### 3.6 Document Service

**Responsibility:** Manages student documents, identity verification documents, and integration with external storage (S3/K12 Drive).

**Core Features:**
- Document upload and retrieval
- Multi-format support (PDF, images)
- External storage integration (AWS S3)
- Document type classification
- Secure document access with signed URLs

**Data Owned (document_db):**
```sql
CREATE TABLE student_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(500),
    storage_provider ENUM('S3', 'K12_DRIVE') DEFAULT 'S3',
    checksum VARCHAR(64),
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_docs (student_id, document_type)
);
```

**External Integrations:**
- AWS S3 for document storage
- K12 Drive API for legacy document access
- Virus scanning service

**Redis Usage:**
- Pre-signed URL caching
- Document metadata cache
- Upload progress tracking

---

### 3.7 PASI Gateway Service

**Responsibility:** Acts as the protocol translator between the microservices ecosystem and Alberta Education's PASI SOAP web services.

**Core Features:**
- SOAP to REST translation
- Request/response mapping
- SSL certificate management
- Rate limiting and throttling
- Circuit breaker pattern
- Response caching

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     PASI GATEWAY SERVICE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ REST API    │────▶│ Transformer │────▶│ SOAP Client │       │
│  │ Controller  │     │   Layer     │     │   (CXF)     │       │
│  └─────────────┘     └─────────────┘     └──────┬──────┘       │
│                                                  │               │
│  ┌─────────────┐     ┌─────────────┐            │               │
│  │ Circuit     │     │ Rate        │            │               │
│  │ Breaker     │     │ Limiter     │            │               │
│  │ (Resilience4j)    │ (Redis)     │            ▼               │
│  └─────────────┘     └─────────────┘     ┌─────────────┐       │
│                                           │ PASI SOAP   │       │
│                                           │ Services    │       │
│                                           └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Operations Exposed:**
```
POST /api/v1/pasi/student/identify
POST /api/v1/pasi/student/submit
POST /api/v1/pasi/enrollment/submit
POST /api/v1/pasi/enrollment/withdraw
POST /api/v1/pasi/section/submit
POST /api/v1/pasi/mark/submit-evaluated
POST /api/v1/pasi/mark/submit-official
GET  /api/v1/pasi/transcript/{asn}
GET  /api/v1/pasi/credentials/{asn}
POST /api/v1/pasi/exam/register
GET  /api/v1/pasi/code-values/{category}
```

**Redis Usage:**
- PASI response caching (code values, credentials)
- Rate limiting counters
- Circuit breaker state

---

### 3.8 Sync Orchestrator Service

**Responsibility:** Coordinates synchronization workflows, manages reconciliation processes, and handles conflict resolution.

**Core Features:**
- Event-driven sync coordination
- Hash-based reconciliation (MD5)
- Conflict detection and resolution
- Sync queue management
- Retry with exponential backoff
- Bulk sync operations

**Data Owned (sync_db):**
```sql
CREATE TABLE sync_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    local_hash VARCHAR(32),
    pasi_hash VARCHAR(32),
    sync_status ENUM('PENDING', 'IN_PROGRESS', 'SYNCED', 'CONFLICT', 'ERROR'),
    last_sync_attempt TIMESTAMP,
    retry_count INT DEFAULT 0,
    error_message TEXT,
    UNIQUE KEY uk_entity (entity_type, entity_id)
);

CREATE TABLE sync_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    payload JSON,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    INDEX idx_status (status, created_at)
);

CREATE TABLE conflict_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    local_value JSON,
    pasi_value JSON,
    conflict_type VARCHAR(50),
    resolution_status ENUM('UNRESOLVED', 'AUTO_RESOLVED', 'MANUAL_RESOLVED'),
    resolved_by BIGINT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Redis Usage:**
- Sync queue management
- Distributed locks for concurrent sync
- Hash comparison cache

---

### 3.9 Notification Service

**Responsibility:** Manages alerts, notifications, and audit logging across the system.

**Core Features:**
- Core alerts dashboard (conflicts, errors, rejections)
- Multi-channel notifications (email, SMS, webhook)
- Real-time WebSocket notifications
- Audit trail management
- Certificate expiry warnings

**Data Owned (notification_db):**
```sql
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('FAILURE', 'WARNING', 'ADVICE', 'INVALID_REQUEST', 'CONNECTIVITY'),
    alert_code VARCHAR(20),
    entity_type VARCHAR(50),
    entity_id BIGINT,
    school_code VARCHAR(10),
    title VARCHAR(255),
    description TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alerts (alert_type, acknowledged, created_at)
);

CREATE TABLE notification_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel ENUM('EMAIL', 'SMS', 'WEBHOOK', 'WEBSOCKET'),
    recipient VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    status ENUM('PENDING', 'SENT', 'FAILED'),
    retry_count INT DEFAULT 0,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP
);
```

**Redis Usage:**
- WebSocket session management
- Notification rate limiting
- Alert badge count caching

---

### 3.10 Validation Service

**Responsibility:** Centralized request validation using configurable business rules.

**Core Features:**
- Field-level validation
- Cross-field business rules
- ASN format validation
- Code value validation
- Configurable validation rules

**Redis Usage:**
- Validation rule caching
- Code value lookups
- Validation result caching

---

### 3.11 Auth Service

**Responsibility:** Handles authentication, authorization, and JWT token management.

**Core Features:**
- OAuth 2.0 / OIDC integration
- JWT token generation and validation
- Role-based access control (RBAC)
- Session management
- API key management for service-to-service auth

**Data Owned (auth_db):**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED'),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT,
    role_name VARCHAR(50),
    school_code VARCHAR(10),
    PRIMARY KEY (user_id, role_name, school_code)
);

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    token_hash VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Redis Usage:**
- JWT blacklist (revoked tokens)
- Session storage
- Rate limiting per user

---

## 4. Data & Storage Design

### 4.1 Database Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE PER SERVICE PATTERN                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ student_db   │  │ guardian_db  │  │enrollment_db │  │ academic_db  │        │
│  │              │  │              │  │              │  │              │        │
│  │ RDS MySQL    │  │ RDS MySQL    │  │ RDS MySQL    │  │ RDS MySQL    │        │
│  │ Primary +    │  │ Primary +    │  │ Primary +    │  │ Primary +    │        │
│  │ Read Replica │  │ Read Replica │  │ Read Replica │  │ Read Replica │        │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   exam_db    │  │ document_db  │  │   sync_db    │  │notification_db│       │
│  │              │  │              │  │              │  │              │        │
│  │ RDS MySQL    │  │ RDS MySQL    │  │ RDS MySQL    │  │ RDS MySQL    │        │
│  │ Primary +    │  │ Primary +    │  │ Primary +    │  │ Primary +    │        │
│  │ Read Replica │  │ Read Replica │  │ Read Replica │  │ Read Replica │        │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Redis Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         REDIS CLUSTER (AWS ElastiCache)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        REDIS CLUSTER (6 nodes)                           │    │
│  │                                                                          │    │
│  │  Node 1 (Primary)     Node 2 (Primary)     Node 3 (Primary)             │    │
│  │  ├─ Replica 1a        ├─ Replica 2a        ├─ Replica 3a                │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  USAGE BY SERVICE:                                                               │
│  ┌────────────────────┬───────────────────────────────────────────────────┐     │
│  │ Service            │ Redis Usage                                        │     │
│  ├────────────────────┼───────────────────────────────────────────────────┤     │
│  │ student-service    │ Profile cache, ASN lookup, rate limiting          │     │
│  │ auth-service       │ JWT blacklist, sessions, rate limiting            │     │
│  │ pasi-gateway       │ Response cache, circuit breaker state             │     │
│  │ sync-orchestrator  │ Distributed locks, sync queue, hash cache         │     │
│  │ notification       │ WebSocket sessions, alert badges                  │     │
│  │ enrollment-service │ Seat counts, enrollment status cache              │     │
│  │ validation-service │ Rule cache, code values                           │     │
│  └────────────────────┴───────────────────────────────────────────────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Data Consistency Patterns

| Pattern | Usage |
|---------|-------|
| **Saga Pattern** | Multi-service transactions (e.g., student enrollment) |
| **Outbox Pattern** | Reliable event publishing with Kafka |
| **CQRS** | Separate read/write models for reporting |
| **Event Sourcing** | Audit trail for compliance-critical data |

---

## 5. Communication Patterns

### 5.1 Synchronous Communication (REST)

Used for:
- User-facing API requests
- Real-time queries requiring immediate response
- Simple service-to-service calls

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    React     │────▶│ API Gateway  │────▶│  Services    │
│   Frontend   │     │  (Spring     │     │  (REST APIs) │
│              │◀────│   Cloud)     │◀────│              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 5.2 Asynchronous Communication (Kafka)

Used for:
- Event-driven data synchronization
- Cross-service notifications
- Audit logging
- Background processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         KAFKA TOPICS (AWS MSK)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  DOMAIN EVENTS:                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │ student.events          │ Student created/updated/deleted events      │     │
│  │ guardian.events         │ Guardian relationship changes               │     │
│  │ enrollment.events       │ School/course enrollment changes            │     │
│  │ academic.events         │ Grade submissions, mark updates             │     │
│  │ exam.events             │ Registration, result events                 │     │
│  │ document.events         │ Document upload/delete events               │     │
│  └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  SYNC EVENTS:                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │ pasi.sync.requests      │ Outbound sync requests to PASI              │     │
│  │ pasi.sync.responses     │ PASI response handling                      │     │
│  │ pasi.reconciliation     │ Hash mismatch events                        │     │
│  │ pasi.conflicts          │ Conflict detection events                   │     │
│  └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  SYSTEM EVENTS:                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │ notifications.alerts    │ Core alerts for dashboard                   │     │
│  │ audit.logs              │ Audit trail events                          │     │
│  │ dlq.events              │ Dead letter queue for failed events         │     │
│  └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Event Schema Example

```java
// StudentUpdatedEvent.java
@Data
@Builder
public class StudentUpdatedEvent {
    private String eventId;
    private String eventType = "STUDENT_UPDATED";
    private Instant timestamp;
    private String correlationId;
    
    private Long studentId;
    private String asn;
    private Map<String, Object> changedFields;
    private String updatedBy;
    private String schoolCode;
    
    // For PASI sync
    private boolean requiresPasiSync;
    private String pasiSyncPriority; // HIGH, MEDIUM, LOW
}
```

---

## 6. Security & Authentication

### 6.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      API GATEWAY LAYER                                   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │ Rate        │  │ JWT         │  │ CORS        │  │ WAF         │    │    │
│  │  │ Limiting    │  │ Validation  │  │ Policy      │  │ Rules       │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                       │                                          │
│                                       ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      SERVICE LAYER                                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │    │
│  │  │ Spring      │  │ Method      │  │ Data        │                      │    │
│  │  │ Security    │  │ Security    │  │ Filtering   │                      │    │
│  │  │ Filters     │  │ (@PreAuth)  │  │ (School)    │                      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                      │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "iss": "https://auth.powerschool.com",
    "aud": "pasi-services",
    "exp": 1699999999,
    "iat": 1699996399,
    "roles": ["TEACHER", "PASI_ADMIN"],
    "schools": ["AB1234", "AB5678"],
    "permissions": [
      "student:read",
      "student:write",
      "enrollment:read",
      "marks:submit"
    ]
  }
}
```

### 6.3 Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers("/api/v1/students/**").hasRole("STUDENT_ACCESS")
                .requestMatchers("/api/v1/marks/submit/**").hasRole("MARK_SUBMIT")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

### 6.4 Method-Level Security

```java
@Service
public class StudentService {
    
    @PreAuthorize("hasPermission(#studentId, 'Student', 'READ')")
    public StudentDTO getStudent(Long studentId) {
        // Implementation
    }
    
    @PreAuthorize("hasRole('PASI_ADMIN') and hasSchoolAccess(#schoolCode)")
    public void submitToPasi(String schoolCode, Long studentId) {
        // Implementation
    }
}
```

### 6.5 PASI Certificate Management

```java
@Configuration
public class PasiSslConfig {
    
    @Value("${pasi.ssl.keystore-path}")
    private String keystorePath;
    
    @Value("${pasi.ssl.keystore-password}")
    private String keystorePassword;
    
    @Bean
    public SSLContext pasiSslContext() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new FileInputStream(keystorePath), 
                     keystorePassword.toCharArray());
        
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(
            KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keyStore, keystorePassword.toCharArray());
        
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(kmf.getKeyManagers(), null, null);
        return sslContext;
    }
}
```

---

## 7. Deployment & DevOps (Docker, Kubernetes, AWS)

### 7.1 Container Architecture

```dockerfile
# Dockerfile for Spring Boot microservice
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy application
COPY --chown=spring:spring target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", \
            "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```

### 7.2 Kubernetes Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AWS EKS CLUSTER                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      INGRESS (AWS ALB)                                   │    │
│  │  • SSL Termination  • WAF Integration  • Path-based Routing             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                       │                                          │
│  ┌────────────────────────────────────┼────────────────────────────────────┐    │
│  │                                    ▼                                     │    │
│  │              ┌───────────────────────────────────────┐                  │    │
│  │              │     API GATEWAY SERVICE               │                  │    │
│  │              │     (Spring Cloud Gateway)            │                  │    │
│  │              │     Replicas: 3                       │                  │    │
│  │              └───────────────────────────────────────┘                  │    │
│  │                                    │                                     │    │
│  │              ┌─────────────────────┼─────────────────────┐              │    │
│  │              │                     │                     │              │    │
│  │              ▼                     ▼                     ▼              │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │    │
│  │  │ student-service │  │enrollment-svc   │  │ academic-svc    │        │    │
│  │  │ Replicas: 3     │  │ Replicas: 3     │  │ Replicas: 3     │        │    │
│  │  │ CPU: 500m-1000m │  │ CPU: 500m-1000m │  │ CPU: 500m-1000m │        │    │
│  │  │ Mem: 512Mi-1Gi  │  │ Mem: 512Mi-1Gi  │  │ Mem: 512Mi-1Gi  │        │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │    │
│  │                                                                         │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │    │
│  │  │ pasi-gateway    │  │ sync-orchestr   │  │ notification    │        │    │
│  │  │ Replicas: 2     │  │ Replicas: 2     │  │ Replicas: 2     │        │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │    │
│  │                                                                         │    │
│  │                      NAMESPACE: pasi-production                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Kubernetes Deployment Manifest

```yaml
# student-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: student-service
  namespace: pasi-production
  labels:
    app: student-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: student-service
  template:
    metadata:
      labels:
        app: student-service
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: student-service-sa
      containers:
        - name: student-service
          image: 123456789.dkr.ecr.ca-central-1.amazonaws.com/student-service:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "production"
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: student-db-credentials
                  key: host
            - name: REDIS_HOST
              valueFrom:
                configMapKeyRef:
                  name: redis-config
                  key: host
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
      volumes:
        - name: config-volume
          configMap:
            name: student-service-config
---
apiVersion: v1
kind: Service
metadata:
  name: student-service
  namespace: pasi-production
spec:
  selector:
    app: student-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: student-service-hpa
  namespace: pasi-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: student-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 7.4 AWS Services Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AWS INFRASTRUCTURE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         NETWORKING                                       │    │
│  │  VPC (10.0.0.0/16) │ Multi-AZ │ Private Subnets │ NAT Gateway           │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ ROUTE 53         │  │ CLOUDFRONT       │  │ WAF              │              │
│  │ DNS Management   │  │ CDN for React    │  │ Web Application  │              │
│  │ Health Checks    │  │ Static Assets    │  │ Firewall         │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ EKS              │  │ ECR              │  │ ALB              │              │
│  │ Kubernetes       │  │ Container        │  │ Application Load │              │
│  │ Cluster          │  │ Registry         │  │ Balancer         │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ RDS MySQL        │  │ ELASTICACHE      │  │ MSK (KAFKA)      │              │
│  │ Multi-AZ         │  │ Redis Cluster    │  │ Managed Kafka    │              │
│  │ Read Replicas    │  │ Cluster Mode     │  │ 3 Brokers        │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ S3               │  │ SECRETS MANAGER  │  │ PARAMETER STORE  │              │
│  │ Document Storage │  │ DB Credentials   │  │ App Config       │              │
│  │ Backup Storage   │  │ API Keys         │  │ Feature Flags    │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ CLOUDWATCH       │  │ X-RAY            │  │ SNS/SQS          │              │
│  │ Logs & Metrics   │  │ Distributed      │  │ Notifications    │              │
│  │ Alarms           │  │ Tracing          │  │ Queuing          │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.5 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: ca-central-1
  ECR_REPOSITORY: pasi-services
  EKS_CLUSTER: pasi-production

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      
      - name: Build with Maven
        run: mvn -B package -DskipTests
      
      - name: Run Tests
        run: mvn test
      
      - name: Build Docker Image
        run: |
          docker build -t $ECR_REPOSITORY:${{ github.sha }} .
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region $AWS_REGION | \
            docker login --username AWS --password-stdin $ECR_URL
          docker push $ECR_URL/$ECR_REPOSITORY:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
          kubectl set image deployment/student-service \
            student-service=$ECR_URL/$ECR_REPOSITORY:${{ github.sha }} \
            -n pasi-production
          kubectl rollout status deployment/student-service -n pasi-production
```

---

## 8. Observability & Logging (ELK Stack)

### 8.1 Observability Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         OBSERVABILITY STACK                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         ELK STACK                                        │    │
│  │                                                                          │    │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │    │
│  │  │ Filebeat    │────▶│ Logstash    │────▶│Elasticsearch│               │    │
│  │  │ (Log Shipper)     │ (Processing)│     │ (Storage)   │               │    │
│  │  └─────────────┘     └─────────────┘     └──────┬──────┘               │    │
│  │                                                  │                       │    │
│  │                                                  ▼                       │    │
│  │                                          ┌─────────────┐                │    │
│  │                                          │   Kibana    │                │    │
│  │                                          │ (Dashboard) │                │    │
│  │                                          └─────────────┘                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                     METRICS & TRACING                                    │    │
│  │                                                                          │    │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │    │
│  │  │ Prometheus  │────▶│  Grafana    │     │  AWS X-Ray  │               │    │
│  │  │ (Metrics)   │     │ (Visualize) │     │ (Tracing)   │               │    │
│  │  └─────────────┘     └─────────────┘     └─────────────┘               │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Structured Logging Configuration

```java
// LoggingConfig.java
@Configuration
public class LoggingConfig {
    
    @Bean
    public LoggingEventCompositeJsonEncoder jsonEncoder() {
        LoggingEventCompositeJsonEncoder encoder = new LoggingEventCompositeJsonEncoder();
        encoder.setProviders(jsonProviders());
        return encoder;
    }
}
```

```yaml
# logback-spring.xml
<configuration>
    <springProperty scope="context" name="appName" source="spring.application.name"/>
    <springProperty scope="context" name="env" source="spring.profiles.active"/>
    
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>
                {"service":"${appName}","environment":"${env}"}
            </customFields>
            <fieldNames>
                <timestamp>@timestamp</timestamp>
                <thread>thread</thread>
                <logger>logger</logger>
                <version>[ignore]</version>
            </fieldNames>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="JSON"/>
    </root>
</configuration>
```

### 8.3 Log Format Example

```json
{
  "@timestamp": "2024-12-09T10:30:45.123Z",
  "service": "student-service",
  "environment": "production",
  "level": "INFO",
  "logger": "com.powerschool.student.service.StudentService",
  "thread": "http-nio-8080-exec-5",
  "message": "Student updated successfully",
  "traceId": "abc123def456",
  "spanId": "789xyz",
  "correlationId": "req-12345",
  "studentId": 1001,
  "asn": "123456789",
  "schoolCode": "AB1234",
  "userId": "user@school.ca",
  "duration_ms": 45
}
```

### 8.4 Logstash Pipeline

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }
  
  if [service] == "pasi-gateway" {
    mutate {
      add_field => { "[@metadata][index]" => "pasi-gateway-%{+YYYY.MM.dd}" }
    }
  }
  
  if [level] == "ERROR" {
    mutate {
      add_tag => ["alert"]
    }
  }
  
  # Parse PASI-specific fields
  if [pasiOperation] {
    mutate {
      add_field => { "pasi.operation" => "%{pasiOperation}" }
      add_field => { "pasi.response_code" => "%{pasiResponseCode}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
  }
  
  # Alert to Slack for errors
  if "alert" in [tags] {
    slack {
      url => "${SLACK_WEBHOOK_URL}"
      format => "Error in %{service}: %{message}"
    }
  }
}
```

### 8.5 Kibana Dashboards

**Core Dashboards:**

| Dashboard | Purpose | Key Metrics |
|-----------|---------|-------------|
| **Service Health** | Overall system health | Request rate, error rate, latency |
| **PASI Integration** | PASI sync status | Sync success/failure, response times |
| **Core Alerts** | Alert monitoring | Alert counts by type, unacknowledged |
| **User Activity** | User actions audit | Operations by user, school |
| **Performance** | System performance | CPU, memory, database queries |

### 8.6 Prometheus Metrics

```java
// MetricsConfig.java
@Configuration
public class MetricsConfig {
    
    @Bean
    MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
            .commonTags("service", "student-service")
            .commonTags("environment", "${spring.profiles.active}");
    }
}

// Custom metrics in service
@Service
public class StudentService {
    
    private final Counter studentCreatedCounter;
    private final Timer pasiSyncTimer;
    
    public StudentService(MeterRegistry registry) {
        this.studentCreatedCounter = Counter.builder("students.created")
            .description("Number of students created")
            .register(registry);
        
        this.pasiSyncTimer = Timer.builder("pasi.sync.duration")
            .description("PASI sync operation duration")
            .register(registry);
    }
    
    public Student createStudent(StudentDTO dto) {
        Student student = // ... create student
        studentCreatedCounter.increment();
        return student;
    }
    
    public void syncToPasi(Student student) {
        pasiSyncTimer.record(() -> {
            // PASI sync logic
        });
    }
}
```

### 8.7 Alerting Rules

```yaml
# prometheus-alerts.yml
groups:
  - name: pasi-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"
      
      - alert: PasiSyncFailure
        expr: increase(pasi_sync_failures_total[15m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PASI sync failures increasing"
          
      - alert: ServiceDown
        expr: up{job=~".*-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
```

---

## 9. Key Diagrams (Mermaid)

### 9.1 System Context Diagram

```mermaid
C4Context
    title System Context Diagram - PowerSchool PASI Integration

    Person(schoolAdmin, "School Administrator", "Manages student data and PASI sync")
    Person(teacher, "Teacher", "Enters grades and manages courses")
    
    System(pasiSystem, "PowerSchool PASI Integration", "Microservices platform for Alberta state reporting")
    
    System_Ext(pasi, "PASI", "Alberta Education Provincial Student Information System")
    System_Ext(k12Drive, "K12 Drive", "External document storage")
    System_Ext(infoSnap, "InfoSnap", "Demographic data imports")
    
    Rel(schoolAdmin, pasiSystem, "Uses", "HTTPS")
    Rel(teacher, pasiSystem, "Submits grades", "HTTPS")
    Rel(pasiSystem, pasi, "Syncs student data", "SOAP/HTTPS")
    Rel(pasiSystem, k12Drive, "Stores documents", "REST API")
    Rel(infoSnap, pasiSystem, "Imports data", "REST API")
```

### 9.2 High-Level Microservice Architecture Diagram

```mermaid
flowchart TB
    subgraph "Client Layer"
        ReactApp[React SPA]
        MobileApp[Mobile App]
    end
    
    subgraph "Edge Layer"
        CloudFront[AWS CloudFront CDN]
        WAF[AWS WAF]
        ALB[Application Load Balancer]
    end
    
    subgraph "API Gateway Layer"
        APIGateway[Spring Cloud Gateway]
    end
    
    subgraph "Service Layer"
        AuthService[Auth Service]
        StudentService[Student Service]
        GuardianService[Guardian Service]
        EnrollmentService[Enrollment Service]
        AcademicService[Academic Service]
        DiplomaExamService[Diploma Exam Service]
        DocumentService[Document Service]
        PasiGateway[PASI Gateway Service]
        SyncOrchestrator[Sync Orchestrator]
        NotificationService[Notification Service]
        ValidationService[Validation Service]
    end
    
    subgraph "Data Layer"
        MySQL[(MySQL Cluster)]
        Redis[(Redis Cluster)]
        Kafka[Apache Kafka]
        S3[(AWS S3)]
    end
    
    subgraph "External Systems"
        PASI[PASI SOAP Services]
        K12Drive[K12 Drive]
    end
    
    ReactApp --> CloudFront
    MobileApp --> ALB
    CloudFront --> WAF --> ALB
    ALB --> APIGateway
    
    APIGateway --> AuthService
    APIGateway --> StudentService
    APIGateway --> GuardianService
    APIGateway --> EnrollmentService
    APIGateway --> AcademicService
    APIGateway --> DiplomaExamService
    APIGateway --> DocumentService
    APIGateway --> NotificationService
    
    StudentService --> MySQL
    StudentService --> Redis
    StudentService --> Kafka
    
    GuardianService --> MySQL
    EnrollmentService --> MySQL
    AcademicService --> MySQL
    DiplomaExamService --> MySQL
    DocumentService --> MySQL
    DocumentService --> S3
    
    SyncOrchestrator --> Kafka
    SyncOrchestrator --> PasiGateway
    
    PasiGateway --> PASI
    PasiGateway --> Redis
    
    DocumentService --> K12Drive
    
    NotificationService --> Kafka
```

### 9.3 Deployment Diagram

```mermaid
flowchart TB
    subgraph "AWS Region: ca-central-1"
        subgraph "VPC"
            subgraph "Public Subnets"
                ALB[Application Load Balancer]
                NAT[NAT Gateway]
            end
            
            subgraph "Private Subnets - AZ-A"
                subgraph "EKS Node Group A"
                    Pod1A[student-service]
                    Pod2A[enrollment-service]
                    Pod3A[academic-service]
                end
            end
            
            subgraph "Private Subnets - AZ-B"
                subgraph "EKS Node Group B"
                    Pod1B[student-service]
                    Pod2B[enrollment-service]
                    Pod3B[academic-service]
                end
            end
            
            subgraph "Data Subnets"
                RDS[(RDS MySQL Multi-AZ)]
                ElastiCache[(ElastiCache Redis)]
                MSK[MSK Kafka Cluster]
            end
        end
        
        S3[(S3 Bucket)]
        ECR[(ECR Registry)]
        SecretsManager[Secrets Manager]
    end
    
    Internet((Internet)) --> ALB
    ALB --> Pod1A
    ALB --> Pod1B
    ALB --> Pod2A
    ALB --> Pod2B
    
    Pod1A --> RDS
    Pod1B --> RDS
    Pod1A --> ElastiCache
    Pod1A --> MSK
    
    NAT --> Internet
```

### 9.4 Sequence Diagram: User Login Flow

```mermaid
sequenceDiagram
    participant User
    participant React as React App
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Redis
    participant DB as MySQL
    
    User->>React: Enter credentials
    React->>Gateway: POST /api/v1/auth/login
    Gateway->>Auth: Forward request
    
    Auth->>DB: Validate credentials
    DB-->>Auth: User record
    
    Auth->>Auth: Generate JWT tokens
    Auth->>Redis: Store refresh token
    Redis-->>Auth: OK
    
    Auth-->>Gateway: {accessToken, refreshToken}
    Gateway-->>React: 200 OK + tokens
    
    React->>React: Store tokens
    React-->>User: Redirect to dashboard
    
    Note over React,Gateway: Subsequent requests include JWT
    
    User->>React: Request student data
    React->>Gateway: GET /api/v1/students/123<br/>Authorization: Bearer {JWT}
    Gateway->>Gateway: Validate JWT
    Gateway->>Auth: Verify token (if needed)
    Auth->>Redis: Check blacklist
    Redis-->>Auth: Not blacklisted
    Auth-->>Gateway: Token valid
```

### 9.5 Sequence Diagram: Student Sync to PASI Flow

```mermaid
sequenceDiagram
    participant User
    participant StudentSvc as Student Service
    participant Kafka
    participant SyncOrch as Sync Orchestrator
    participant PasiGW as PASI Gateway
    participant PASI
    participant Notify as Notification Service
    
    User->>StudentSvc: Update student demographics
    StudentSvc->>StudentSvc: Save to database
    StudentSvc->>Kafka: Publish StudentUpdatedEvent
    
    Kafka->>SyncOrch: Consume event
    SyncOrch->>SyncOrch: Calculate hash
    SyncOrch->>SyncOrch: Check sync status
    
    alt Hash changed - sync required
        SyncOrch->>PasiGW: Request PASI sync
        PasiGW->>PasiGW: Transform to SOAP
        PasiGW->>PASI: SubmitStudent (SOAP)
        
        alt Success
            PASI-->>PasiGW: Success response
            PasiGW-->>SyncOrch: Sync successful
            SyncOrch->>SyncOrch: Update sync status
            SyncOrch->>Kafka: Publish SyncCompletedEvent
        else Failure/Conflict
            PASI-->>PasiGW: Error/Conflict response
            PasiGW-->>SyncOrch: Sync failed
            SyncOrch->>Kafka: Publish SyncFailedEvent
            Kafka->>Notify: Consume failure event
            Notify->>Notify: Create alert
        end
    else No change
        SyncOrch->>SyncOrch: Skip sync
    end
```

---

## 10. Example Flows & APIs

### 10.1 Sample API Endpoints - Student Service

```yaml
openapi: 3.0.3
info:
  title: Student Service API
  version: 1.0.0

paths:
  /api/v1/students:
    get:
      summary: Search students
      parameters:
        - name: asn
          in: query
          schema:
            type: string
        - name: lastName
          in: query
          schema:
            type: string
        - name: dateOfBirth
          in: query
          schema:
            type: string
            format: date
        - name: schoolCode
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of students
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StudentPage'
    
    post:
      summary: Create new student
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateStudentRequest'
      responses:
        '201':
          description: Student created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Student'

  /api/v1/students/{id}:
    get:
      summary: Get student by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Student details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Student'
    
    put:
      summary: Update student
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateStudentRequest'
      responses:
        '200':
          description: Student updated

  /api/v1/students/{id}/asn/request:
    post:
      summary: Request ASN assignment from PASI
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '202':
          description: ASN request submitted

components:
  schemas:
    Student:
      type: object
      properties:
        id:
          type: integer
        asn:
          type: string
        legalFirstName:
          type: string
        legalLastName:
          type: string
        dateOfBirth:
          type: string
          format: date
        gender:
          type: string
        email:
          type: string
        pasiSyncStatus:
          type: string
          enum: [PENDING, SYNCED, CONFLICT, ERROR]
```

### 10.2 Request Flow Example

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE REQUEST FLOW EXAMPLE                                 │
│                    "Get Student Profile with Enrollments"                        │
└─────────────────────────────────────────────────────────────────────────────────┘

1. React Frontend
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ GET /api/v1/students/123?include=enrollments,marks                       │
   │ Headers:                                                                  │
   │   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp...              │
   │   X-Correlation-Id: req-abc123                                           │
   │   X-School-Code: AB1234                                                  │
   └───────────────────────────────────────────────────────┬──────────────────┘
                                                           │
                                                           ▼
2. API Gateway (Spring Cloud Gateway)
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ • Validate JWT token                                                      │
   │ • Check rate limits (Redis)                                              │
   │ • Add trace headers (X-Ray)                                              │
   │ • Route to student-service                                               │
   └───────────────────────────────────────────────────────┬──────────────────┘
                                                           │
                                                           ▼
3. Student Service
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ @GetMapping("/students/{id}")                                            │
   │ public StudentDTO getStudent(@PathVariable Long id,                      │
   │                              @RequestParam Set<String> include) {        │
   │                                                                          │
   │   // Check Redis cache first                                             │
   │   String cacheKey = "student:" + id;                                     │
   │   StudentDTO cached = redisTemplate.opsForValue().get(cacheKey);        │
   │   if (cached != null) return cached;                                     │
   │                                                                          │
   │   // Query MySQL database                                                │
   │   Student student = studentRepository.findById(id)                       │
   │       .orElseThrow(() -> new StudentNotFoundException(id));              │
   │                                                                          │
   │   StudentDTO dto = studentMapper.toDTO(student);                         │
   │                                                                          │
   │   // Fetch related data if requested                                     │
   │   if (include.contains("enrollments")) {                                 │
   │       List<EnrollmentDTO> enrollments = enrollmentClient                 │
   │           .getEnrollments(id);  // REST call to enrollment-service       │
   │       dto.setEnrollments(enrollments);                                   │
   │   }                                                                      │
   │                                                                          │
   │   // Cache result                                                        │
   │   redisTemplate.opsForValue().set(cacheKey, dto,                        │
   │       Duration.ofMinutes(15));                                           │
   │                                                                          │
   │   return dto;                                                            │
   │ }                                                                        │
   └───────────────────────────────────────────────────────┬──────────────────┘
                                                           │
                                                           ▼
4. Response
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ HTTP/1.1 200 OK                                                          │
   │ Content-Type: application/json                                           │
   │ X-Correlation-Id: req-abc123                                             │
   │ X-Response-Time: 45ms                                                    │
   │                                                                          │
   │ {                                                                        │
   │   "id": 123,                                                             │
   │   "asn": "123456789",                                                    │
   │   "legalFirstName": "John",                                              │
   │   "legalLastName": "Smith",                                              │
   │   "dateOfBirth": "2010-05-15",                                          │
   │   "pasiSyncStatus": "SYNCED",                                           │
   │   "enrollments": [                                                       │
   │     {                                                                    │
   │       "schoolCode": "AB1234",                                           │
   │       "schoolYear": "2024-2025",                                        │
   │       "status": "ACTIVE",                                               │
   │       "entryDate": "2024-09-03"                                         │
   │     }                                                                    │
   │   ]                                                                      │
   │ }                                                                        │
   └──────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Authentication & Authorization Flow

```java
// JwtAuthenticationFilter.java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final RedisTemplate<String, String> redisTemplate;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        
        String jwt = authHeader.substring(7);
        
        // Check if token is blacklisted (logged out)
        if (redisTemplate.hasKey("jwt:blacklist:" + jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        try {
            // Validate and extract claims
            Claims claims = jwtService.validateToken(jwt);
            
            // Build authentication object
            List<GrantedAuthority> authorities = extractAuthorities(claims);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    claims.getSubject(),
                    null,
                    authorities
                );
            
            // Add school context
            authentication.setDetails(new SchoolContext(
                claims.get("schools", List.class)
            ));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
        } catch (JwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        chain.doFilter(request, response);
    }
    
    private List<GrantedAuthority> extractAuthorities(Claims claims) {
        List<String> roles = claims.get("roles", List.class);
        List<String> permissions = claims.get("permissions", List.class);
        
        return Stream.concat(
            roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)),
            permissions.stream().map(SimpleGrantedAuthority::new)
        ).collect(Collectors.toList());
    }
}
```

---

## 11. How I Will Explain This in Interviews

### 11.1 Two-Minute Architecture Overview

> "I architected and implemented a **cloud-native microservices platform** for Alberta's provincial student information reporting system. The system synchronizes data between local school databases and the provincial PASI system.
>
> **At a high level**, we have about **12 microservices** organized around bounded contexts like Student Management, Enrollment, Academic Records, and PASI Integration. The frontend is a **React SPA** served via CloudFront, communicating through an **API Gateway** built on Spring Cloud Gateway.
>
> **For data**, each service owns its MySQL database following the database-per-service pattern. We use **Redis** extensively for caching, session management, and distributed locks. **Apache Kafka** handles event-driven communication - when a student record changes, events flow through Kafka to trigger PASI synchronization.
>
> **The PASI Gateway Service** is particularly interesting - it's a protocol translator that converts our REST APIs to SOAP calls for the legacy provincial system. We implemented circuit breakers with Resilience4j and response caching to handle the external dependency gracefully.
>
> **For deployment**, everything runs on **AWS EKS** with auto-scaling based on CPU and memory. We use **GitHub Actions** for CI/CD, pushing images to ECR and deploying via ArgoCD. The **ELK stack** provides centralized logging, and Prometheus/Grafana handle metrics."

### 11.2 Deep-Dive Discussion Points

**If asked about Data Consistency:**
> "We use the **Saga pattern** for distributed transactions, particularly for enrollment workflows that span multiple services. Each service publishes domain events to Kafka, and the Sync Orchestrator coordinates the eventual consistency with PASI. For conflict detection, we implement **hash-based reconciliation** - computing MD5 hashes of entity fields and comparing with PASI's hashes to detect drift."

**If asked about Resilience:**
> "The PASI Gateway implements multiple resilience patterns. **Circuit breakers** prevent cascade failures when PASI is unavailable - after 5 failures in 30 seconds, we open the circuit and return cached data or graceful degradation. We have **rate limiting** per school to prevent any single school from overwhelming PASI. **Retry with exponential backoff** handles transient failures, and the **bulkhead pattern** isolates sync operations from real-time queries."

**If asked about Security:**
> "We use **OAuth 2.0 with JWT tokens** for authentication. The JWT contains user roles, permissions, and school associations. Spring Security's **method-level authorization** with @PreAuthorize checks both roles and school-level access. For PASI integration, we use **client certificates** - the certificate management is critical since PASI requires mutual TLS."

**If asked about Observability:**
> "We have three pillars: **Logs** go through the ELK stack with structured JSON logging including correlation IDs for request tracing. **Metrics** are exposed via Spring Boot Actuator and scraped by Prometheus - we track business metrics like sync success rates alongside technical metrics. **Tracing** uses AWS X-Ray to visualize request flows across services. Kibana dashboards show real-time PASI sync status and alert volumes."

### 11.3 Common Follow-up Questions Prepared

| Question | Key Points to Cover |
|----------|---------------------|
| "How do you handle service-to-service auth?" | mTLS with service mesh, or JWT propagation with internal service accounts |
| "What about database migrations?" | Flyway with versioned migrations, backward-compatible changes, feature flags |
| "How do you test microservices?" | Contract testing with Pact, integration tests with Testcontainers, E2E with staging |
| "What's your deployment strategy?" | Rolling deployments, canary releases for critical services, feature flags |
| "How do you handle schema evolution?" | Avro schemas in Kafka, backward-compatible API versioning |

---

## 12. Resume Bullet Points

### Technical Leadership & Architecture

- **Architected and led the modernization** of a legacy monolithic state reporting system into a cloud-native microservices platform serving 2,500+ schools, improving system availability from 95% to 99.9%

- **Designed event-driven architecture** using Apache Kafka for bi-directional data synchronization between PowerSchool SIS and Alberta's provincial PASI system, processing 500K+ sync events daily with eventual consistency guarantees

- **Implemented domain-driven microservices** (12 services) using Java 17, Spring Boot 3.x, and Spring Cloud, with clear bounded contexts for Student Management, Enrollment, Academic Records, and Provincial Integration

### Cloud & DevOps

- **Built containerized deployment pipeline** on AWS EKS with auto-scaling, achieving 60% infrastructure cost reduction through right-sizing and spot instances while maintaining sub-100ms API response times

- **Established CI/CD pipelines** using GitHub Actions, Docker, Helm, and ArgoCD, reducing deployment time from hours to under 15 minutes with zero-downtime rolling deployments

### Performance & Reliability

- **Optimized data access patterns** with Redis caching strategies and database read replicas, reducing average API latency by 70% and database load by 40%

- **Implemented circuit breaker patterns** with Resilience4j for external PASI integration, achieving 99.5% sync success rate with graceful degradation during provincial system outages

### Observability & Security

- **Designed comprehensive observability stack** using ELK (Elasticsearch, Logstash, Kibana), Prometheus, and Grafana, enabling real-time monitoring of sync operations and proactive issue detection

- **Implemented OAuth 2.0/JWT authentication** with Spring Security, supporting role-based and school-based access control for multi-tenant education data compliance

---

## 13. Assumptions & Modernization Decisions

### 13.1 Key Assumptions Made

| Area | Assumption | Rationale |
|------|------------|-----------|
| **Messaging** | Using Apache Kafka (AWS MSK) instead of ActiveMQ | Kafka provides better scalability, durability, and event streaming capabilities for modern architectures |
| **Database** | MySQL instead of Oracle | Aligned with target stack; RDS MySQL provides cost-effective managed service |
| **Service Discovery** | AWS Cloud Map + Spring Cloud | Native AWS integration with Kubernetes service discovery |
| **API Gateway** | Spring Cloud Gateway over AWS API Gateway alone | More control over routing, filtering, and Spring ecosystem integration |
| **PASI Integration** | SOAP remains (legacy) | PASI is external provincial system; cannot change their protocol |
| **Document Storage** | AWS S3 primary, K12 Drive secondary | Modern cloud storage with legacy system support |
| **Deployment Region** | ca-central-1 (Canada) | Data sovereignty requirements for Canadian education data |

### 13.2 Realistic vs. Idealized Aspects

| Aspect | Realistic | Idealized for Interviews |
|--------|-----------|--------------------------|
| **Service Count** | Actual split might be different based on team structure | Clean bounded contexts shown |
| **Kafka Topics** | May have more or fewer based on actual traffic | Comprehensive topic structure shown |
| **Database Per Service** | May share databases for related services in practice | Pure isolation shown |
| **Redis Usage** | May use simpler caching in some services | Comprehensive usage patterns shown |
| **Observability** | May not have all three pillars equally implemented | Full ELK + Prometheus + Tracing shown |
| **Security** | May have simpler auth for internal services | Complete OAuth/JWT flow shown |

### 13.3 Trade-offs Acknowledged

| Trade-off | Decision | Rationale |
|-----------|----------|-----------|
| Consistency vs. Availability | Eventual consistency with Kafka | PASI sync is inherently async; prioritize availability |
| Complexity vs. Scalability | Microservices with overhead | Education data scale and team independence justify complexity |
| Custom vs. Managed | AWS managed services preferred | Reduce operational overhead, focus on business logic |
| REST vs. gRPC | REST for simplicity | Team familiarity, easier debugging, sufficient performance |

### 13.4 What Would Be Different in Production

1. **Service Mesh**: Likely add Istio or AWS App Mesh for advanced traffic management
2. **Feature Flags**: LaunchDarkly or similar for gradual rollouts
3. **Multi-Region**: DR setup with cross-region replication
4. **Cost Optimization**: Reserved instances, savings plans, spot for non-critical workloads
5. **Compliance**: Additional audit logging, data encryption at rest, PII handling procedures
6. **Testing**: More extensive contract testing, chaos engineering with Gremlin

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **ASN** | Alberta Student Number - unique provincial identifier |
| **PASI** | Provincial Approach to Student Information - Alberta's central student data repository |
| **SCM** | School Course Mark - evaluated or official course grade |
| **DER** | Diploma Exam Registration |
| **DCF** | Data Change Framework - event system for data changes |
| **SIS** | Student Information System |
| **CTS** | Career and Technology Studies courses |

---

*This modernized High-Level Design document presents the PowerSchool Alberta State Reporting system as a cloud-native microservices architecture suitable for technical interviews and resume presentation. The design balances realistic implementation patterns with industry best practices.*

*Version: 2.0 | Last Updated: December 2024*


