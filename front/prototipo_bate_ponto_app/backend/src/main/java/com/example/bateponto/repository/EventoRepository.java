package com.example.bateponto.repository;

import com.example.bateponto.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByUsuarioId(Long usuarioId);
}
