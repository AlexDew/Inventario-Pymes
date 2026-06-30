// CanalSyncService.java
package com.pymes.inventario.service;

import com.pymes.inventario.model.CanalVenta;
import com.pymes.inventario.model.Producto;
import com.pymes.inventario.model.ProductoCanal;
import com.pymes.inventario.repository.CanalVentaRepository;
import com.pymes.inventario.repository.ProductoCanalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CanalSyncService {

    private final ProductoCanalRepository productoCanalRepository;
    private final CanalVentaRepository canalVentaRepository;

    public CanalSyncService(ProductoCanalRepository productoCanalRepository,
                             CanalVentaRepository canalVentaRepository) {
        this.productoCanalRepository = productoCanalRepository;
        this.canalVentaRepository = canalVentaRepository;
    }

    // Si el producto se agota, se oculta automáticamente en todos los canales digitales
    public void sincronizarVisibilidad(Producto producto) {
        boolean disponible = producto.getStockActual() > 0;

        List<ProductoCanal> relaciones = productoCanalRepository.findByProducto_IdProducto(producto.getIdProducto());

        for (ProductoCanal pc : relaciones) {
            if (pc.getCanal().getTipo() == CanalVenta.TipoCanal.DIGITAL) {
                pc.setVisible(disponible);
                productoCanalRepository.save(pc);
            }
        }
    }
}