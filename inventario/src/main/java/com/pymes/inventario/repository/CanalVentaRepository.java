// CanalVentaRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.CanalVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CanalVentaRepository extends JpaRepository<CanalVenta, Integer> {
    List<CanalVenta> findByActivoTrue();
}
