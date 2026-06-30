// DashboardController.java
package com.pymes.inventario.controller;

import com.pymes.inventario.dto.DashboardResponseDTO;
import com.pymes.inventario.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponseDTO obtenerDashboard() {
        return dashboardService.obtenerMetricas();
    }
}
