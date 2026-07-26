# Quick Start Guide

## Step 1: Prerequisites Check

Ensure you have installed:
- Java 17+ (`java -version`)
- MySQL 8.0+ (`mysql --version`)
- Maven 3.8+ (`mvn --version`)

## Step 2: Database Configuration

1. Open MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE ecommercerahul;
EXIT;
```

3. Verify connection (from project root):
```bash
mysql -u root -p -e "SHOW DATABASES;" | grep ecommercerahul
```

## Step 3: Configure Application

Edit `e-commerce/e-commerce/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommercerahul
spring.datasource.username=root
spring.datasource.password=root
```

Change `root` to your MySQL password if different.

## Step 4: Build Project

```bash
cd e-commerce/e-commerce
mvn clean install
```

This will:
- Download dependencies
- Compile source code
- Run tests (if any)
- Package the application

Build time: 2-5 minutes (first time)

## Step 5: Run Application

```bash
mvn spring-boot:run
```

Or using the wrapper:
```bash
./mvnw spring-boot:run
```

Expected output:
```
Started ECommerceApplication in X.XXX seconds
```

## Step 6: Access Application

Open your browser and go to:
```
http://localhost:8989
```

## Step 7: Create Test Account

1. Click "Register"
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
3. Click Register
4. Login with your credentials

## Step 8: Test Features

### Add Products (Admin)
```bash
curl -X POST http://localhost:8989/product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Product",
    "description": "A sample product",
    "price": 999.99,
    "quantity": 100
  }'
```

### Browse Products
- Go to dashboard
- Browse all products
- Add items to cart
- Proceed to checkout

## Troubleshooting

### Application won't start
- Check MySQL is running: `mysql -u root -p -e "SELECT 1"`
- Check port 8989 is free: `lsof -i :8989` (Mac/Linux)
- Delete `target/` folder and rebuild: `mvn clean install`

### Database connection fails
- Verify credentials in `application.properties`
- Check MySQL password is correct
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Frontend not loading
- Check backend is running on port 8989
- Clear browser cache (Ctrl+Shift+Delete)
- Open browser console for errors (F12)

### Port already in use
Change port in `application.properties`:
```properties
server.port=8080
```

## Environment Variables (Optional)

Create `application-prod.properties` for production:

```properties
spring.datasource.url=jdbc:mysql://prod-host:3306/ecommercerahul
spring.datasource.username=prod_user
spring.datasource.password=prod_password
spring.jpa.hibernate.ddl-auto=validate
```

Run with:
```bash
mvn spring-boot:run -Dspring.profiles.active=prod
```

## API Testing

Use Postman or similar tools to test endpoints:

1. Register User:
   - URL: `POST http://localhost:8989/auth`
   - Body: `{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"pass123"}`

2. Login:
   - URL: `POST http://localhost:8989/auth/login`
   - Body: `{"email":"john@test.com","password":"pass123"}`

3. Get Products:
   - URL: `GET http://localhost:8989/product`

## Performance Tips

- Products load 12 per page (configurable in frontend)
- Images cached in browser
- Use pagination for large product lists
- Database indexes automatically created

## Next Steps

1. Add more test data
2. Upload product images
3. Explore admin features
4. Customize styling in `index.html`
5. Deploy to production server

## Production Deployment

For production deployment:

1. Build JAR:
```bash
mvn clean package -DskipTests
```

2. Run JAR:
```bash
java -jar e-commerce/e-commerce/target/CiudadAlDia-0.0.1-SNAPSHOT.jar
```

3. Configure with environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://db-host:3306/ecommercerahul
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=prod_password
java -jar CiudadAlDia-0.0.1-SNAPSHOT.jar
```

## Support

For issues:
1. Check logs: `tail -f ~/logs/spring-boot.log`
2. Check database: `mysql -u root -p ecommercerahul`
3. Verify API: `curl http://localhost:8989/product`

Good luck with your e-commerce platform!
