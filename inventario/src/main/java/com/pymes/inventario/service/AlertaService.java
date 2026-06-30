// AlertaService.java
package com.pymes.inventario.service;

import com.pymes.inventario.model.AlertaStock;
import com.pymes.inventario.model.Producto;
import com.pymes.inventario.repository.AlertaStockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AlertaService {

    private final AlertaStockRepository alertaStockRepository;

    public AlertaService(AlertaStockRepository alertaStockRepository) {
        this.alertaStockRepository = alertaStockRepository;
    }

    public void verificarYActualizarAlertas(Producto producto) {
        Optional<AlertaStock> alertaActiva = alertaStockRepository
                .findByProducto_IdProductoAndEstado(producto.getIdProducto(), AlertaStock.EstadoAlerta.ACTIVA);

        int stock = producto.getStockActual();
        int minimo = producto.getStockMinimo();

        if (stock == 0) {
            crearOActualizarAlerta(producto, alertaActiva, AlertaStock.TipoAlerta.SIN_STOCK,
                    "El producto '" + producto.getNombre() + "' se ha agotado.");
        } else if (stock <= minimo) {
            crearOActualizarAlerta(producto, alertaActiva, AlertaStock.TipoAlerta.STOCK_BAJO,
                    "El producto '" + producto.getNombre() + "' tiene stock bajo (" + stock + " unidades).");
        } else {
            // Stock saludable: resolver alerta activa si existe
            alertaActiva.ifPresent(alerta -> {
                alerta.setEstado(AlertaStock.EstadoAlerta.RESUELTA);
                alerta.setFechaResuelta(LocalDateTime.now());
                alertaStockRepository.save(alerta);
            });
        }
    }

    private void crearOActualizarAlerta(Producto producto, Optional<AlertaStock> alertaActiva,
                                          AlertaStock.TipoAlerta tipo, String mensaje) {
        if (alertaActiva.isPresent()) {
            AlertaStock alerta = alertaActiva.get();
            alerta.setTipoAlerta(tipo);
            alerta.setMensaje(mensaje);
            alertaStockRepository.save(alerta);
        } else {
            AlertaStock nueva = new AlertaStock();
            nueva.setProducto(producto);
            nueva.setTipoAlerta(tipo);
            nueva.setMensaje(mensaje);
            nueva.setEstado(AlertaStock.EstadoAlerta.ACTIVA);
            alertaStockRepository.save(nueva);
        }
    }

    public void resolverAlerta(Integer idAlerta) {
        AlertaStock alerta = alertaStockRepository.findById(idAlerta)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        alerta.setEstado(AlertaStock.EstadoAlerta.RESUELTA);
        alerta.setFechaResuelta(LocalDateTime.now());
        alertaStockRepository.save(alerta);
    }
}