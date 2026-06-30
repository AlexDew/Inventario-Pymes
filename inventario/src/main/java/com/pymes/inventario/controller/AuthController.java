package com.pymes.inventario.controller;

import com.pymes.inventario.model.Usuario;
import com.pymes.inventario.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty() || !usuarioOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
        }

        Usuario u = usuarioOpt.get();

        // Respuesta con datos básicos del usuario (en prod, aquí iría el JWT)
        return ResponseEntity.ok(Map.of(
                "idUsuario", u.getIdUsuario(),
                "nombre", u.getNombre(),
                "email", u.getEmail(),
                "rol", u.getRol().getNombreRol()
        ));
    }
}