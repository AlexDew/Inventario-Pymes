// CanalVentaController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.model.CanalVenta;
import com.pymes.inventario.repository.CanalVentaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canales")
@CrossOrigin(origins = "*")
public class CanalVentaController {

    private final CanalVentaRepository canalVentaRepository;

    public CanalVentaController(CanalVentaRepository canalVentaRepository) {
        this.canalVentaRepository = canalVentaRepository;
    }

    @GetMapping
    public List<CanalVenta> listar() {
        return canalVentaRepository.findByActivoTrue();
    }
}
