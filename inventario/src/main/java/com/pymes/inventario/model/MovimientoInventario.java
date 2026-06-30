// MovimientoInventario.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_inventario")
@Data
public class MovimientoInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_canal")
    private CanalVenta canal;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "stock_resultante", nullable = false)
    private Integer stockResultante;

    @Column(length = 255)
    private String motivo;

    @Column(name = "fecha_movimiento")
    private LocalDateTime fechaMovimiento = LocalDateTime.now();
}
