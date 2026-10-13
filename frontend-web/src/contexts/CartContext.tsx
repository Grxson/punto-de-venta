import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Producto que puede agregarse al carrito (incluye datos de variante).
 */
interface Producto {
  /** Identificador del producto o de su variante. */
  id: number;
  /** Nombre completo del producto. */
  nombre: string;
  /** Precio de venta base. */
  precio: number;
  /** Categoría del producto, o `null` si no tiene. */
  categoriaId: number | null;
  /** Nombre de la categoría, o `null` si no tiene. */
  categoriaNombre: string | null;
  /** Indica si el producto está activo. */
  activo: boolean;
  /** Id del producto base cuando la entrada es una variante. */
  productoBaseId?: number | null;
  /** Nombre de la variante, cuando aplica. */
  nombreVariante?: string | null;
  /** Orden de la variante dentro de su producto base. */
  ordenVariante?: number | null;
}

/**
 * Línea del carrito.
 */
interface CartItem {
  /** Producto agregado. */
  producto: Producto;
  /** Cantidad de unidades agregada. */
  cantidad: number;
  /** Precio editado por el cajero que sustituye al del producto solo en esta venta (no se persiste en la base de datos). */
  overridePrice?: number;
  /** Clave única de la línea, necesaria para distinguir combinaciones con ingredientes. */
  cartItemId?: string;
}

/**
 * Estado global del carrito de venta.
 */
interface CartContextType {
  /** Líneas actuales del carrito. */
  cart: CartItem[];
  /** Agrega una unidad del producto y lo sube al inicio de la lista; si ya existe, suma la cantidad. */
  addToCart: (producto: Producto) => void;
  /** Elimina la línea identificada por `cartItemId` o, en su defecto, por `productoId`. */
  removeFromCart: (productoId: number, cartItemId?: string) => void;
  /** Fija la cantidad de la línea; si la cantidad es 0 o menor, la elimina. */
  updateQuantity: (productoId: number, cantidad: number, cartItemId?: string) => void;
  /** Sobrescribe el precio de la línea para esta venta; un valor no numérico o negativo se descarta. */
  updateItemPrice: (productoId: number, precio: number, cartItemId?: string) => void;
  /** Vacía el carrito y borra su persistencia en `localStorage`. */
  clearCart: () => void;
  /** Suma de todas las líneas, usando `overridePrice` cuando exista. */
  total: number;
  /** Número total de unidades en el carrito. */
  itemCount: number;
}

/**
 * Contexto del carrito. Se crea como `undefined` para detectar usos fuera del proveedor.
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Proveedor del carrito: mantiene las líneas en estado y las persiste en `localStorage`
 * para que la venta en curso sobreviva a una recarga de la página.
 *
 * @param props.children - Árbol de componentes que recibe el contexto.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto: Producto) => {
    setCart((prevCart) => {
      // Usar cartItemId si existe (para productos con ingredientes), si no usar ID del producto
      const cartItemId = (producto as any).cartItemId || String(producto.id);
      const itemExistente = prevCart.find((item) => (item.cartItemId || String(item.producto.id)) === cartItemId);
      
      if (itemExistente) {
        // Si el producto ya existe, muévelo al principio e incrementa cantidad
        const updatedCart = prevCart
          .filter((item) => (item.cartItemId || String(item.producto.id)) !== cartItemId)
          .map((item) => item);
        
        // Crear el item actualizado y ponerlo al principio
        const updatedItem = {
          producto,
          cantidad: itemExistente.cantidad + 1,
          overridePrice: itemExistente.overridePrice,
          cartItemId: (producto as any).cartItemId,
        };
        return [updatedItem, ...updatedCart];
      } else {
        // Nuevo producto: agregarlo al principio
        return [{ producto, cantidad: 1, cartItemId: (producto as any).cartItemId }, ...prevCart];
      }
    });
  };

  const removeFromCart = (productoId: number, cartItemId?: string) => {
    setCart((prevCart) => {
      if (cartItemId) {
        // Si hay cartItemId, usarlo para identificar el item
        return prevCart.filter((item) => item.cartItemId !== cartItemId);
      } else {
        // Si no hay cartItemId, usar el ID del producto (para compatibilidad)
        return prevCart.filter((item) => item.producto.id !== productoId);
      }
    });
  };

  const updateQuantity = (productoId: number, cantidad: number, cartItemId?: string) => {
    if (cantidad <= 0) {
      removeFromCart(productoId, cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId = item.cartItemId || String(item.producto.id);
        const targetId = cartItemId || String(productoId);
        return itemId === targetId ? { ...item, cantidad } : item;
      })
    );
  };

  // Actualiza el precio del ítem solo para esta venta
  const updateItemPrice = (productoId: number, precio: number, cartItemId?: string) => {
    const normalized = Number.isFinite(precio) && precio >= 0 ? Number(precio) : undefined;
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId = item.cartItemId || String(item.producto.id);
        const targetId = cartItemId || String(productoId);
        return itemId === targetId ? { ...item, overridePrice: normalized } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce(
    (sum, item) => {
      const unitPrice = item.overridePrice ?? item.producto.precio;
      return sum + unitPrice * item.cantidad;
    },
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemPrice,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook de acceso al contexto del carrito.
 *
 * @returns Las líneas del carrito, sus acciones de edición y los totales calculados.
 * @throws Error Si se usa fuera de {@link CartProvider}.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

