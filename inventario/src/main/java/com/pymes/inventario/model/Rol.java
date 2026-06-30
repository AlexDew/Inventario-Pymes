package com.pymes.inventario.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rol")
@Data
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRol;

    @Column(nullable = false, unique = true, length = 30)
    private String nombreRol;
}