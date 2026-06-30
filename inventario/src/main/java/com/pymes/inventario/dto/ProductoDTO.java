// ProductoDTO.java
package com.pymes.inventario.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoDTO {
    private Integer idProducto;
    private String codigoSku;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private BigDecimal precioCosto;
    private Integer idCategoria;
    private String nombreCategoria;
    private String imagenUrl;
    private Integer stockMinimo;
    private Integer stockActual;
    private String estadoStock; // "OK", "BAJO", "SIN_STOCK"
}