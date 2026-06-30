// MovimientoInventarioRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {
    List<MovimientoInventario> findByProducto_IdProductoOrderByFechaMovimientoDesc(Integer idProducto);

    long countByTipoMovimiento_Nombre(String nombre);
}