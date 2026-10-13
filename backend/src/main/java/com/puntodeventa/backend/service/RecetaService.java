package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.RecetaDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.IngredienteRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.RecetaRepository;
import com.puntodeventa.backend.repository.UnidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Servicio de gestión de recetas (BOM, por sus siglas en inglés Bill of Materials).
 * Una receta indica qué ingrediente y en qué cantidad consume un producto, y es la
 * base del descuento automático de inventario al vender y del cálculo de costo estándar.
 * <p>
 * La identidad de una receta es compuesta (producto, ingrediente), de modo que no
 * existe un identificador propio que el cliente pueda usar.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecetaService {

    private final RecetaRepository recetaRepository;
    private final ProductoRepository productoRepository;
    private final IngredienteRepository ingredienteRepository;
    private final UnidadRepository unidadRepository;
    private final InventarioMapper mapper;

    /**
     * Lista todas las recetas del catálogo.
     *
     * @return Lista de DTO con todas las recetas.
     */
    public List<RecetaDTO> obtenerTodas() {
        return recetaRepository.findAll().stream()
                .map(mapper::toRecetaDTO)
                .toList();
    }

    /**
     * Obtiene la receta de un producto, con ingrediente y unidad cargados.
     *
     * @param productoId Identificador del producto.
     * @return Lista de DTO con los ingredientes que consume el producto.
     */
    @Cacheable(value = "recetas", key = "'producto-' + #productoId")
    public List<RecetaDTO> obtenerPorProducto(Long productoId) {
        return recetaRepository.findByProductoIdWithDetails(productoId).stream()
                .map(mapper::toRecetaDTO)
                .toList();
    }

    /**
     * Obtiene las recetas en las que participa un ingrediente.
     *
     * @param ingredienteId Identificador del ingrediente.
     * @return Lista de DTO con los productos que consumen ese ingrediente.
     */
    @Cacheable(value = "recetas", key = "'ingrediente-' + #ingredienteId")
    public List<RecetaDTO> obtenerPorIngrediente(Long ingredienteId) {
        return recetaRepository.findByIngredienteId(ingredienteId).stream()
                .map(mapper::toRecetaDTO)
                .toList();
    }

    /**
     * Crea la receta de un producto para un ingrediente.
     *
     * @param dto Datos de la receta, con producto, ingrediente, cantidad, unidad y merma.
     * @return DTO de la receta creada.
     * @throws ResourceNotFoundException si el producto, el ingrediente o la unidad no existen.
     */
    @CacheEvict(value = "recetas", allEntries = true)
    @Transactional
    public RecetaDTO crear(RecetaDTO dto) {
        // Se validan las tres referencias para que la receta nunca quede apuntando
        // a un producto, ingrediente o unidad borrados en cascada.
        Producto producto = productoRepository.findById(dto.productoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + dto.productoId()));

        Ingrediente ingrediente = ingredienteRepository.findById(dto.ingredienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ingrediente no encontrado con id: " + dto.ingredienteId()));

        Unidad unidad = unidadRepository.findById(dto.unidadId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + dto.unidadId()));

        Receta receta = Receta.builder()
                .productoId(dto.productoId())
                .producto(producto)
                .ingredienteId(dto.ingredienteId())
                .ingrediente(ingrediente)
                .cantidad(dto.cantidad())
                .unidad(unidad)
                .mermaTeorica(dto.mermaTeorica() != null ? dto.mermaTeorica() : BigDecimal.ZERO)
                .build();

        receta = recetaRepository.save(receta);
        return mapper.toRecetaDTO(receta);
    }

    /**
     * Actualiza la receta existente de un producto para un ingrediente.
     * Producto e ingrediente no se modifican: son la clave compuesta del registro.
     *
     * @param productoId   Identificador del producto de la receta.
     * @param ingredienteId Identificador del ingrediente de la receta.
     * @param dto          Datos a aplicar: cantidad, unidad y merma.
     * @return DTO de la receta actualizada.
     * @throws ResourceNotFoundException si la receta no existe o la unidad no existe.
     */
    @CacheEvict(value = "recetas", allEntries = true)
    @Transactional
    public RecetaDTO actualizar(Long productoId, Long ingredienteId, RecetaDTO dto) {
        RecetaId recetaId = new RecetaId(productoId, ingredienteId);
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receta no encontrada para producto: " + productoId + " e ingrediente: " + ingredienteId));

        Unidad unidad = unidadRepository.findById(dto.unidadId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + dto.unidadId()));

        receta.setCantidad(dto.cantidad());
        receta.setUnidad(unidad);
        receta.setMermaTeorica(dto.mermaTeorica() != null ? dto.mermaTeorica() : BigDecimal.ZERO);

        receta = recetaRepository.save(receta);
        return mapper.toRecetaDTO(receta);
    }

    /**
     * Elimina la receta de un producto para un ingrediente.
     *
     * @param productoId    Identificador del producto de la receta.
     * @param ingredienteId Identificador del ingrediente de la receta.
     * @throws ResourceNotFoundException si la receta no existe.
     */
    @CacheEvict(value = "recetas", allEntries = true)
    @Transactional
    public void eliminar(Long productoId, Long ingredienteId) {
        RecetaId recetaId = new RecetaId(productoId, ingredienteId);
        if (!recetaRepository.existsById(recetaId)) {
            throw new ResourceNotFoundException(
                    "Receta no encontrada para producto: " + productoId + " e ingrediente: " + ingredienteId);
        }
        recetaRepository.deleteById(recetaId);
    }

    /**
     * Elimina todas las recetas de un producto.
     * Se usa al cambiar por completo la composición de un producto.
     *
     * @param productoId Identificador del producto cuyas recetas se borran.
     */
    @CacheEvict(value = "recetas", allEntries = true)
    @Transactional
    public void eliminarRecetasDeProducto(Long productoId) {
        List<Receta> recetas = recetaRepository.findByProductoId(productoId);
        recetaRepository.deleteAll(recetas);
    }

    /**
     * Calcula el costo estándar de un producto sumando el de cada ingrediente de
     * su receta.
     *
     * @param productoId Identificador del producto.
     * @return Costo estándar del producto, o cero si no tiene receta definida.
     */
    public BigDecimal calcularCostoReceta(Long productoId) {
        List<Receta> recetas = recetaRepository.findByProductoIdWithDetails(productoId);

        if (recetas.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return recetas.stream()
                .map(this::calcularCostoIngrediente)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calcula el costo de un ingrediente dentro de una receta.
     * <p>
     * La receta declara la cantidad útil, así que para obtener esa cantidad hay
     * que consumir más: {@code cantidad_real = cantidad / (1 - merma)}. El
     * descuento se aplica sobre la cantidad ya ajustada por merma y no sobre el
     * costo, para no arrastrar dos veces el mismo concepto.
     *
     * @param receta Receta del producto a costear.
     * @return Costo del ingrediente para una unidad del producto.
     */
    private BigDecimal calcularCostoIngrediente(Receta receta) {
        BigDecimal cantidad = receta.getCantidad();
        BigDecimal mermaTeorica = receta.getMermaTeorica();
        BigDecimal costoUnitario = receta.getIngrediente().getCostoUnitarioBase();

        // Una merma de 100% anularía el divisor, así que en ese caso se consume
        // exactamente la cantidad de la receta en lugar de dividir.
        BigDecimal cantidadReal = mermaTeorica.compareTo(BigDecimal.ONE) < 0
                ? cantidad.divide(BigDecimal.ONE.subtract(mermaTeorica), 6, BigDecimal.ROUND_HALF_UP)
                : cantidad;

        // el costo del ingrediente está expresado en su unidad base
        BigDecimal factorConversion = receta.getUnidad().getFactorBase();
        BigDecimal cantidadEnUnidadBase = cantidadReal.multiply(factorConversion);

        return cantidadEnUnidadBase.multiply(costoUnitario);
    }
}
