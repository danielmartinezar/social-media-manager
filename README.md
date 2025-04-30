# Feature-Based Architecture

## What is Feature-Based Architecture?

Feature-based architecture organizes code by modules or features, rather than technical layers. Each feature contains all necessary components:

- Controllers
- Services
- Repositories
- DTOs (Data Transfer Objects)
- Tests
- Domain models

### Benefits of Feature-Based Architecture

| Benefit | Description |
| --- | --- |
| **Modularity** | Each feature is self-contained and can be developed independently |
| **Cohesion** | Related code stays together, improving readability and discoverability |
| **Team Efficiency** | Teams can work on separate features with minimal conflicts |
| **Scalability** | New features can be added without disrupting existing functionality |
| **Maintainability** | Updates to a feature are isolated to its directory |
| **Reduced Cognitive Load** | Developers only need to understand the relevant feature |

## Application Features

### Authentication

Complete user authentication system with secure JWT handling:

- **Registration**: `/auth/register` - Create new user accounts
- **Login**: `/auth/login` - Authenticate and receive JWT tokens
- **Logout**: `/auth/logout` - Invalidate tokens using blacklist mechanism
- **Token Refresh**: `/auth/refresh-token` - Obtain new tokens without re-authentication

The authentication service handles:

- User registration with email validation
- Login with bcrypt password comparison
- JWT token issuance with UUID-based JTI claims
- Token blacklisting for secure logout
- Refresh token rotation for extended sessions

### User Management

User profile handling with security measures:

- Secure password management (bcrypt hashing)
- Profile information storage and retrieval
- Password stripping from all responses
- User lookup by email and ID

### Transactions

Full CRUD operations for financial transactions:

- **Create**: Add new transactions with user association
- **Read**: View transaction details with pagination
- **Update**: Modify existing transaction properties
- **Delete**: Remove transactions by ID
- Automatic password stripping from user associations

### Restaurant Finder

Location-based restaurant discovery:

- **Nearby Restaurants**: `/restaurants/nearby` - Find restaurants by:
    - City name
    - Latitude/longitude coordinates
- Built-in pagination with metadata
- Integration with OpenStreetMap Overpass API via MapsService

## Technical Stack

| Component | Technology | Description |  |
| --- | --- | --- | --- |
| Framework | NestJS 11 | Modern Node.js framework with dependency injection |  |
| Database | PostgreSQL 14 | Reliable relational database with JSONB capabilities |  |
| ORM | TypeORM | Object-Relational Mapping with Active Record pattern |  |
| Authentication | JWT + Passport | Token-based authentication with strategy patterns |  |
| Geolocation | OpenStreetMap API | Free geographic data queries |  |
| Containerization | Docker Compose | Easy development environment setup |  |

## 🛢️ Database Design (PostgreSQL + TypeORM)

### 🧑 Users Table (`users`)

| Column | Type | Constraints |
| --- | --- | --- |
| id | UUID | Primary Key |
| name | String | Required |
| last_name | String | Required |
| email | String | Required, Unique |
| password | String | Hashed |

**Relations**:

`User` ⇨ `Transaction` — One-to-Many

---

### 💸 Transactions Table (`transactions`)

