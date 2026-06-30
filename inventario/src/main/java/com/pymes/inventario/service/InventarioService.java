// InventarioService.java
package com.pymes.inventario.service;

import com.pymes.inventario.dto.MovimientoDTO;
import com.pymes.inventario.model.*;
import com.pymes.inventario.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventarioService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final TipoMovimientoRepository tipoMovimientoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CanalVentaRepository canalVentaRepository;
    private final AlertaService alertaService;
    private final CanalSyncService canalSyncService;

    public InventarioService(ProductoRepository productoRepository,
                              MovimientoInventarioRepository movimientoRepository,
                              TipoMovimientoRepository tipoMovimientoRepository,
                              UsuarioRepository usuarioRepository,
                              CanalVentaRepository canalVentaRepository,
                              AlertaService alertaService,
                              CanalSyncService canalSyncService) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.tipoMovimientoRepository = tipoMovimientoRepository;
        this.usuarioRepository = usuarioRepository;
        this.canalVentaRepository = canalVentaRepository;
        this.alertaService = alertaService;
        this.canalSyncService = canalSyncService;
    }

    @Transactional
    public MovimientoInventario registrarMovimiento(MovimientoDTO dto) {
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        TipoMovimiento tipo = tipoMovimientoRepository.findByNombre(dto.getTipoMovimiento())
                .orElseThrow(() -> new RuntimeException("Tipo de movimiento inválido"));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        int stockActual = producto.getStockActual();

        switch (tipo.getNombre()) {
            case "ENTRADA":
            case "AJUSTE":
                stockActual += dto.getCantidad();
                break;
            case "SALIDA":
            case "MERMA":
                if (dto.getCantidad() > stockActual) {
                    throw new RuntimeException("Cantidad insuficiente en stock");
                }
                stockActual -= dto.getCantidad();
                break;
            default:
                throw new RuntimeException("Tipo de movimiento no soportado");
        }

        producto.setStockActual(stockActual);
        productoRepository.save(producto);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setTipoMovimiento(tipo);
        movimiento.setUsuario(usuario);
        movimiento.setCantidad(dto.getCantidad());
        movimiento.setStockResultante(stockActual);
        movimiento.setMotivo(dto.getMotivo());

        if (dto.getIdCanal() != null) {
            CanalVenta canal = canalVentaRepository.findById(dto.getIdCanal()).orElse(null);
            movimiento.setCanal(canal);
        }

        movimientoRepository.save(movimiento);

        // Tras actualizar el stock: revisar alertas y sincronizar visibilidad en canales
        alertaService.verificarYActualizarAlertas(producto);
        canalSyncService.sincronizarVisibilidad(producto);

        return movimiento;
    }
}