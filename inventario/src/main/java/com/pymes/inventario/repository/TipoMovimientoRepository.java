// TipoMovimientoRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoMovimientoRepository extends JpaRepository<TipoMovimiento, Integer> {
    Optional<TipoMovimiento> findByNombre(String nombre);
}