// CanalVenta.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "canal_venta")
@Data
public class CanalVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCanal;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCanal tipo;

    @Column(name = "url_enlace", length = 255)
    private String urlEnlace;

    private Boolean activo = true;

    public enum TipoCanal {
        FISICO, DIGITAL
    }
}
