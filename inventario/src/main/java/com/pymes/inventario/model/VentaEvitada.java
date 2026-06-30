// VentaEvitada.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "venta_evitada")
@Data
public class VentaEvitada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVentaEvitada;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_alerta")
    private AlertaStock alerta;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "valor_estimado", precision = 10, scale = 2)
    private BigDecimal valorEstimado;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();
}