| Column | Type | Constraints |
| --- | --- | --- |
| id | Integer | Primary Key |
| amount | Number | Required |
| description | String | Optional |
| userId | UUID | FK to [users.id](http://users.id/) |

**Relations**:

`Transaction` ⇨ `User` — Many-to-One

---

### 🚫 Blacklisted Tokens Table (`blacklisted_tokens`)

| Column | Type | Constraints |
| --- | --- | --- |
| id | Integer | Primary Key |
| jti | String | Unique, Indexed |
| expires_at | TimestampTZ | Indexed |

Used to revoke JWTs upon logout.

## Optimized Project Structure

Based on the project screenshots and code samples, here is the recommended structure that better aligns with feature-based architecture principles:

```
src/
├── features/
│   ├── auth/
│   │   ├── __tests__/
│   │   ├── dtos/
│   │   │   └── auth.dto.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── blacklist-tokens.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.types.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── users/
│   │   ├── __tests__/
│   │   ├── dtos/
│   │   │   └── create-user.dto.ts
│   │   ├── entity/
│   │   │   └── users.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.repository.ts
│   │   └── users.service.ts
│   ├── transactions/
│   │   ├── __tests__/
│   │   ├── dtos/
│   │   │   └── transactions.dto.ts
│   │   ├── entity/
│   │   │   └── transactions.entity.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.module.ts
│   │   ├── transactions.repository.ts
│   │   └── transactions.service.ts
│   └── restaurants/
│       ├── __tests__/
│       ├── restaurants.controller.ts
│       ├── restaurants.module.ts
│       └── restaurants.service.ts
├── common/
│   ├── services/
│   │   └── maps/
│   │       ├── maps.module.ts
│   │       ├── maps.service.ts
│   │       └── maps.types.ts
│   └── utils/
│       └── response.utils.ts
├── database/
├── app.controller.ts
├── app.module.ts
└── main.ts

```

This structure ensures each feature is fully encapsulated with its own components, making the codebase more maintainable and easier to navigate.

# API Endpoints Reference

### Authentication

| Endpoint | Method | Authentication | Request Body | Response |
| --- | --- | --- | --- | --- |
| `/auth/register` | POST | No | `{ "name": "string", "lastName": "string", "email": "string", "password": "string" }` | `{ "statusCode": 201, "message": "User registered successfully" }` |
| `/auth/login` | POST | No | `{ "email": "string", "password": "string" }` | `{ "statusCode": 200, "message": "User logged in successfully", "data": { "user": {...}, "accessToken": "string", "refreshToken": "string" }}` |
| `/auth/logout` | POST | JWT Bearer | None | `{ "statusCode": 200, "message": "User logged out successfully" }` |
| `/auth/refresh-token` | POST | JWT Bearer | None | `{ "statusCode": 200, "message": "Token refreshed successfully", "data": { "user": {...}, "accessToken": "string", "refreshToken": "string" }}` |

### Transactions

| Endpoint | Method | Authentication | Request Body/Query | Response |
| --- | --- | --- | --- | --- |
| `/transactions/:id` | GET | JWT Bearer | Path param: `id` (number) | `{ "statusCode": 200, "message": "Transaction fetched successfully", "data": {...} }` |
| `/transactions` | GET | JWT Bearer | Query params: `userId` (required), `page` (default: 1), `size` (default: 10) | `{ "statusCode": 200, "message": "Transactions fetched successfully", "data": [...], "meta": {...} }` |
| `/transactions` | POST | JWT Bearer | `{ "amount": number, "description": "string", "date": "ISO string" (optional), "userId": "string" }` | `{ "statusCode": 201, "message": "Transaction created successfully", "data": {...} }` |
| `/transactions/:id` | PATCH | JWT Bearer | Path param: `id`, Body: `{ "amount": number (optional), "description": "string" (optional), "date": "ISO string" (optional) }` | `{ "statusCode": 200, "message": "Transaction updated successfully", "data": {...} }` |
| `/transactions/:id` | DELETE | JWT Bearer | Path param: `id` (number) | `{ "statusCode": 204, "message": "Transaction deleted successfully" }` |

### Restaurants

| Endpoint | Method | Authentication | Query Parameters | Response |
| --- | --- | --- | --- | --- |
| `/restaurants/nearby` | GET | JWT Bearer | `city` (string) OR `lat` (string) & `lon` (string), `currentPage`(default: 1), `pageSize`(default: 10) | `{ "statusCode": 200, "message": "Nearby restaurants fetched successfully", "data": [...], "meta": {...} }` |

# Running the Project

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- Git

### Setup Instructions

1. **Clone the repository**
    
    ```bash
    git clone https://github.com/username/social-media-manager.git
    cd social-media-manager
    
    ```
    
2. **Install dependencies**
    
    ```bash
    npm install
    
    ```
    
3. **Set up environment variables**
    
    ```bash
    cp .env.example .env
    # Edit .env file with configuration
    
    ```
    
4. **Start the development environment**
    
    ```bash
    # Start PostgreSQL and API in development mode
    docker-compose up -d
    
    ```
    
5. **Run database migrations**
    
    ```bash
    npm run migration:run
    
    ```
    
6. **Start the application** (if not using Docker for the API)
    
    ```bash
    # Development mode with hot reloading
    npm run start:dev
    
    # Production mode
    npm run build
    npm run start:prod
    
    ```
    

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

```