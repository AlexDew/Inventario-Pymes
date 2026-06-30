// Categoria.java
package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categoria")
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoria;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(length = 200)
    private String descripcion;
}
