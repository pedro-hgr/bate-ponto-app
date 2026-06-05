package com.example.bateponto.controller;

import com.example.bateponto.dto.LoginRequest;
import com.example.bateponto.dto.RegisterRequest;
import com.example.bateponto.dto.UsuarioResponse;
import com.example.bateponto.model.Usuario;
import com.example.bateponto.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @GetMapping
    public List<UsuarioResponse> findAll() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> findById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> ResponseEntity.ok(toResponse(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest request) {
        Optional<Usuario> existing = usuarioRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario(
                request.getNome(),
                request.getEmail(),
                passwordEncoder.encode(request.getSenha()),
                request.getRole()
        );
        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest request) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(request.getEmail());
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos.");
        }

        Usuario usuario = usuarioOptional.get();
        if (!passwordEncoder.matches(request.getPassword(), usuario.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos.");
        }

        return ResponseEntity.ok(toResponse(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Validated @RequestBody RegisterRequest request) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNome(request.getNome());
                    usuario.setEmail(request.getEmail());
                    usuario.setRole(request.getRole());
                    if (request.getSenha() != null && !request.getSenha().isBlank()) {
                        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
                    }
                    usuarioRepository.save(usuario);
                    return ResponseEntity.ok(toResponse(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getRole());
    }
}
