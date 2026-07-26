# E-Commerce Application - Complete Deployment Guide

## Package Contents

This complete e-commerce application package includes:

### Backend (Spring Boot)
- Full REST API with 6 resource controllers
- Authentication and security configuration
- Service layer with business logic
- JPA repository layer for data access
- DTO mapping layer
- Exception handling
- CORS configuration for frontend integration

### Frontend (React)
- Single-page application (SPA)
- Responsive UI with Tailwind CSS
- Shopping cart functionality
- Product browsing and filtering
- User authentication
- Real-time updates

### Documentation
- README.md - Complete project overview
- SETUP.md - Quick start guide
- ARCHITECTURE.md - System design and architecture
- DEPLOYMENT.md - This file

## Pre-Deployment Checklist

- [ ] Java 17 or higher installed
- [ ] MySQL 8.0 or higher installed
- [ ] Maven 3.8 or higher installed
- [ ] Port 8989 is available
- [ ] MySQL port 3306 is available
- [ ] At least 500MB free disk space

## Installation Steps

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ecommercerahul;

# Verify creation
SHOW DATABASES;
QUIT;
```

### 2. Application Configuration

Edit: `e-commerce/e-commerce/src/main/resources/application.properties`

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.url=jdbc:mysql://localhost:3306/ecommercerahul
```

### 3. Build Application

```bash
cd e-commerce/e-commerce
mvn clean install -DskipTests
```

Expected time: 2-5 minutes first time, 30-60 seconds after

### 4. Run Application

```bash
mvn spring-boot:run
```

Or using Maven wrapper:
```bash
./mvnw spring-boot:run
```

### 5. Access Application

Open browser: `http://localhost:8989`

## Complete Directory Structure

```
ecommerce-app/
├── README.md                          # Project overview
├── SETUP.md                           # Quick start guide
├── ARCHITECTURE.md                    # System architecture
├── DEPLOYMENT.md                      # This file
├── .gitignore                         # Git ignore rules
│
└── e-commerce/
    └── e-commerce/                    # Spring Boot Project Root
        ├── pom.xml                    # Maven configuration
        ├── mvnw                       # Maven wrapper (Linux/Mac)
        ├── mvnw.cmd                   # Maven wrapper (Windows)
        ├── HELP.md                    # Spring Boot help
        │
        ├── src/
        │   ├── main/
        │   │   ├── java/
        │   │   │   └── com/example/e_commerce/
        │   │   │       ├── config/
        │   │   │       │   └── CorsConfig.java          # CORS configuration
        │   │   │       ├── controller/
        │   │   │       │   ├── AuthController.java      # Authentication (POST /auth, /auth/login)
        │   │   │       │   ├── ProductController.java   # Products (GET/POST/PUT/DELETE /product)
        │   │   │       │   ├── CartController.java      # Cart operations
        │   │   │       │   ├── OrderController.java     # Order management
        │   │   │       │   ├── CategoryController.java  # Categories
        │   │   │       │   └── UserController_1.java    # User management
        │   │   │       ├── service/
        │   │   │       │   ├── ProductService.java
        │   │   │       │   ├── UserService.java
        │   │   │       │   ├── CartService.java
        │   │   │       │   ├── OrderService.java
        │   │   │       │   ├── CategoryService.java
        │   │   │       │   └── serviceImpl/              # Service implementations
        │   │   │       ├── repository/
        │   │   │       │   ├── ProductRepository.java
        │   │   │       │   ├── UsersRepository.java
        │   │   │       │   ├── CartRepository.java
        │   │   │       │   ├── OrderRepository.java
        │   │   │       │   └── CategoryRepository.java
        │   │   │       ├── entity/
        │   │   │       │   ├── Product.java
        │   │   │       │   ├── Users.java
        │   │   │       │   ├── Cart.java
        │   │   │       │   ├── CartItems.java
        │   │   │       │   ├── Order.java
        │   │   │       │   ├── OrderItem.java
        │   │   │       │   └── Category.java
        │   │   │       ├── dto/
        │   │   │       │   ├── ProductDto.java
        │   │   │       │   ├── UserDto.java
        │   │   │       │   ├── CartDto.java
        │   │   │       │   ├── OrderDto.java
        │   │   │       │   ├── CategoryDto.java
        │   │   │       │   ├── LoginDto.java
        │   │   │       │   └── Role.java
        │   │   │       ├── mapper/
        │   │   │       │   ├── ProductMapper.java
        │   │   │       │   ├── UserMapper.java
        │   │   │       │   ├── CartMapper.java
        │   │   │       │   ├── OrderMapper.java
        │   │   │       │   └── CategoryMapper.java
        │   │   │       ├── exception/
        │   │   │       │   ├── GlobalExceptionHandler.java
        │   │   │       │   └── ResourceNotFoundException.java
        │   │   │       ├── security/
        │   │   │       │   ├── SpringSecurity.java
        │   │   │       │   └── PasswordEncoderConfig.java
        │   │   │       ├── util/
        │   │   │       │   ├── ApiResponseMessage.java
        │   │   │       │   ├── PageableResponse.java
        │   │   │       │   ├── AddItemRequest.java
        │   │   │       │   └── CreateOrderRequest.java
        │   │   │       ├── Helper/
        │   │   │       │   └── Helper.java
        │   │   │       └── ECommerceApplication.java     # Main Spring Boot class
        │   │   └── resources/
        │   │       ├── application.properties            # Application configuration
        │   │       ├── static/
        │   │       │   └── index.html                    # React frontend (SPA)
        │   │       └── templates/
        │   └── test/
        │       └── java/
        │           └── com/example/e_commerce/
        │               └── ECommerceApplicationTests.java
        │
        └── .mvn/
            └── wrapper/                                   # Maven wrapper files
```

