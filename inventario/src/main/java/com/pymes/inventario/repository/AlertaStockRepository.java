// AlertaStockRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.AlertaStock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AlertaStockRepository extends JpaRepository<AlertaStock, Integer> {
    List<AlertaStock> findByEstado(AlertaStock.EstadoAlerta estado);

    Optional<AlertaStock> findByProducto_IdProductoAndEstado(Integer idProducto, AlertaStock.EstadoAlerta estado);

    long countByEstado(AlertaStock.EstadoAlerta estado);
}