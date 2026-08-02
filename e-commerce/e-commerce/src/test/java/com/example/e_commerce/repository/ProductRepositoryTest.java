package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void save_andFindById_roundTrips() {
        Product product = new Product();
        product.setProductId(UUID.randomUUID().toString());
        product.setTitle("Widget");
        product.setDescription("A test widget");
        product.setPrice(19.99);
        product.setDiscountedPrice(15);
        product.setQuantity(10);
        product.setStock(true);
        product.setLive(true);

        Product saved = productRepository.save(product);
        entityManager.flush();
        entityManager.clear();

        Optional<Product> found = productRepository.findById(saved.getProductId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Widget");
        assertThat(found.get().getPrice()).isEqualTo(19.99);
    }

    @Test
    void findById_missing_returnsEmpty() {
        Optional<Product> found = productRepository.findById("does-not-exist");

        assertThat(found).isEmpty();
    }

    @Test
    void save_withCategory_persistsRelationship() {
        Category category = new Category();
        category.setCategoryId(UUID.randomUUID().toString());
        category.setTitle("Electronics");
        entityManager.persist(category);

        Product product = new Product();
        product.setProductId(UUID.randomUUID().toString());
        product.setTitle("Phone");
        product.setCategory(category);

        productRepository.save(product);
        entityManager.flush();
        entityManager.clear();

        Product found = productRepository.findById(product.getProductId()).orElseThrow();

        assertThat(found.getCategory()).isNotNull();
        assertThat(found.getCategory().getCategoryId()).isEqualTo(category.getCategoryId());
    }

    @Test
    void delete_removesProduct() {
        Product product = new Product();
        product.setProductId(UUID.randomUUID().toString());
        product.setTitle("Deletable");
        entityManager.persistAndFlush(product);

        productRepository.deleteById(product.getProductId());
        entityManager.flush();

        assertThat(productRepository.findById(product.getProductId())).isEmpty();
    }

    @Test
    void findAll_returnsAllPersistedProducts() {
        Product p1 = new Product();
        p1.setProductId(UUID.randomUUID().toString());
        p1.setTitle("First");
        entityManager.persist(p1);

        Product p2 = new Product();
        p2.setProductId(UUID.randomUUID().toString());
        p2.setTitle("Second");
        entityManager.persist(p2);
        entityManager.flush();

        List<Product> all = productRepository.findAll();

        assertThat(all).hasSize(2);
    }
}