## API Endpoint Summary

### Authentication
```
POST /auth                    Register new user
POST /auth/login              User login
```

### Products
```
GET    /product               Get all products (paginated)
GET    /product/{id}          Get product details
POST   /product               Create new product
PUT    /product/{id}          Update product
DELETE /product/{id}          Delete product
POST   /product/image/{id}    Upload product image
GET    /product/image/{id}    Get product image
```

### Categories
```
GET    /category              Get all categories
POST   /category              Create category
PUT    /category/{id}         Update category
DELETE /category/{id}         Delete category
```

### Shopping Cart
```
GET    /cart/user/{userId}    Get user's cart
POST   /cart/add              Add item to cart
DELETE /cart/item/{itemId}    Remove item from cart
```

### Orders
```
GET    /order                 Get all orders
GET    /order/{id}            Get order details
POST   /order                 Create new order
PUT    /order/{id}            Update order
```

### Users
```
GET    /user                  Get all users
GET    /user/{id}             Get user details
PUT    /user/{id}             Update user
DELETE /user/{id}             Delete user
```

## Request/Response Examples

### Register User
```bash
curl -X POST http://localhost:8989/auth \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "gender": "MALE"
  }'
```

### Login
```bash
curl -X POST http://localhost:8989/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl -X GET "http://localhost:8989/product?pageNo=0&pageSize=10" \
  -H "Content-Type: application/json"
```

### Add to Cart
```bash
curl -X POST http://localhost:8989/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "productId": "product-uuid",
    "quantity": 1
  }'
```

## Configuration Files

### application.properties
Located in: `src/main/resources/application.properties`

Key settings:
- `server.port` - Application port (default: 8989)
- `spring.datasource.url` - Database connection URL
- `spring.datasource.username` - Database username
- `spring.datasource.password` - Database password
- `spring.jpa.hibernate.ddl-auto` - Schema management (update for dev)
- `product.profile.image.path` - Image storage path

### pom.xml
Located in: `pom.xml`

Contains:
- Maven project configuration
- Dependency management (Spring Boot, JPA, Security, etc.)
- Build plugins
- Java version (17)

## Frontend (index.html)

Single-page React application with:
- **Authentication**: Login and registration forms
- **Dashboard**: Product browsing and shopping
- **Navigation**: Responsive navbar with cart indicator
- **Shopping Cart**: Floating cart widget
- **Product Grid**: 4-column responsive layout
- **Pagination**: Navigate through product pages
- **Styling**: Tailwind CSS for modern UI

### Frontend Features
- Real-time cart updates
- Product image display
- Category filtering
- Quantity management
- Price calculations
- Local storage for user session
- Error handling and validation

## Performance Optimization

### Database
- Indexed primary keys
- Indexed foreign keys
- Query pagination (10-12 items per page)
- Connection pooling

### Frontend
- Single bundle delivery
- Browser caching (3600 seconds)
- Lazy loading preparation
- Responsive images

### API
- Pagination for large datasets
- Efficient query filtering
- Minimal data transfer
- Error handling

## Security Features

### Backend
- Spring Security integration
- Password encoding (BCrypt)
- CORS configuration
- Request validation
- Exception handling

