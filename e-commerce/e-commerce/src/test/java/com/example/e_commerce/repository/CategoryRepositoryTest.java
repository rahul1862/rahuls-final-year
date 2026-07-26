package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CategoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void save_andFindById_roundTrips() {
        Category category = new Category();
        category.setCategoryId(UUID.randomUUID().toString());
        category.setTitle("Books");
        category.setDescription("All things books");

        Category saved = categoryRepository.save(category);
        entityManager.flush();
        entityManager.clear();

        Optional<Category> found = categoryRepository.findById(saved.getCategoryId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Books");
    }

    @Test
    void findById_missing_returnsEmpty() {
        assertThat(categoryRepository.findById("does-not-exist")).isEmpty();
    }

    @Test
    void delete_removesCategory() {
        Category category = new Category();
        category.setCategoryId(UUID.randomUUID().toString());
        category.setTitle("Deletable");
        entityManager.persistAndFlush(category);

        categoryRepository.deleteById(category.getCategoryId());
        entityManager.flush();

        assertThat(categoryRepository.findById(category.getCategoryId())).isEmpty();
    }

    @Test
    void category_withProducts_cascadesOnSave() {
        Category category = new Category();
        category.setCategoryId(UUID.randomUUID().toString());
        category.setTitle("Electronics");

        Product product = new Product();
        product.setProductId(UUID.randomUUID().toString());
        product.setTitle("TV");
        product.setCategory(category);
        category.getProducts().add(product);

        categoryRepository.save(category);
        entityManager.flush();
        entityManager.clear();

        Category found = categoryRepository.findById(category.getCategoryId()).orElseThrow();
        assertThat(found.getProducts()).hasSize(1);
        assertThat(found.getProducts().get(0).getTitle()).isEqualTo("TV");
    }
}
