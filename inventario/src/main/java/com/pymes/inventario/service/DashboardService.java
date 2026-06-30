// DashboardService.java
package com.pymes.inventario.service;

import com.pymes.inventario.dto.DashboardResponseDTO;
import com.pymes.inventario.model.AlertaStock;
import com.pymes.inventario.repository.*;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProductoRepository productoRepository;
    private final AlertaStockRepository alertaStockRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final VentaEvitadaRepository ventaEvitadaRepository;

    public DashboardService(ProductoRepository productoRepository,
                             AlertaStockRepository alertaStockRepository,
                             MovimientoInventarioRepository movimientoRepository,
                             VentaEvitadaRepository ventaEvitadaRepository) {
        this.productoRepository = productoRepository;
        this.alertaStockRepository = alertaStockRepository;
        this.movimientoRepository = movimientoRepository;
        this.ventaEvitadaRepository = ventaEvitadaRepository;
    }

    public DashboardResponseDTO obtenerMetricas() {
        long totalStock = productoRepository.findAll().stream()
                .filter(p -> p.getActivo())
                .mapToLong(p -> p.getStockActual())
                .sum();

        long quiebresActivos = alertaStockRepository.countByEstado(AlertaStock.EstadoAlerta.ACTIVA);

        long totalMovimientos = movimientoRepository.count();
        long ajustes = movimientoRepository.countByTipoMovimiento_Nombre("AJUSTE");

        double precision = totalMovimientos == 0 ? 100.0
                : 100.0 - ((double) ajustes / totalMovimientos * 100.0);

        long ventasEvitadasCount = ventaEvitadaRepository.contarVentasEvitadas();
        var ventasEvitadasValor = ventaEvitadaRepository.sumarValorEvitado();

        return new DashboardResponseDTO(
                totalStock,
                quiebresActivos,
                Math.round(precision * 100.0) / 100.0,
                ventasEvitadasCount,
                ventasEvitadasValor
        );
    }
}