### Frontend
- Secure password input
- Session management
- Client-side validation
- XSS prevention (React)

## Troubleshooting

### Issue: "Could not connect to database"
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check credentials in application.properties
```

### Issue: "Port 8989 already in use"
```bash
# Change port in application.properties
server.port=8080

# Or kill process on port
lsof -ti:8989 | xargs kill -9
```

### Issue: "Frontend not loading"
```bash
# Check backend is running
curl http://localhost:8989

# Check static files exist
ls -la e-commerce/e-commerce/src/main/resources/static/

# Clear browser cache
# Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)
```

### Issue: "CORS error in console"
- Verify CorsConfig.java exists
- Check server.port in logs
- Ensure frontend points to correct backend URL
- Check browser console for exact error

## Database Troubleshooting

### Check Database Tables
```bash
mysql -u root -p -e "USE ecommercerahul; SHOW TABLES;"
```

### Clear Database and Restart
```bash
mysql -u root -p -e "DROP DATABASE ecommercerahul; CREATE DATABASE ecommercerahul;"
```

### View Logs
```bash
# Spring Boot logs (while running)
# Check console output for error messages

# MySQL logs (varies by OS)
# Windows: Check Event Viewer
# Linux: tail -f /var/log/mysql/error.log
# Mac: tail -f /usr/local/var/mysql/error.log
```

## Production Deployment

### Build JAR
```bash
mvn clean package -DskipTests
```

### Package Locations
- Built JAR: `target/CiudadAlDia-0.0.1-SNAPSHOT.jar`
- Version: 0.0.1-SNAPSHOT

### Run JAR
```bash
java -jar target/CiudadAlDia-0.0.1-SNAPSHOT.jar
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM openjdk:17
WORKDIR /app
COPY target/CiudadAlDia-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8989
CMD ["java","-jar","app.jar"]
```

Build and run:
```bash
docker build -t ecommerce:1.0 .
docker run -p 8989:8989 --name ecommerce ecommerce:1.0
```

## Maintenance

### Regular Tasks
- Monitor application logs
- Backup database regularly
- Update dependencies (mvn versions:display-dependency-updates)
- Clear old image uploads

### Database Maintenance
```bash
# Optimize tables
OPTIMIZE TABLE products;
OPTIMIZE TABLE users;
OPTIMIZE TABLE orders;
```

### Log Rotation
Configure in application.properties:
```properties
logging.file.name=logs/app.log
logging.file.max-size=10MB
logging.file.max-history=30
```

## Support and Resources

### Documentation
- See README.md for project overview
- See SETUP.md for quick start
- See ARCHITECTURE.md for system design

### Common Issues
1. Database connection failed
   - Verify MySQL is running
   - Check credentials
   - Verify database exists

2. Frontend not responding
   - Check backend is running on 8989
   - Verify network connectivity
   - Check browser console for errors

3. API endpoints not found
   - Verify application is fully started
   - Check port configuration
   - Test with curl: `curl http://localhost:8989/product`

### Getting Help
1. Check logs for error messages
2. Review troubleshooting section above
3. Verify all prerequisites are installed
4. Test individual components in isolation

## Next Steps After Deployment

1. **Add Sample Data**
   - Create test users
   - Add sample products
   - Upload product images

2. **Configure Settings**
   - Adjust pagination size
   - Set image storage path
   - Configure security settings

3. **Test Features**
   - User registration and login
   - Browse products
   - Add to cart
   - Place orders

4. **Optimize Performance**
   - Add database indexes if needed
   - Configure caching
   - Monitor response times

5. **Prepare for Production**
   - Set up monitoring
   - Configure backups
   - Set up SSL/TLS
   - Plan scaling strategy

## Version Information

- **Spring Boot**: 4.0.4
- **Java**: 17
- **React**: 18
- **MySQL**: 8.0+
- **Maven**: 3.8+

## Success Indicators

After successful deployment, you should be able to:
- [ ] Access dashboard at http://localhost:8989
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Browse products
- [ ] Add products to cart
- [ ] View cart items
- [ ] API endpoints respond correctly

## Completion Checklist

- [ ] Database created and accessible
- [ ] All dependencies installed
- [ ] Application builds successfully
- [ ] Application starts without errors
- [ ] Frontend loads at http://localhost:8989
- [ ] Can register and login
- [ ] Can browse products
- [ ] Shopping cart works
- [ ] No console errors
- [ ] Ready for use

Congratulations! Your e-commerce application is ready for deployment.
