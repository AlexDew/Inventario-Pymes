// AlertaController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.model.AlertaStock;
import com.pymes.inventario.repository.AlertaStockRepository;
import com.pymes.inventario.service.AlertaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
@CrossOrigin(origins = "*")
public class AlertaController {

    private final AlertaStockRepository alertaStockRepository;
    private final AlertaService alertaService;

    public AlertaController(AlertaStockRepository alertaStockRepository, AlertaService alertaService) {
        this.alertaStockRepository = alertaStockRepository;
        this.alertaService = alertaService;
    }

    @GetMapping
    public List<AlertaStock> listar(@RequestParam(required = false) String estado) {
        if (estado != null) {
            return alertaStockRepository.findByEstado(AlertaStock.EstadoAlerta.valueOf(estado));
        }
        return alertaStockRepository.findAll();
    }

    @PutMapping("/{id}/resolver")
    public void resolver(@PathVariable Integer id) {
        alertaService.resolverAlerta(id);
    }
}
