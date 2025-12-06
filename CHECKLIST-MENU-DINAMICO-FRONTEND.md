# ✅ Checklist: Implementar Menú Dinámico en Frontend

## Fase 1: Autenticación y Contexto (5 tareas)

### [ ] 1. Guardar token y sucursal al login
**Archivo:** `frontend/src/screens/LoginScreen.tsx` o similar

```typescript
// Al obtener respuesta del login:
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();

// Guardar token
await AsyncStorage.setItem('authToken', data.token);

// Guardar sucursal actual
await AsyncStorage.setItem('sucursalActual', JSON.stringify(data.usuario.sucursal));

// Guardar rol (para admin)
await AsyncStorage.setItem('rol', data.usuario.rol);

// Actualizar estado
setAuth({
  token: data.token,
  usuario: data.usuario,
  sucursal: data.usuario.sucursal
});
```

**Checklist:**
- [ ] Token se guarda en AsyncStorage
- [ ] Sucursal se guarda en AsyncStorage
- [ ] Rol se guarda en AsyncStorage
- [ ] Estado global se actualiza
- [ ] Verificado con console.log

---

### [ ] 2. Recuperar token al abrir la app
**Archivo:** `frontend/src/App.tsx` o `useAuth()` hook

```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const sucursal = await AsyncStorage.getItem('sucursalActual');
      const rol = await AsyncStorage.getItem('rol');
      
      if (token) {
        setAuth({
          token,
          sucursal: JSON.parse(sucursal),
          rol
        });
      } else {
        // Navegar a Login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error recuperando auth:', error);
    }
  };
  
  checkAuth();
}, []);
```

**Checklist:**
- [ ] Token se recupera de AsyncStorage
- [ ] Usuario autenticado no ve pantalla de login
- [ ] Usuario sin token ve pantalla de login
- [ ] Verificado al reabrir app

---

### [ ] 3. Crear un hook personalizado para API
**Archivo:** `frontend/src/hooks/useApi.ts`

```typescript
export const useApi = () => {
  const { auth } = useContext(AuthContext);
  
  const request = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`
    };
    
    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };
    
    const response = await fetch(
      `http://localhost:8080/api${endpoint}`,
      options
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  };
  
  return { request };
};
```

**Checklist:**
- [ ] Hook creado
- [ ] Incluye Authorization header automáticamente
- [ ] Maneja errores
- [ ] Retorna JSON parseado

---

### [ ] 4. Crear contexto global para el menú
**Archivo:** `frontend/src/context/MenuContext.tsx`

```typescript
interface MenuContextType {
  productos: ProductoSucursalDTO[];
  cargando: boolean;
  error: string | null;
  cargarMenu: () => Promise<void>;
}

