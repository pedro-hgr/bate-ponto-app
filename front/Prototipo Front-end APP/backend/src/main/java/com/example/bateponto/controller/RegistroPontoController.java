package com.example.bateponto.controller;

import com.example.bateponto.dto.RegistroPontoRequest;
import com.example.bateponto.model.RegistroPonto;
import com.example.bateponto.model.Usuario;
import com.example.bateponto.repository.RegistroPontoRepository;
import com.example.bateponto.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registro-pontos")
public class RegistroPontoController {

    private final RegistroPontoRepository registroPontoRepository;
    private final UsuarioRepository usuarioRepository;

    public RegistroPontoController(RegistroPontoRepository registroPontoRepository, UsuarioRepository usuarioRepository) {
        this.registroPontoRepository = registroPontoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<RegistroPonto> findAll(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return registroPontoRepository.findByUsuarioId(usuarioId);
        }
        return registroPontoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroPonto> findById(@PathVariable Long id) {
        var registro = registroPontoRepository.findById(id);
        if (registro.isPresent()) {
            return ResponseEntity.ok(registro.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> create(@Validated @RequestBody RegistroPontoRequest request) {
        var usuarioOptional = usuarioRepository.findById(request.getUsuarioId());
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        Usuario usuario = usuarioOptional.get();
        RegistroPonto registroPonto = new RegistroPonto(
                request.getData(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getObservacao(),
                usuario
        );
        registroPontoRepository.save(registroPonto);
        return ResponseEntity.status(201).body(registroPonto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Validated @RequestBody RegistroPontoRequest request) {
        var existingOptional = registroPontoRepository.findById(id);
        if (existingOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Registro não encontrado.");
        }

        var usuarioOptional = usuarioRepository.findById(request.getUsuarioId());
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        RegistroPonto existing = existingOptional.get();
        Usuario usuario = usuarioOptional.get();
        existing.setData(request.getData());
        existing.setCheckIn(request.getCheckIn());
        existing.setCheckOut(request.getCheckOut());
        existing.setObservacao(request.getObservacao());
        existing.setUsuario(usuario);
        registroPontoRepository.save(existing);
        return ResponseEntity.ok(existing);
    }
}
