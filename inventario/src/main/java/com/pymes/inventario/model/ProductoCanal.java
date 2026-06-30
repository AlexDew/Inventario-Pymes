// ProductoCanal.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "producto_canal", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_producto", "id_canal"})
})
@Data
public class ProductoCanal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProductoCanal;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_canal", nullable = false)
    private CanalVenta canal;

    private Boolean visible = true;
}