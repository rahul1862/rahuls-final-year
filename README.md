# E-Commerce Application

A full-stack e-commerce platform with Spring Boot backend and React frontend.

## Features

- User authentication and registration
- Product catalog with categories
- Shopping cart functionality
- Order management
- Product image upload and storage
- Responsive design
- RESTful API

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.8+
- Modern web browser

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE ecommercerahul;
```

2. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommercerahul
spring.datasource.username=root
spring.datasource.password=root
```

## Build and Run

### Backend

1. Navigate to the project directory:
```bash
cd e-commerce/e-commerce
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

Or use Maven wrapper:
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8989`

### Frontend

The frontend is bundled as a single HTML file and is automatically served from the backend:
- Access the application at: `http://localhost:8989`

## Project Structure

```
e-commerce/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/e_commerce/
│   │   │       ├── config/           # Configuration classes
│   │   │       ├── controller/       # REST controllers
│   │   │       ├── service/          # Business logic
│   │   │       ├── repository/       # Data access
│   │   │       ├── entity/           # JPA entities
│   │   │       ├── dto/              # Data transfer objects
│   │   │       ├── exception/        # Exception handling
│   │   │       └── mapper/           # Entity-DTO mapping
│   │   └── resources/
│   │       ├── static/
│   │       │   └── index.html        # React frontend
│   │       └── application.properties # Configuration
│   └── test/
├── pom.xml                           # Maven dependencies
└── mvnw                              # Maven wrapper
```

## API Endpoints

### Authentication
- `POST /auth` - Register new user
- `POST /auth/login` - User login

### Products
- `GET /product` - Get all products with pagination
- `GET /product/{id}` - Get product by ID
- `POST /product` - Create new product (admin)
- `PUT /product/{id}` - Update product
- `DELETE /product/{id}` - Delete product
- `POST /product/image/{id}` - Upload product image
- `GET /product/image/{id}` - Get product image

### Categories
- `GET /category` - Get all categories
- `POST /category` - Create category
- `PUT /category/{id}` - Update category
- `DELETE /category/{id}` - Delete category

### Cart
- `GET /cart/user/{userId}` - Get user's cart
- `POST /cart/add` - Add item to cart
- `DELETE /cart/item/{cartItemId}` - Remove item from cart

### Orders
- `GET /order` - Get all orders
- `GET /order/{id}` - Get order by ID
- `POST /order` - Create new order
- `PUT /order/{id}` - Update order status

### Users
- `GET /user` - Get all users
- `GET /user/{id}` - Get user by ID
- `PUT /user/{id}` - Update user profile
- `DELETE /user/{id}` - Delete user account

## Frontend Features

### Dashboard
- Browse products with pagination
- Filter by categories
- Add products to shopping cart
- View and manage shopping cart
- Real-time cart updates

### Authentication
- User registration with email validation
- Secure login
- Session management
- Logout functionality

### Shopping Experience
- Product details with images
- Quantity management
- Price calculations
- Checkout functionality

## Technology Stack

### Backend
- Spring Boot 4.0.4
- Spring Data JPA
- Spring Security
- MySQL Database
- Lombok
- Maven

### Frontend
- React 18
- Axios HTTP client
- Tailwind CSS
- Responsive design

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured in `CorsConfig.java` to allow frontend-backend communication across different ports during development.

## Security Features

- Password encryption using Spring Security
- Role-based access control
- SQL injection prevention through parameterized queries
- CORS protection

## Troubleshooting

### Port Already in Use
If port 8989 is already in use, change it in `application.properties`:
```properties
server.port=8080
```

### Database Connection Error
- Ensure MySQL is running
- Verify credentials in `application.properties`
- Check that the database exists

### Frontend Not Loading
- Ensure the backend is running on port 8989
- Clear browser cache
- Check that static files are in `src/main/resources/static/`

## Performance Optimization

- Pagination on product listing (default: 10 items per page)
- Image caching in browser
- Optimized database queries with proper indexing
- Lazy loading of resources

## Future Enhancements

- Payment gateway integration
- Order tracking
- User reviews and ratings
- Wishlist functionality
- Admin dashboard
- Email notifications
- Mobile app

## License

This project is provided as-is for educational and commercial use.

## Support

For issues and questions, please refer to the documentation or contact support.
