// ProductoRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (:categoriaId IS NULL OR p.categoria.idCategoria = :categoriaId) " +
           "AND (:search IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.codigoSku) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Producto> buscarConFiltros(Integer categoriaId, String search);

    List<Producto> findByStockActualLessThanEqualAndActivoTrue(Integer stock);
}