package com.example.bateponto.controller;

import com.example.bateponto.dto.EventoRequest;
import com.example.bateponto.model.Evento;
import com.example.bateponto.repository.EventoRepository;
import com.example.bateponto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final Path uploadDir;

    public EventoController(EventoRepository eventoRepository,
                            UsuarioRepository usuarioRepository,
                            @Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    @GetMapping
    public List<Evento> findAll(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return eventoRepository.findByUsuarioId(usuarioId);
        }
        return eventoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> findById(@PathVariable Long id) {
        var eventoOptional = eventoRepository.findById(id);
        if (eventoOptional.isPresent()) {
            return ResponseEntity.ok(eventoOptional.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart("data") EventoRequest request,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment) throws IOException {
        Long usuarioId = request.getUsuarioId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().body("Usuário não informado.");
        }

        var usuarioOptional = usuarioRepository.findById(usuarioId);
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        String attachmentUrl = null;
        if (attachment != null && !attachment.isEmpty()) {
            attachmentUrl = storeFile(attachment);
        }
        Evento evento = new Evento(
                request.getTitulo(),
                request.getDescricao(),
                request.getData(),
                request.getHoraInicio(),
                request.getHoraFim(),
                request.getTipo(),
                request.getStatus(),
                attachmentUrl,
                usuarioOptional.get()
        );
        eventoRepository.save(evento);
        return ResponseEntity.status(HttpStatus.CREATED).body(evento);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestPart("data") EventoRequest request,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment) throws IOException {
        var existingOptional = eventoRepository.findById(id);
        if (existingOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Evento não encontrado.");
        }

        Long usuarioId = request.getUsuarioId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().body("Usuário não informado.");
        }

        var usuarioOptional = usuarioRepository.findById(usuarioId);
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        Evento existing = existingOptional.get();
        existing.setTitulo(request.getTitulo());
        existing.setDescricao(request.getDescricao());
        existing.setData(request.getData());
        existing.setHoraInicio(request.getHoraInicio());
        existing.setHoraFim(request.getHoraFim());
        existing.setTipo(request.getTipo());
        existing.setStatus(request.getStatus());
        existing.setUsuario(usuarioOptional.get());
        if (attachment != null && !attachment.isEmpty()) {
            existing.setAttachmentUrl(storeFile(attachment));
        }
        eventoRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<byte[]> serveAttachment(@PathVariable String filename) throws IOException {
        Path file = uploadDir.resolve(filename).normalize();
        if (!Files.exists(file) || !Files.isReadable(file)) {
            return ResponseEntity.notFound().build();
        }
        byte[] content = Files.readAllBytes(file);
        String contentType = URLConnection.guessContentTypeFromName(file.getFileName().toString());
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName().toString() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    private String storeFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Nome do arquivo inválido.");
        }
        String filename = StringUtils.cleanPath(originalFilename);
        Path targetLocation = uploadDir.resolve(filename);
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível armazenar o arquivo " + filename, ex);
        }
        return "/api/eventos/attachments/" + filename;
    }
}
