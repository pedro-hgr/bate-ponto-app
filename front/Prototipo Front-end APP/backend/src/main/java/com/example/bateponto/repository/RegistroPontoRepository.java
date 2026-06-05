package com.example.bateponto.repository;

import com.example.bateponto.model.RegistroPonto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroPontoRepository extends JpaRepository<RegistroPonto, Long> {
    List<RegistroPonto> findByUsuarioId(Long usuarioId);
}
