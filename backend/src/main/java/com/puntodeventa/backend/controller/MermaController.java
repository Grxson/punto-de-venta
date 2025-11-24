package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.MermaDTO;
import com.puntodeventa.backend.service.MermaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para mermas de inventario.
 * Documentado según la guía de inventario.
 */
@RestController
@RequestMapping("/api/inventario/mermas")
public class MermaController {
    @Autowired
    private MermaService mermaService;

    /**
     * Listar todas las mermas registradas.
     */
    @GetMapping
    public List<MermaDTO> listarMermas() {
        return mermaService.listarTodas();
    }

    /**
     * Registrar una nueva merma.
     */
    @PostMapping
    public ResponseEntity<MermaDTO> registrarMerma(@RequestBody MermaDTO dto) {
        MermaDTO creada = mermaService.registrarMerma(dto);
        return ResponseEntity.ok(creada);
    }

    /**
     * Obtener una merma por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MermaDTO> obtenerPorId(@PathVariable Long id) {
        MermaDTO dto = mermaService.obtenerPorId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    /**
     * Obtener mermas por ingrediente.
     */
    @GetMapping("/ingrediente/{ingredienteId}")
    public List<MermaDTO> obtenerPorIngrediente(@PathVariable Long ingredienteId) {
        return mermaService.obtenerPorIngrediente(ingredienteId);
    }
}
