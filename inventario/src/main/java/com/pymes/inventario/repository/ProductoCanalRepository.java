// ProductoCanalRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.ProductoCanal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoCanalRepository extends JpaRepository<ProductoCanal, Integer> {
    List<ProductoCanal> findByProducto_IdProducto(Integer idProducto);
}
