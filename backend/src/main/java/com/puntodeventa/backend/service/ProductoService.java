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
import com.puntodeventa.backend.repository.VentaItemRepository;
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
    private final VentaItemRepository ventaItemRepository;
    private final WebSocketNotificationService notificationService;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaProductoRepository categoriaRepository,
                           RecetaRepository recetaRepository,
                           ProductoCostoHistoricoRepository costoHistoricoRepository,
                           VentaItemRepository ventaItemRepository,
                           WebSocketNotificationService notificationService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.recetaRepository = recetaRepository;
        this.costoHistoricoRepository = costoHistoricoRepository;
        this.ventaItemRepository = ventaItemRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId, Optional<String> q) {
        // Por defecto, solo mostrar productos base (sin variantes) o productos sin variantes
        List<Producto> productosBase = productoRepository.findByProductoBaseIdIsNull();
        
        List<Producto> productosFiltrados = productosBase.stream()
                .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
                .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
                .filter(p -> categoriaId.map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId())).orElse(true))
                .filter(p -> q.map(s -> p.getNombre() != null && p.getNombre().toLowerCase().contains(s.toLowerCase())).orElse(true))
                .collect(Collectors.toList());
        
        // Cargar variantes para cada producto base
        return productosFiltrados.stream()
                .map(this::toDTOConVariantes)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodosIncluyendoVariantes(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId, Optional<String> q) {
        // Listar todos los productos incluyendo variantes
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
    public List<ProductoDTO> obtenerVariantes(Long productoBaseId) {
        List<Producto> variantes = productoRepository.findByProductoBaseIdOrderByOrdenVarianteAsc(productoBaseId);
        return variantes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoDTO obtener(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        // Si es un producto base, cargar variantes
        return toDTOConVariantes(p);
    }

    public ProductoDTO crear(ProductoDTO dto) {
        Producto p = new Producto();
        apply(dto, p);
        
        // Generar SKU automáticamente si no se proporciona
        if (p.getSku() == null || p.getSku().trim().isEmpty()) {
            String skuGenerado = generarSkuUnico(p.getNombre());
            p.setSku(skuGenerado);
        }
        
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        ProductoDTO productoDTO = toDTO(guardado);
        
        // Notificar actualización de producto en tiempo real
        if (notificationService != null) {
            notificationService.notificarProductoActualizado(guardado.getId(), productoDTO);
        }
        
        return productoDTO;
    }

    public void eliminar(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        // Borrado lógico
        p.setActivo(false);
        productoRepository.save(p);
        
        // Notificar eliminación (borrado lógico) en tiempo real
        if (notificationService != null) {
            notificationService.notificarProductoActualizado(id, toDTO(p));
        }
    }

    public void eliminarDefinitivamente(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        
        // Validaciones antes de eliminar
        
        // 1. Verificar si tiene ventas asociadas
        boolean tieneVentas = ventaItemRepository.findAll().stream()
                .anyMatch(item -> item.getProducto().getId().equals(id));
        if (tieneVentas) {
            throw new IllegalStateException("No se puede eliminar el producto porque tiene ventas asociadas");
        }
        
        // 2. Verificar si tiene recetas asociadas
        List<Receta> recetas = recetaRepository.findByProductoId(id);
        if (!recetas.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar el producto porque tiene recetas asociadas. Elimine las recetas primero.");
        }
        
        // 3. Si es producto base, verificar que no tenga variantes
        if (p.getProductoBase() == null) {
            List<Producto> variantes = productoRepository.findByProductoBaseIdOrderByOrdenVarianteAsc(id);
            if (!variantes.isEmpty()) {
                throw new IllegalStateException("No se puede eliminar el producto porque tiene variantes asociadas. Elimine las variantes primero.");
            }
        }
        
        // 4. Si es variante, verificar que no esté en uso (ya validado con ventas arriba)
        
        // 5. Eliminar histórico de costos asociado
        List<ProductoCostoHistorico> historicos = costoHistoricoRepository.findByProductoIdOrderByFechaCalculoDesc(id);
        costoHistoricoRepository.deleteAll(historicos);
        
        // Eliminar físicamente
        productoRepository.delete(p);
    }

    public ProductoDTO cambiarEstado(Long id, boolean activo) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        p.setActivo(activo);
        Producto guardado = productoRepository.save(p);
        ProductoDTO dto = toDTO(guardado);
        
        // Notificar cambio de estado en tiempo real
        if (notificationService != null) {
            notificationService.notificarProductoActualizado(id, dto);
        }
        
        return dto;
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

    /**
     * Genera un SKU único basándose en el nombre del producto.
     * Formato: INICIALES-XXX (ej: WAFF-001, TOST-002)
     */
    private String generarSkuUnico(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return "PROD-001";
        }
        
        // Obtener iniciales del nombre (máximo 4 palabras, máximo 4 letras por palabra)
        String[] palabras = nombre.trim().toUpperCase()
                .replaceAll("[^A-Z0-9\\s]", "") // Eliminar caracteres especiales
                .split("\\s+");
        
        StringBuilder iniciales = new StringBuilder();
        int palabrasUsadas = 0;
        for (String palabra : palabras) {
            if (palabrasUsadas >= 4) break; // Máximo 4 palabras
            if (palabra.length() > 0) {
                // Tomar hasta 4 letras de cada palabra
                int letrasATomar = Math.min(palabra.length(), 4);
                iniciales.append(palabra.substring(0, letrasATomar));
                palabrasUsadas++;
            }
        }
        
        // Si no hay iniciales, usar "PROD"
        if (iniciales.length() == 0) {
            iniciales.append("PROD");
        }
        
        // Limitar a máximo 8 caracteres para las iniciales
        String prefijo = iniciales.length() > 8 
                ? iniciales.substring(0, 8) 
                : iniciales.toString();
        
        // Buscar el siguiente número disponible
        int numero = 1;
        String sku;
        do {
            sku = String.format("%s-%03d", prefijo, numero);
            numero++;
            // Evitar bucle infinito (máximo 9999 productos con el mismo prefijo)
            if (numero > 9999) {
                sku = String.format("%s-%d", prefijo, System.currentTimeMillis() % 10000);
                break;
            }
        } while (productoRepository.findBySku(sku).isPresent());
        
        return sku;
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
        
        // Manejar variantes
        if (dto.productoBaseId() != null) {
            Producto productoBase = productoRepository.findById(dto.productoBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto base no encontrado con id: " + dto.productoBaseId()));
            p.setProductoBase(productoBase);
        } else {
            p.setProductoBase(null);
        }
        p.setNombreVariante(dto.nombreVariante());
        p.setOrdenVariante(dto.ordenVariante());
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
                p.getDisponibleEnMenu(),
                p.getProductoBase() != null ? p.getProductoBase().getId() : null,
                p.getNombreVariante(),
                p.getOrdenVariante()
        );
    }
    
    private ProductoDTO toDTOConVariantes(Producto p) {
        // Si es un producto base, cargar sus variantes
        List<ProductoDTO> variantes = null;
        if (p.getProductoBase() == null) {
            List<Producto> variantesProducto = productoRepository.findByProductoBaseIdOrderByOrdenVarianteAsc(p.getId());
            variantes = variantesProducto.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        
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
                p.getDisponibleEnMenu(),
                p.getProductoBase() != null ? p.getProductoBase().getId() : null,
                p.getNombreVariante(),
                p.getOrdenVariante(),
                variantes
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
