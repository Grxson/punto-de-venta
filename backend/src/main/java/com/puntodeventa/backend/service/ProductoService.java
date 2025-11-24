package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.dto.ProductoCostoDTO;
import com.puntodeventa.backend.dto.ProductoCostoHistoricoDTO;
import com.puntodeventa.backend.dto.ProductoCostoHistoricoPageDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.Receta;
import com.puntodeventa.backend.model.ProductoCostoHistorico;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.RecetaRepository;
import com.puntodeventa.backend.repository.ProductoCostoHistoricoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaRepository;
    private final RecetaRepository recetaRepository;
    private final ProductoCostoHistoricoRepository costoHistoricoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaProductoRepository categoriaRepository,
                           RecetaRepository recetaRepository,
                           ProductoCostoHistoricoRepository costoHistoricoRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.recetaRepository = recetaRepository;
        this.costoHistoricoRepository = costoHistoricoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId, Optional<String> q) {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
                .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
                .filter(p -> categoriaId.map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId())).orElse(true))
                .filter(p -> q.map(s -> p.getNombre() != null && p.getNombre().toLowerCase().contains(s.toLowerCase())).orElse(true))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoDTO obtener(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return toDTO(p);
    }

    public ProductoDTO crear(ProductoDTO dto) {
        Producto p = new Producto();
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    public void eliminar(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        // Borrado lógico
        p.setActivo(false);
        productoRepository.save(p);
    }

    public ProductoDTO cambiarEstado(Long id, boolean activo) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        p.setActivo(activo);
        return toDTO(productoRepository.save(p));
    }

    /* ===================== COSTEO ===================== */

    @Transactional(readOnly = true)
    public ProductoCostoDTO obtenerCosto(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return toCostoDTO(p, tieneReceta(id));
    }

    public ProductoCostoDTO recalcularCosto(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        List<Receta> receta = recetaRepository.findByProductoIdWithDetails(id);
        if (receta.isEmpty()) {
            // Sin receta: dejamos costoEstimado en null
            p.setCostoEstimado(null);
        } else {
            BigDecimal total = BigDecimal.ZERO;
            for (Receta r : receta) {
                BigDecimal merma = r.getMermaTeorica() != null ? r.getMermaTeorica() : BigDecimal.ZERO;
                BigDecimal cantidad = r.getCantidad();
                // Ajustar por merma teórica: cantidad efectiva = cantidad / (1 - merma)
                BigDecimal unoMenosMerma = BigDecimal.ONE.subtract(merma);
                BigDecimal cantidadEfectiva = unoMenosMerma.compareTo(BigDecimal.ZERO) > 0
                        ? cantidad.divide(unoMenosMerma, 6, RoundingMode.HALF_UP)
                        : cantidad; // Si merma es 1 o mayor (caso anómalo) usamos cantidad original
                BigDecimal costoIngrediente = cantidadEfectiva.multiply(r.getIngrediente().getCostoUnitarioBase());
                total = total.add(costoIngrediente);
            }
            // Redondeamos a 4 decimales como define la columna costo_estimado
            p.setCostoEstimado(total.setScale(4, RoundingMode.HALF_UP));
        }
        Producto guardado = productoRepository.save(p);

        // Registrar histórico si existe costo nuevo (no null) y cambió.
        if (guardado.getCostoEstimado() != null) {
            BigDecimal precio = guardado.getPrecio();
            BigDecimal costo = guardado.getCostoEstimado();
            BigDecimal margenAbs = null;
            BigDecimal margenPct = null;
            if (precio != null && costo != null && precio.compareTo(BigDecimal.ZERO) > 0) {
                margenAbs = precio.subtract(costo).setScale(4, RoundingMode.HALF_UP);
                margenPct = margenAbs.divide(precio, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            }
            // Último registro para comparar
            List<ProductoCostoHistorico> ultimos = costoHistoricoRepository.findByProductoIdOrderByFechaCalculoDesc(id);
            boolean cambio = ultimos.isEmpty() || (ultimos.getFirst().getCosto() == null && costo != null) ||
                    (ultimos.getFirst().getCosto() != null && ultimos.getFirst().getCosto().compareTo(costo) != 0);
            if (cambio) {
                ProductoCostoHistorico hist = ProductoCostoHistorico.builder()
                        .producto(guardado)
                        .costo(costo)
                        .precio(precio)
                        .margenAbsoluto(margenAbs)
                        .margenPorcentaje(margenPct)
                        .fechaCalculo(java.time.LocalDateTime.now())
                        .fuente("RECETA_RECALCULO_MANUAL")
                        .build();
                costoHistoricoRepository.save(hist);
            }
        }
        return toCostoDTO(guardado, !receta.isEmpty());
    }

    public List<ProductoCostoDTO> recalcularCostosMasivo() {
        return productoRepository.findAll().stream()
                .map(prod -> recalcularCosto(prod.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoCostoHistoricoPageDTO historialCostos(Long productoId, int pagina, int tamano) {
    Page<ProductoCostoHistorico> page = costoHistoricoRepository.findByProductoIdOrderByFechaCalculoDesc(
        productoId, PageRequest.of(pagina, tamano));
    List<ProductoCostoHistoricoDTO> datos = page.getContent().stream()
        .map(h -> new ProductoCostoHistoricoDTO(
            h.getId(),
            h.getProducto().getId(),
            h.getCosto(),
            h.getPrecio(),
            h.getMargenAbsoluto(),
            h.getMargenPorcentaje(),
            h.getFechaCalculo(),
            h.getFuente()
        ))
        .toList();
    return new ProductoCostoHistoricoPageDTO(
        productoId,
        pagina,
        tamano,
        page.getTotalElements(),
        page.getTotalPages(),
        datos
    );
    }

    private boolean tieneReceta(Long productoId) {
        return !recetaRepository.findByProductoId(productoId).isEmpty();
    }

    private void apply(ProductoDTO dto, Producto p) {
        if (dto.nombre() != null) p.setNombre(dto.nombre());
        p.setDescripcion(dto.descripcion());
        if (dto.categoriaId() != null) {
            CategoriaProducto c = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + dto.categoriaId()));
            p.setCategoria(c);
        } else {
            p.setCategoria(null);
        }
        p.setPrecio(dto.precio());
        p.setCostoEstimado(dto.costoEstimado());
        p.setSku(dto.sku());
        if (dto.activo() != null) p.setActivo(dto.activo());
        if (dto.disponibleEnMenu() != null) p.setDisponibleEnMenu(dto.disponibleEnMenu());
    }

    private ProductoDTO toDTO(Producto p) {
        return new ProductoDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getPrecio(),
                p.getCostoEstimado(),
                p.getSku(),
                p.getActivo(),
                p.getDisponibleEnMenu()
        );
    }

    private ProductoCostoDTO toCostoDTO(Producto p, boolean tieneReceta) {
        BigDecimal precio = p.getPrecio();
        BigDecimal costo = p.getCostoEstimado();
        BigDecimal margenAbs = null;
        BigDecimal margenPct = null;
        if (precio != null && costo != null && precio.compareTo(BigDecimal.ZERO) > 0) {
            margenAbs = precio.subtract(costo).setScale(4, RoundingMode.HALF_UP);
            margenPct = margenAbs.divide(precio, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }
        return new ProductoCostoDTO(
                p.getId(),
                p.getNombre(),
                costo,
                precio,
                margenAbs,
                margenPct,
                tieneReceta
        );
    }
}