export const MenuContext = createContext<MenuContextType>(null!);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<ProductoSucursalDTO[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { request } = useApi();
  
  const cargarMenu = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await request('GET', '/sucursales/productos');
      setProductos(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando menú:', err);
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    cargarMenu();
  }, []); // Cargar al iniciar
  
  return (
    <MenuContext.Provider value={{ productos, cargando, error, cargarMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
```

**Checklist:**
- [ ] Contexto creado
- [ ] Provider envuelve la app en App.tsx
- [ ] Menú se carga automáticamente al iniciar
- [ ] Estados de cargando y error manejados

---

### [ ] 5. Envolver App con contextos
**Archivo:** `frontend/src/App.tsx`

```typescript
export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {/* Tu estructura de navegación */}
          </Stack.Navigator>
        </NavigationContainer>
      </MenuProvider>
    </AuthProvider>
  );
}
```

**Checklist:**
- [ ] AuthProvider envuelve todo
- [ ] MenuProvider dentro de AuthProvider
- [ ] No hay errores de contexto indefinido

---

## Fase 2: Procesamiento de Menú (4 tareas)

### [ ] 6. Crear hook para agrupar y ordenar
**Archivo:** `frontend/src/hooks/useMenuAgrupado.ts`

```typescript
interface ProductoAgrupado {
  [categoria: string]: ProductoSucursalDTO[];
}

export const useMenuAgrupado = (productos: ProductoSucursalDTO[]) => {
  return useMemo(() => {
    // Agrupar por categoría
    const agrupado = productos.reduce<ProductoAgrupado>((acc, prod) => {
      const categoria = prod.categoriaProducto || 'Sin categoría';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(prod);
      return acc;
    }, {});
    
    // Ordenar dentro de cada categoría
    Object.keys(agrupado).forEach(categoria => {
      agrupado[categoria].sort((a, b) => 
        (a.ordenVisualizacion ?? 999) - (b.ordenVisualizacion ?? 999)
      );
    });
    
    // Ordenar las categorías alfabéticamente
    const categoriasOrdenadas = Object.keys(agrupado).sort();
    
    return categoriasOrdenadas.map(cat => ({
      categoria: cat,
      productos: agrupado[cat]
    }));
  }, [productos]);
};
```

**Checklist:**
- [ ] Hook creado
- [ ] Agrupa por categoría
- [ ] Ordena por `ordenVisualizacion`
- [ ] Retorna array ordenado

---

### [ ] 7. Crear hook para filtrar por disponibilidad horaria
**Archivo:** `frontend/src/hooks/useProductoDisponible.ts`

```typescript
export const useProductoDisponible = () => {
  const esDisponibleAhora = useCallback((producto: ProductoSucursalDTO): boolean => {
    // Si no está disponible en sucursal, siempre no mostrar
    if (!producto.disponible) return false;
    
    // Si no tiene restricciones, está disponible
    if (!producto.horarioDisponibilidad && !producto.diasDisponibilidad) {
      return true;
    }
    
    const ahora = new Date();
    
    // Verificar horario
    if (producto.horarioDisponibilidad) {
      try {
        const { inicio, fin } = JSON.parse(producto.horarioDisponibilidad);
        const [hI, mI] = inicio.split(':').map(Number);
        const [hF, mF] = fin.split(':').map(Number);
        
        const minActual = ahora.getHours() * 60 + ahora.getMinutes();
        const minInicio = hI * 60 + mI;
        const minFin = hF * 60 + mF;
        
        if (minActual < minInicio || minActual > minFin) {
          return false;
        }
      } catch (e) {
        console.warn('Error parseando horario:', e);
      }
    }
    
    // Verificar día de la semana
    if (producto.diasDisponibilidad) {
      try {
        const { dias } = JSON.parse(producto.diasDisponibilidad);
        // JS: 0=domingo, 1=lunes, ...
        // SQL: 1=lunes, ..., 7=domingo
        const diaJS = ahora.getDay();
        const diaSql = diaJS === 0 ? 7 : diaJS;
        
        if (!dias.includes(diaSql)) {
          return false;
        }
      } catch (e) {
        console.warn('Error parseando días:', e);
      }
    }
    
    return true;
  }, []);
  
  return { esDisponibleAhora };
};
```

**Checklist:**
- [ ] Hook creado
- [ ] Valida horarios correctamente
- [ ] Valida días correctamente
- [ ] Maneja JSON inválido sin crashear

---

### [ ] 8. Crear componente de Producto
**Archivo:** `frontend/src/components/ProductoItem.tsx`

```typescript
interface ProductoItemProps {
  producto: ProductoSucursalDTO;
  onSelect: (producto: ProductoSucursalDTO) => void;
  disponibleAhora?: boolean;
}

export const ProductoItem: React.FC<ProductoItemProps> = ({
  producto,
  onSelect,
  disponibleAhora = true
}) => {
  const precio = producto.precioSucursal ?? producto.precioBase;
  
  return (
    <TouchableOpacity
      onPress={() => disponibleAhora && onSelect(producto)}
      style={[
        styles.container,
        !disponibleAhora && styles.deshabilitado
      ]}
      disabled={!disponibleAhora}
    >
      <View style={styles.header}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.precio}>${precio.toFixed(2)}</Text>
      </View>
      
      {producto.descripcion && (
        <Text style={styles.descripcion}>{producto.descripcion}</Text>
      )}
      
      {!disponibleAhora && (
        <Text style={styles.noDisponible}>No disponible en este horario</Text>
      )}
      
      {producto.notas && (
        <Text style={styles.notas}>{producto.notas}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b'
  },
  deshabilitado: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  descripcion: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  noDisponible: {
    fontSize: 12,
    color: '#ff6b6b',
    fontStyle: 'italic',
    marginTop: 4
  },
  notas: {
    fontSize: 11,
    color: '#999',
    marginTop: 4
  }
});
```

**Checklist:**
- [ ] Componente creado
- [ ] Muestra nombre, precio, descripción
- [ ] Muestra visual de no disponible
- [ ] Muestra notas especiales

---

### [ ] 9. Crear pantalla de Menú
**Archivo:** `frontend/src/screens/MenuScreen.tsx`

```typescript
import { useContext } from 'react';
import { MenuContext } from '../context/MenuContext';
import { useMenuAgrupado } from '../hooks/useMenuAgrupado';
import { useProductoDisponible } from '../hooks/useProductoDisponible';
import { ProductoItem } from '../components/ProductoItem';

export const MenuScreen: React.FC = () => {
  const { productos, cargando, error, cargarMenu } = useContext(MenuContext);
  const menuAgrupado = useMenuAgrupado(productos);
  const { esDisponibleAhora } = useProductoDisponible();
  
  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text>Cargando menú...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
        <TouchableOpacity onPress={cargarMenu} style={styles.boton}>
          <Text style={styles.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <FlatList
      data={menuAgrupado}
      keyExtractor={(item) => item.categoria}
      renderItem={({ item }) => (
        <View>
          <Text style={styles.categoriaHeader}>{item.categoria}</Text>
          {item.productos.map(producto => (
            <ProductoItem
              key={producto.id}
              producto={producto}
              onSelect={(p) => console.log('Seleccionado:', p)}
              disponibleAhora={esDisponibleAhora(producto)}
            />
          ))}
        </View>
      )}
      refreshing={cargando}
      onRefresh={cargarMenu}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoriaHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 12
  },
  boton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold'
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8
  }
});
```

**Checklist:**
- [ ] Pantalla renderiza menú
- [ ] Agrupa por categoría
- [ ] Ordena por `ordenVisualizacion`
- [ ] Muestra estado cargando
- [ ] Maneja errores
- [ ] Pull-to-refresh funciona

---

## Fase 3: Funcionalidad Admin (2 tareas)

### [ ] 10. Crear selector de sucursal (Admin)
**Archivo:** `frontend/src/components/SelectorSucursal.tsx`

```typescript
interface SelectorSucursalProps {
  sucursalActual: any;
  esAdmin: boolean;
}

