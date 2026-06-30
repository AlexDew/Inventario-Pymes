// ProductoController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.dto.ProductoDTO;
import com.pymes.inventario.model.Producto;
import com.pymes.inventario.service.ProductoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoDTO> listar(
            @RequestParam(required = false) Integer categoria,
            @RequestParam(required = false) String search) {
        return productoService.listarConFiltros(categoria, search);
    }

    @PostMapping
    public Producto crear(@RequestBody ProductoDTO dto) {
        return productoService.crear(dto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Integer id, @RequestBody ProductoDTO dto) {
        return productoService.actualizar(id, dto);
    }
}