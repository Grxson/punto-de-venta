package com.puntodeventa.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puntodeventa.backend.dto.CategoriaSubcategoriaDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.CategoriaSubcategoria;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.CategoriaSubcategoriaRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import com.puntodeventa.backend.context.SucursalContext;

import java.util.List;

/**
 * Servicio para gestión de subcategorías de productos.
 * Proporciona operaciones CRUD completas para subcategorías.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaSubcategoriaService {

        private final CategoriaSubcategoriaRepository categoriaSubcategoriaRepository;
        private final CategoriaProductoRepository categoriaProductoRepository;
        private final SucursalRepository sucursalRepository;

        /**
         * Obtener todas las subcategorías activas de una categoría.
         * 
         * @param categoriaId ID de la categoría
         * @return Lista de subcategorías ordenadas por orden y nombre
         */
        @Transactional(readOnly = true)
        public List<CategoriaSubcategoriaDTO> obtenerSubcategoriasPorCategoria(Long categoriaId) {
                log.debug("🔍 Obteniendo subcategorías activas para categoría: {}", categoriaId);

                // Verificar que la categoría existe
                categoriaProductoRepository.findById(categoriaId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Categoría no encontrada: " + categoriaId));

                return categoriaSubcategoriaRepository
                                .findByCategoriaIdOrderByOrden(categoriaId)
                                .stream()
                                .map(this::convertToDTO)
                                .toList();
        }

        /**
         * Obtener una subcategoría por ID.
         */
        @Transactional(readOnly = true)
        public CategoriaSubcategoriaDTO obtenerPorId(Long id) {
                log.debug("🔍 Obteniendo subcategoría: {}", id);

                return categoriaSubcategoriaRepository.findById(id)
                                .map(this::convertToDTO)
                                .orElseThrow(() -> new ResourceNotFoundException("Subcategoría no encontrada: " + id));
        }

        /**
         * Crear una nueva subcategoría.
         */
        public CategoriaSubcategoriaDTO crear(CategoriaSubcategoriaDTO dto) {
                log.info("➕ Creando nueva subcategoría: {} en categoría: {}", dto.nombre(), dto.categoriaId());

                // ✅ SEGREGACIÓN: Obtener la sucursal del usuario actual
                Long sucursalId = SucursalContext.getSucursalId();
                Sucursal sucursal = sucursalRepository.findById(sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Sucursal no encontrada: " + sucursalId));

                // Verificar que la categoría existe
                CategoriaProducto categoria = categoriaProductoRepository.findById(dto.categoriaId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Categoría no encontrada: " + dto.categoriaId()));

                // Verificar que no existe otra subcategoría con el mismo nombre en la misma
                // categoría
                if (categoriaSubcategoriaRepository.existsByCategoriaIdAndNombre(dto.categoriaId(), dto.nombre())) {
                        throw new IllegalArgumentException("Ya existe una subcategoría con el nombre: " + dto.nombre());
                }

                // Calcular el siguiente orden automáticamente
                int proximoOrden = categoriaSubcategoriaRepository
                                .findByCategoriaIdOrderByOrden(dto.categoriaId())
                                .stream()
                                .mapToInt(CategoriaSubcategoria::getOrden)
                                .max()
                                .orElse(-1) + 1;

                CategoriaSubcategoria entity = CategoriaSubcategoria.builder()
                                .categoria(categoria)
                                .nombre(dto.nombre())
                                .descripcion(dto.descripcion())
                                .orden(proximoOrden)
                                .activa(true)
                                .sucursal(sucursal) // ✅ SEGREGACIÓN: Asignar la sucursal
                                .build();

                CategoriaSubcategoria guardada = categoriaSubcategoriaRepository.save(entity);
                log.info("✅ Subcategoría creada exitosamente: {}", guardada.getId());

                return convertToDTO(guardada);
        }

        /**
         * Actualizar una subcategoría existente.
         */
        public CategoriaSubcategoriaDTO actualizar(Long id, CategoriaSubcategoriaDTO dto) {
                log.info("📝 Actualizando subcategoría: {}", id);

                CategoriaSubcategoria entity = categoriaSubcategoriaRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Subcategoría no encontrada: " + id));

                // Si cambió la categoría, verificar que exista
                if (!entity.getCategoria().getId().equals(dto.categoriaId())) {
                        CategoriaProducto nuevaCategoria = categoriaProductoRepository.findById(dto.categoriaId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Categoría no encontrada: " + dto.categoriaId()));
                        entity.setCategoria(nuevaCategoria);
                }

                entity.setNombre(dto.nombre());
                entity.setDescripcion(dto.descripcion());
                entity.setOrden(dto.orden() != null ? dto.orden() : 0);
                entity.setActiva(dto.activa() != null ? dto.activa() : true);

                CategoriaSubcategoria actualizada = categoriaSubcategoriaRepository.save(entity);
                log.info("✅ Subcategoría actualizada exitosamente: {}", id);

                return convertToDTO(actualizada);
        }

        /**
         * Eliminar una subcategoría (hard delete - eliminación permanente).
         */
        public void eliminar(Long id) {
                log.info("🗑️ Eliminando subcategoría permanentemente: {}", id);

                CategoriaSubcategoria entity = categoriaSubcategoriaRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Subcategoría no encontrada: " + id));

                // Eliminar definitivamente de la BD
                categoriaSubcategoriaRepository.deleteById(id);

                log.info("✅ Subcategoría eliminada permanentemente: {}", id);
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
                                entity.getActiva());
        }
}
