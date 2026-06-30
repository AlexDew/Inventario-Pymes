// VentaEvitadaController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.model.VentaEvitada;
import com.pymes.inventario.repository.VentaEvitadaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas-evitadas")
@CrossOrigin(origins = "*")
public class VentaEvitadaController {

    private final VentaEvitadaRepository ventaEvitadaRepository;

    public VentaEvitadaController(VentaEvitadaRepository ventaEvitadaRepository) {
        this.ventaEvitadaRepository = ventaEvitadaRepository;
    }

    @GetMapping
    public List<VentaEvitada> listar() {
        return ventaEvitadaRepository.findAll();
    }

    @PostMapping
    public VentaEvitada crear(@RequestBody VentaEvitada ventaEvitada) {
        return ventaEvitadaRepository.save(ventaEvitada);
    }
}
