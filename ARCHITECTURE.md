# System Architecture

## Overview

The E-Commerce application follows a classic three-tier architecture with:
- **Presentation Tier**: React frontend (SPA)
- **Business Logic Tier**: Spring Boot REST API
- **Data Tier**: MySQL Database

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     WEB BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │           REACT FRONTEND (SPA)                        │  │
│  │  ├─ Dashboard                                         │  │
│  │  ├─ Product Listing                                  │  │
│  │  ├─ Shopping Cart                                    │  │
│  │  ├─ Authentication                                   │  │
│  │  └─ Order Management                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT SERVER                          │
│                  (Port 8989)                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST CONTROLLERS                        │  │
│  │  ├─ ProductController   (/product)                  │  │
│  │  ├─ AuthController      (/auth)                     │  │
│  │  ├─ CartController      (/cart)                     │  │
│  │  ├─ OrderController     (/order)                    │  │
│  │  ├─ CategoryController  (/category)                 │  │
│  │  └─ UserController      (/user)                     │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │           SERVICE LAYER                             │  │
│  │  ├─ ProductService                                  │  │
│  │  ├─ UserService                                     │  │
│  │  ├─ CartService                                     │  │
│  │  ├─ OrderService                                    │  │
│  │  ├─ CategoryService                                 │  │
│  │  └─ ServiceImpl (Implementations)                    │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │          REPOSITORY LAYER (Spring Data JPA)         │  │
│  │  ├─ ProductRepository                               │  │
│  │  ├─ UsersRepository                                 │  │
│  │  ├─ CartRepository                                  │  │
│  │  ├─ OrderRepository                                 │  │
│  │  └─ CategoryRepository                              │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │          MAPPER LAYER (DTO ↔ Entity)                │  │
│  │  ├─ ProductMapper                                   │  │
│  │  ├─ UserMapper                                      │  │
│  │  ├─ CartMapper                                      │  │
│  │  ├─ OrderMapper                                     │  │
│  │  └─ CategoryMapper                                  │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │          ENTITY LAYER (JPA Entities)                │  │
│  │  ├─ Product                                          │  │
│  │  ├─ Users                                            │  │
│  │  ├─ Cart                                             │  │
│  │  ├─ CartItems                                        │  │
│  │  ├─ Order                                            │  │
│  │  ├─ OrderItem                                        │  │
│  │  └─ Category                                         │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │   EXCEPTION HANDLING & CONFIGURATION                │  │
│  │  ├─ GlobalExceptionHandler                          │  │
│  │  ├─ CorsConfig                                      │  │
│  │  ├─ SpringSecurity                                  │  │
│  │  └─ PasswordEncoderConfig                           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ JDBC
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    MYSQL DATABASE                            │
│                  (localhost:3306)                            │
├─────────────────────────────────────────────────────────────┤
│  Database: ecommercerahul                                   │
│  Tables:                                                    │
│  ├─ users (Stores user information)                        │
│  ├─ products (Product catalog)                             │
│  ├─ categories (Product categories)                        │
│  ├─ carts (Shopping cart heads)                            │
│  ├─ cart_items (Individual cart items)                     │
│  ├─ orders (Order details)                                 │
│  └─ order_items (Items in orders)                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction

### Request Flow

1. **User Interaction**
   - User clicks button in React frontend
   - Event handler triggered (onClick, onChange, etc.)

2. **API Call**
   - Axios HTTP client sends request to backend
   - Request includes method (GET/POST/PUT/DELETE) and payload

3. **Controller Processing**
   - Spring routing directs to appropriate controller
   - Controller validates request
   - Calls service layer

4. **Business Logic**
   - Service performs business operations
   - May call multiple repositories
   - Applies business rules and validations

5. **Data Access**
   - Repository executes SQL queries via JPA
   - Retrieves/modifies data from database

6. **Response Generation**
   - Service returns result to controller
   - Controller wraps in ApiResponseMessage
   - Returns HTTP response

7. **Frontend Update**
   - React receives response
   - Updates state/UI
   - Displays results to user

## Data Models

### User Entity
```
User {
  userId: String (UUID)
  firstName: String
  lastName: String
  email: String
  password: String (hashed)
  gender: MALE/FEMALE
  active: Boolean
  roles: List<Role>
}
```

### Product Entity
```
Product {
  productId: String (UUID)
  title: String
  description: String
  price: BigDecimal
  quantity: Integer
  image: byte[] (stored as BLOB)
  category: Category (FK)
}
```

