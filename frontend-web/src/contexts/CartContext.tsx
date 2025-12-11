import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoriaId: number | null;
  categoriaNombre: string | null;
  activo: boolean;
  productoBaseId?: number | null;
  nombreVariante?: string | null;
  ordenVariante?: number | null;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  // Precio editado solo para esta venta (no persiste en BD)
  overridePrice?: number;
  // ID único para diferenciar combinaciones con ingredientes
  cartItemId?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (producto: Producto) => void;
  removeFromCart: (productoId: number, cartItemId?: string) => void;
  updateQuantity: (productoId: number, cantidad: number, cartItemId?: string) => void;
  updateItemPrice: (productoId: number, precio: number, cartItemId?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

