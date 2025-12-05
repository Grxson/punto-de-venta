package com.puntodeventa.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puntodeventa.backend.dto.CategoriaSubcategoriaDTO;
import com.puntodeventa.backend.model.CategoriaSubcategoria;
import com.puntodeventa.backend.repository.CategoriaSubcategoriaRepository;

import java.util.List;

/**
 * Servicio para gestión de subcategorías de productos.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaSubcategoriaService {
    
    private final CategoriaSubcategoriaRepository categoriaSubcategoriaRepository;
    
    /**
     * Obtener todas las subcategorías activas de una categoría.
     * @param categoriaId ID de la categoría
     * @return Lista de subcategorías ordenadas por orden y nombre
     */
    @Transactional(readOnly = true)
    public List<CategoriaSubcategoriaDTO> obtenerSubcategoriasPorCategoria(Long categoriaId) {
        return categoriaSubcategoriaRepository
            .findByCategoriaIdOrderByOrden(categoriaId)
            .stream()
            .map(this::convertToDTO)
            .toList();
    }
    
    /**
     * Convertir entidad a DTO.
     */
    private CategoriaSubcategoriaDTO convertToDTO(CategoriaSubcategoria entity) {
        return new CategoriaSubcategoriaDTO(
            entity.getId(),
            entity.getCategoria().getId(),
            entity.getNombre(),
            entity.getDescripcion(),
            entity.getOrden(),
            entity.getActiva()
        );
    }
}
