package com.example.bateponto.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    private String senha;

    @NotBlank
    private String role;

    @JsonIgnoreProperties({"usuario"})
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistroPonto> registroPontos = new ArrayList<>();

    @JsonIgnoreProperties({"usuario"})
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evento> eventos = new ArrayList<>();

    public Usuario() {
    }

    public Usuario(String nome, String email, String senha, String role) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<RegistroPonto> getRegistroPontos() {
        return registroPontos;
    }

    public void setRegistroPontos(List<RegistroPonto> registroPontos) {
        this.registroPontos = registroPontos;
    }

    public List<Evento> getEventos() {
        return eventos;
    }

    public void setEventos(List<Evento> eventos) {
        this.eventos = eventos;
    }
}
