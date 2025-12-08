import React, { createContext, useState, useCallback, useEffect } from 'react';
import { MenuContextType, ProductoSucursalDTO, CategoriaDTO, CarritoItem } from '../types/menu';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api/axiosInstance';

export const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { sucursal } = useAuth();
  const [productos, setProductos] = useState<ProductoSucursalDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Propiedades derivadas
  const productosAgrupados = new Map<number, ProductoSucursalDTO[]>();
  productos.forEach((prod) => {
    const items = productosAgrupados.get(prod.categoria_id) || [];
    productosAgrupados.set(prod.categoria_id, [...items, prod]);
  });

  const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const cantidadCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const cargarProductos = useCallback(
    async (sucursalId: number) => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<ProductoSucursalDTO[]>(
          `/sucursales/${sucursalId}/productos`
        );
        const productosOrdenados = response.data.sort(
          (a, b) => a.orden_visualizacion - b.orden_visualizacion
        );
        setProductos(productosOrdenados);
        setError(null);
      } catch (err) {
        setError('Error cargando productos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cargarCategorias = useCallback(async () => {
    try {
      const response = await apiClient.get<CategoriaDTO[]>('/categorias');
      const categoriasOrdenadas = response.data.sort((a, b) => a.orden - b.orden);
      setCategorias(categoriasOrdenadas);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  }, []);

  const agregarAlCarrito = useCallback(
    (producto: ProductoSucursalDTO, cantidad: number) => {
      setCarrito((prevCarrito) => {
        const existente = prevCarrito.find((item) => item.producto.id === producto.id);

        if (existente) {
          return prevCarrito.map((item) =>
            item.producto.id === producto.id
              ? {
                  ...item,
                  cantidad: item.cantidad + cantidad,
                  subtotal: (item.cantidad + cantidad) * item.precioUnitario,
                }
              : item
          );
        }

        return [
          ...prevCarrito,
          {
            producto,
            cantidad,
            precioUnitario: producto.precio_sucursal,
            subtotal: cantidad * producto.precio_sucursal,
          },
        ];
      });
    },
    []
  );

  const actualizarCantidad = useCallback((productoId: number, cantidad: number) => {
    setCarrito((prevCarrito) =>
      cantidad <= 0
        ? prevCarrito.filter((item) => item.producto.id !== productoId)
        : prevCarrito.map((item) =>
            item.producto.id === productoId
              ? {
                  ...item,
                  cantidad,
                  subtotal: cantidad * item.precioUnitario,
                }
              : item
          )
    );
  }, []);

  const limpiarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  const buscarProducto = useCallback(
    (texto: string): ProductoSucursalDTO[] => {
      const textoLower = texto.toLowerCase();
      return productos.filter(
        (prod) =>
          prod.nombre.toLowerCase().includes(textoLower) ||
          prod.descripcion?.toLowerCase().includes(textoLower)
      );
    },
    [productos]
  );

  const filtrarPorCategoria = useCallback(
    (categoriaId: number): ProductoSucursalDTO[] => {
      return productos.filter((prod) => prod.categoria_id === categoriaId);
    },
    [productos]
  );

  // Cargar productos cuando cambia la sucursal
  useEffect(() => {
    if (sucursal) {
      cargarProductos(sucursal.id);
      cargarCategorias();
    }
  }, [sucursal, cargarProductos, cargarCategorias]);

  const value: MenuContextType = {
    productos,
    categorias,
    carrito,
    isLoading,
    error,
    productosAgrupados,
    totalCarrito,
    cantidadCarrito,
    cargarProductos,
    cargarCategorias,
    agregarAlCarrito,
    actualizarCantidad,
    limpiarCarrito,
    buscarProducto,
    filtrarPorCategoria,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
