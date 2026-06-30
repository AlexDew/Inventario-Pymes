// ProductoService.java
package com.pymes.inventario.service;

import com.pymes.inventario.dto.ProductoDTO;
import com.pymes.inventario.model.Categoria;
import com.pymes.inventario.model.Producto;
import com.pymes.inventario.repository.CategoriaRepository;
import com.pymes.inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<ProductoDTO> listarConFiltros(Integer idCategoria, String search) {
        return productoRepository.buscarConFiltros(idCategoria, search)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Producto crear(ProductoDTO dto) {
        Producto producto = new Producto();
        mapDtoToEntity(dto, producto);
        return productoRepository.save(producto);
    }

    public Producto actualizar(Integer id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        mapDtoToEntity(dto, producto);
        return productoRepository.save(producto);
    }

    private void mapDtoToEntity(ProductoDTO dto, Producto producto) {
        producto.setCodigoSku(dto.getCodigoSku());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecioVenta(dto.getPrecioVenta());
        producto.setPrecioCosto(dto.getPrecioCosto());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setStockMinimo(dto.getStockMinimo());

        if (dto.getIdCategoria() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }
    }

    private ProductoDTO toDTO(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.setIdProducto(p.getIdProducto());
        dto.setCodigoSku(p.getCodigoSku());
        dto.setNombre(p.getNombre());
        dto.setDescripcion(p.getDescripcion());
        dto.setPrecioVenta(p.getPrecioVenta());
        dto.setPrecioCosto(p.getPrecioCosto());
        dto.setImagenUrl(p.getImagenUrl());
        dto.setStockMinimo(p.getStockMinimo());
        dto.setStockActual(p.getStockActual());

        if (p.getCategoria() != null) {
            dto.setIdCategoria(p.getCategoria().getIdCategoria());
            dto.setNombreCategoria(p.getCategoria().getNombre());
        }

        if (p.getStockActual() == 0) {
            dto.setEstadoStock("SIN_STOCK");
        } else if (p.getStockActual() <= p.getStockMinimo()) {
            dto.setEstadoStock("BAJO");
        } else {
            dto.setEstadoStock("OK");
        }

        return dto;
    }
}