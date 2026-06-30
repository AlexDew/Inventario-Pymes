// AlertaDTO.java
package com.pymes.inventario.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AlertaDTO {
    private Integer idAlerta;
    private Integer idProducto;
    private String nombreProducto;
    private String tipoAlerta;
    private String mensaje;
    private String estado;
    private LocalDateTime fechaGenerada;
}
