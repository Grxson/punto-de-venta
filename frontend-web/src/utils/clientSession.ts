interface RemovableStorage {
  removeItem: (key: string) => void;
}

interface ClearableStorage {
  clear: () => void;
}

const LOCAL_SESSION_KEYS = [
  'auth_token',
  'auth_usuario',
  'auth_sucursal',
  'pos_selected_category',
  'pos_subcategory_id',
  'cart',
  'cart_items',
] as const;

export const clearClientSession = (
  localStorageRef: RemovableStorage,
  sessionStorageRef: ClearableStorage,
): void => {
  LOCAL_SESSION_KEYS.forEach((key) => localStorageRef.removeItem(key));
  sessionStorageRef.clear();
};
