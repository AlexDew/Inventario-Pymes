// DashboardResponseDTO.java
package com.pymes.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DashboardResponseDTO {
    private Long totalProductosStock;   // suma de stock_actual
    private Long quiebresActivos;       // alertas SIN_STOCK activas
    private Double precisionInventario; // %
    private Long ventasEvitadasCount;
    private BigDecimal ventasEvitadasValor;
}