### Cart Entity
```
Cart {
  cartId: String (UUID)
  user: User (FK)
  createdAt: Timestamp
  cartItems: List<CartItem>
}

CartItem {
  cartItemId: String (UUID)
  cart: Cart (FK)
  product: Product (FK)
  quantity: Integer
}
```

### Order Entity
```
Order {
  orderId: String (UUID)
  user: User (FK)
  orderDate: LocalDateTime
  totalPrice: BigDecimal
  orderStatus: PENDING/CONFIRMED/SHIPPED/DELIVERED
  orderItems: List<OrderItem>
}

OrderItem {
  orderItemId: String (UUID)
  order: Order (FK)
  product: Product (FK)
  quantity: Integer
  unitPrice: BigDecimal
}
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│              LOGIN PROCESS                           │
├──────────────────────────────────────────────────────┤
│ 1. User enters email & password                      │
│ 2. Frontend sends to /auth/login                     │
│ 3. Backend validates credentials                     │
│ 4. Password compared with stored hash                │
│ 5. User data returned if valid                       │
│ 6. Frontend stores user in localStorage              │
│ 7. Subsequent requests use user context              │
└──────────────────────────────────────────────────────┘
```

## Security Architecture

### Spring Security Integration
- Password encoding using BCrypt
- Role-based access control (RBAC)
- Request authentication and authorization
- CSRF protection (if needed)

### CORS Configuration
```
Allowed Origins: * (can be restricted)
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: * (all)
Max Age: 3600 seconds
Credentials: true
```

## Performance Considerations

### Pagination
- Default: 10 items per page
- Reduces database load
- Improves response time

### Caching
- Static resources cached in browser
- Cache duration: 3600 seconds

### Database Optimization
- Proper indexing on frequently queried columns
- JPA query optimization
- Connection pooling

## Scalability Options

### Horizontal Scaling
1. Load balancer in front of multiple app instances
2. Session management via database/Redis
3. Shared MySQL instance

### Database
1. Read replicas for product queries
2. Master-slave replication
3. Database sharding if needed

### Caching Layer
1. Redis for session/data caching
2. Reduces database queries
3. Improves response time

## Deployment Architecture

### Development
```
Developer Machine
├─ MySQL (localhost:3306)
├─ Spring Boot (localhost:8989)
└─ Browser accessing http://localhost:8989
```

### Production
```
┌──────────────────────────────────┐
│        Load Balancer             │
│        (Port 80/443)             │
└──────────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐          ┌────▼─────┐
   │ App Inst1 │          │ App Inst2 │
   │ (8989)    │          │ (8989)    │
   └────┬─────┘          └────┬─────┘
        └──────────┬──────────┘
                   │
            ┌──────▼──────┐
            │   MySQL     │
            │  (cluster)  │
            └─────────────┘
```

## API Response Format

All responses follow standard format:

```json
{
  "message": "Operation description",
  "status": "OK",
  "success": true,
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "message": "Error description",
  "status": "BAD_REQUEST",
  "success": false,
  "data": null
}
```

## Technology Justification

### Spring Boot
- Production-ready framework
- Built-in security
- Excellent ORM support with JPA
- Large community and ecosystem

### React
- Modern UI framework
- Component-based architecture
- Good performance with virtual DOM
- Excellent developer tools

### MySQL
- Reliable relational database
- ACID compliance
- Good query performance
- Wide hosting support

### Tailwind CSS
- Utility-first CSS framework
- Smaller bundle size
- Rapid development
- Mobile-first responsive design

## Monitoring and Logging

### Application Logs
- Spring Boot logging configured in application.properties
- Log level for security set to DEBUG
- SQL queries logged for debugging

### Health Checks
- Database connectivity
- Application startup verification

### Performance Metrics
- Response time tracking
- Query execution time
- API endpoint usage

## Future Architecture Improvements

1. **Microservices Migration**
   - Separate auth, product, order services
   - Independent scaling
   - Technology flexibility

2. **Event-Driven Architecture**
   - Message queue for order processing
   - Asynchronous operations
   - Better decoupling

3. **GraphQL**
   - Alternative to REST
   - Flexible data queries
   - Reduced bandwidth

4. **CDN Integration**
   - Product images on CDN
   - Faster global delivery
   - Reduced server load

5. **Real-time Features**
   - WebSocket for live notifications
   - Real-time inventory updates
   - Chat support
