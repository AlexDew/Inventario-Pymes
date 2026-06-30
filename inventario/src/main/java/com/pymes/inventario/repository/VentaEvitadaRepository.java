// VentaEvitadaRepository.java
package com.pymes.inventario.repository;

import com.pymes.inventario.model.VentaEvitada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

public interface VentaEvitadaRepository extends JpaRepository<VentaEvitada, Integer> {

    @Query("SELECT COUNT(v) FROM VentaEvitada v")
    long contarVentasEvitadas();

    @Query("SELECT COALESCE(SUM(v.valorEstimado), 0) FROM VentaEvitada v")
    BigDecimal sumarValorEvitado();
}
