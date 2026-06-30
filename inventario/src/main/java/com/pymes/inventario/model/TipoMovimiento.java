// TipoMovimiento.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tipo_movimiento")
@Data
public class TipoMovimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTipoMovimiento;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre; // ENTRADA, SALIDA, MERMA, AJUSTE
}