export const SelectorSucursal: React.FC<SelectorSucursalProps> = ({
  sucursalActual,
  esAdmin
}) => {
  const [sucursales, setSucursales] = useState([]);
  const [mostrandoModal, setMostrandoModal] = useState(false);
  const { request } = useApi();
  const { cargarMenu } = useContext(MenuContext);
  
  useEffect(() => {
    if (esAdmin) {
      cargarSucursales();
    }
  }, [esAdmin]);
  
  const cargarSucursales = async () => {
    try {
      const data = await request('GET', '/sucursales');
      setSucursales(data);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
    }
  };
  
  const cambiarSucursal = async (sucursalId: number) => {
    try {
      // Opcionalmente guardar en contexto
      await AsyncStorage.setItem('sucursalVisualizacion', sucursalId.toString());
      
      // Recargar menú para la nueva sucursal
      await cargarMenu();
      
      setMostrandoModal(false);
    } catch (error) {
      console.error('Error cambiando sucursal:', error);
    }
  };
  
  if (!esAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.sucursal}>{sucursalActual.nombre}</Text>
      </View>
    );
  }
  
  return (
    <>
      <TouchableOpacity
        style={styles.botonSucursal}
        onPress={() => setMostrandoModal(true)}
      >
        <Text style={styles.sucursal}>{sucursalActual.nombre}</Text>
        <Text style={styles.icono}>⌄</Text>
      </TouchableOpacity>
      
      <Modal visible={mostrandoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar sucursal</Text>
            {sucursales.map(sucursal => (
              <TouchableOpacity
                key={sucursal.id}
                style={styles.opcion}
                onPress={() => cambiarSucursal(sucursal.id)}
              >
                <Text style={styles.opcionText}>{sucursal.nombre}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.opcion, styles.opcionCerrar]}
              onPress={() => setMostrandoModal(false)}
            >
              <Text style={[styles.opcionText, styles.cerrar]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  botonSucursal: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sucursal: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  icono: {
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  opcion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  opcionText: {
    fontSize: 16
  },
  opcionCerrar: {
    backgroundColor: '#f5f5f5'
  },
  cerrar: {
    color: '#666'
  }
});
```

**Checklist:**
- [ ] Selector solo muestra para admin
- [ ] Lista de sucursales funciona
- [ ] Cambiar sucursal recarga menú
- [ ] Modal tiene UX amigable

---

### [ ] 11. Integrar selector en HeaderBar
**Archivo:** `frontend/src/components/HeaderBar.tsx`

```typescript
import { SelectorSucursal } from './SelectorSucursal';

export const HeaderBar: React.FC = () => {
  const { auth } = useContext(AuthContext);
  
  return (
    <View style={styles.header}>
      <Text style={styles.titulo}>POS - Punto de Venta</Text>
      <SelectorSucursal
        sucursalActual={auth.sucursal}
        esAdmin={auth.rol === 'ADMIN' || auth.rol === 'GERENTE'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 8,
    paddingLeft: 16
  }
});
```

**Checklist:**
- [ ] HeaderBar muestra selector
- [ ] Se actualiza correctamente

---

## Fase 4: Testing (3 tareas)

### [ ] 12. Verificar menú con console.log
**Pasos:**
1. Abrir app
2. Abrir Developer Tools (React Native Debugger)
3. Verificar logs:
   ```
   ✓ Token guardado
   ✓ Sucursal guardada
   ✓ Menú cargado con X productos
   ✓ Productos agrupados correctamente
   ```

**Checklist:**
- [ ] Token en console
- [ ] Sucursal en console
- [ ] Menú en console
- [ ] No hay errores de red

---

### [ ] 13. Probar menú con Swagger
**Pasos:**
1. Abrir `http://localhost:8080/swagger-ui.html`
2. Expandir `SucursalController`
3. Click en `GET /api/sucursales/productos`
4. Click en "Try it out"
5. Copiar respuesta JSON

**Checklist:**
- [ ] Retorna array de productos
- [ ] Cada producto tiene `ordenVisualizacion`
- [ ] Precios son correctos
- [ ] Campos de disponibilidad llenos

---

### [ ] 14. Prueba manual en app
**Pasos:**
1. Login con usuario sucursal 1
2. Verificar productos mostrados
3. Verificar orden correcto
4. Logout y login con usuario sucursal 2
5. Verificar productos diferentes
6. Si es admin: cambiar sucursal y verificar

**Checklist:**
- [ ] Sucursal 1 ve productos correctos
- [ ] Sucursal 2 ve productos diferentes
- [ ] Orden es correcto
- [ ] Admin puede cambiar entre sucursales
- [ ] Sin errores en console

---

## Resumen de Avance

| Fase | Tarea | Estado |
|------|-------|--------|
| 1 | Guardar token al login | ❌ |
| 1 | Recuperar token al abrir | ❌ |
| 1 | Hook useApi | ❌ |
| 1 | MenuContext | ❌ |
| 1 | Envolver App | ❌ |
| 2 | Hook useMenuAgrupado | ❌ |
| 2 | Hook useProductoDisponible | ❌ |
| 2 | ProductoItem component | ❌ |
| 2 | MenuScreen | ❌ |
| 3 | SelectorSucursal | ❌ |
| 3 | Integrar en HeaderBar | ❌ |
| 4 | Verificar con console | ❌ |
| 4 | Probar con Swagger | ❌ |
| 4 | Prueba manual | ❌ |

**Total:** 14 tareas = ~1-2 días de trabajo (dependiendo de experiencia)
