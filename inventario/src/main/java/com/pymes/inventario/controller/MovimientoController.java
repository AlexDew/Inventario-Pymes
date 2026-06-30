// MovimientoController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.dto.MovimientoDTO;
import com.pymes.inventario.model.MovimientoInventario;
import com.pymes.inventario.repository.MovimientoInventarioRepository;
import com.pymes.inventario.service.InventarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoController {

    private final InventarioService inventarioService;
    private final MovimientoInventarioRepository movimientoRepository;

    public MovimientoController(InventarioService inventarioService,
                                 MovimientoInventarioRepository movimientoRepository) {
        this.inventarioService = inventarioService;
        this.movimientoRepository = movimientoRepository;
    }

    @PostMapping
    public MovimientoInventario registrar(@RequestBody MovimientoDTO dto) {
        return inventarioService.registrarMovimiento(dto);
    }

    @GetMapping("/producto/{id}")
    public List<MovimientoInventario> historial(@PathVariable Integer id) {
        return movimientoRepository.findByProducto_IdProductoOrderByFechaMovimientoDesc(id);
    }
}
