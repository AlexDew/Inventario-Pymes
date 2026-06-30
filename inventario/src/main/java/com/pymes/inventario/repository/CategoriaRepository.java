// CategoriaRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}