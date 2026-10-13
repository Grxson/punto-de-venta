/** Almacenamiento del que solo se necesita poder borrar claves. */
interface RemovableStorage {
  removeItem: (key: string) => void;
}

/** Almacenamiento del que solo se necesita poder vaciarse por completo. */
interface ClearableStorage {
  clear: () => void;
}

/**
 * Claves de `localStorage` que pertenecen a la sesión del cajero.
 *
 * Se listan de forma explícita en lugar de recorrer el almacén porque el
 * borrado debe ser quirúrgico: el POS guarda ahí preferencias y filtros que
 * sobreviven a un cierre de sesión.
 */
const LOCAL_SESSION_KEYS = [
  'auth_token',
  'auth_usuario',
  'auth_sucursal',
  'pos_selected_category',
  'pos_subcategory_id',
  'cart',
  'cart_items',
] as const;

/**
 * Elimina los datos de sesión del cliente.
 *
 * Regla de negocio: al cerrar sesión o ante un 401 se borra el token, el
 * usuario, la sucursal activa y el carrito en curso, porque ninguno puede
 * quedar asociado a una identidad que ya no está autenticada.
 *
 * `sessionStorage` se vacía entero porque es de vida corta y no contiene
 * nada que deba sobrevivir al cierre.
 *
 * @param localStorageRef - Almacenamiento del que quitar las claves de sesión.
 * @param sessionStorageRef - Almacenamiento que se vacía por completo.
 */
export const clearClientSession = (
  localStorageRef: RemovableStorage,
  sessionStorageRef: ClearableStorage,
): void => {
  LOCAL_SESSION_KEYS.forEach((key) => localStorageRef.removeItem(key));
  sessionStorageRef.clear();
};
