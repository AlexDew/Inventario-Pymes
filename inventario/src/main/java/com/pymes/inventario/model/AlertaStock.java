// AlertaStock.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerta_stock")
@Data
public class AlertaStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAlerta;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false)
    private TipoAlerta tipoAlerta;

    @Column(nullable = false, length = 255)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    private EstadoAlerta estado = EstadoAlerta.ACTIVA;

    @Column(name = "fecha_generada")
    private LocalDateTime fechaGenerada = LocalDateTime.now();

    @Column(name = "fecha_resuelta")
    private LocalDateTime fechaResuelta;

    public enum TipoAlerta {
        STOCK_BAJO, SIN_STOCK
    }

    public enum EstadoAlerta {
        ACTIVA, RESUELTA
    }
}
