// MovimientoDTO.java
package com.pymes.inventario.dto;

import lombok.Data;

@Data
public class MovimientoDTO {
    private Integer idProducto;
    private String tipoMovimiento; // ENTRADA, SALIDA, MERMA, AJUSTE
    private Integer idCanal;       // opcional
    private Integer idUsuario;
    private Integer cantidad;
    private String motivo;
}
