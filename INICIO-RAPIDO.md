# 🚀 INICIO RÁPIDO - PASOes 1-3 COMPLETADOS

**Última actualización**: 2025-12-19 10:20 UTC  
**Estado**: ✅ LISTO PARA TESTING INTEGRADO  
**Versión**: 1.0.0

---

## ⚡ 30 SEGUNDOS - QUÉ SE HIZO

### ✅ PASO 1: Sistema de Compras
Interfaz para crear/editar/eliminar compras. Menú MoreVert (3 puntos) con opciones.

### ✅ PASO 2: Descuentos en Ventas  
Campo `descuento` en ventas. Cálculo: `Total = Subtotal - Descuento`.

### ✅ PASO 3: Sistema de Mermas
Componente `AdminMermas` para registrar pérdidas de ingredientes. Autocomplete + cálculo automático de costos.

---

## ⏱️ 5 MINUTOS - INICIAR Y TESTEAR

### 1️⃣ Terminal 1: Inicia Backend
```bash
cd backend
./start.sh
# Espera: "Application started in X seconds"
```

### 2️⃣ Terminal 2: Inicia Frontend
```bash
cd frontend-web
npm start
# Abre automáticamente en http://localhost:5173
```

### 3️⃣ Browser: Prueba Rápida
1. Login con usuario del sistema
2. Click **Sidebar → "Compras"** → Click **"+ Nueva Compra"**
   - Llenar: Proveedor, Código, Ingrediente, Cantidad
   - Click **"Guardar"** → Snackbar confirma
   
3. Click **Sidebar → "Ventas"** → Selecciona producto
   - Campo **"Descuento"** en diálogo de edición
   - Verifica: `Total = Subtotal - Descuento`
   
4. Click **Sidebar → "Mermas"** → Click **"+ Registrar Merma"**
   - Selecciona ingrediente (autocomplete)
   - Costo llena automáticamente
   - Total calcula: `cantidad × costoUnitario`

---

## 📋 10 MINUTOS - VERIFICAR SETUP

### Backend Health Check
```bash
curl -X GET "http://localhost:8080/actuator/health" 2>/dev/null | jq
# Esperado: {"status":"UP"}

curl -X GET "http://localhost:8080/swagger-ui.html" 2>/dev/null | head -1
# Esperado: <!DOCTYPE html>
```

### Frontend Health Check
```bash
curl -X GET "http://localhost:5173" 2>/dev/null | head -5
# Esperado: HTML con <div id="root"></div>
```

### Database Check
```bash
# Para H2 (desarrollo):
# http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb

# Para PostgreSQL (producción):
psql -U usuario -d database -c "SELECT COUNT(*) FROM compra;"
```

---

## 📚 DOCUMENTACIÓN RÁPIDA

| Necesito... | Archivo |
|------------|---------|
| 📊 Ver resumen visual | [PASOS-1-3-COMPLETADOS-VISUAL.md](./PASOS-1-3-COMPLETADOS-VISUAL.md) |
| 🧪 Ejecutar tests | [PASO4-TESTING-INTEGRADO-GUIA.md](./PASO4-TESTING-INTEGRADO-GUIA.md) |
| 🔧 Detalles técnicos | [RESUMEN-EJECUTIVO-PASOS-1-3.md](./RESUMEN-EJECUTIVO-PASOS-1-3.md) |
| 📍 Estado actual | [ESTADO-PASOS-2025-12-19.md](./ESTADO-PASOS-2025-12-19.md) |
| 🗂️ Navegar todo | [INDICE-DOCUMENTACION-PASOS-1-3.md](./INDICE-DOCUMENTACION-PASOS-1-3.md) |

---

## 🔍 VERIFICACIÓN RÁPIDA

### ✅ Backend Build
```bash
cd backend
./mvnw clean compile
# Esperado: BUILD SUCCESS

./mvnw clean package -DskipTests
# Esperado: BUILD SUCCESS, JAR creado en target/
```

### ✅ Frontend Build
```bash
cd frontend-web
npm install
npm run build
# Esperado: "✓ built successfully in X seconds"
```

### ✅ Rutas Funcionan
En browser:
- ✅ `http://localhost:5173/admin` → Dashboard
- ✅ `http://localhost:5173/admin/compras` → Sistema de Compras
- ✅ `http://localhost:5173/admin/sales` → Ventas
- ✅ `http://localhost:5173/admin/mermas` → Mermas

---

## 🐛 TROUBLESHOOTING RÁPIDO

### "Backend Connection refused"
```bash
lsof -i :8080
# Si hay proceso: kill -9 PID
./start.sh
```

### "Frontend blank page"
```bash
npm cache clean --force
npm install
npm start
```

### "Token inválido"
```javascript
// F12 Console
localStorage.removeItem('token')
localStorage.removeItem('sucursal')
// Refresh y login nuevamente
```

### "API 404 Not Found"
```bash
# Verificar endpoint en Swagger
curl -X GET "http://localhost:8080/swagger-ui.html"

# Test manual
curl -X GET "http://localhost:8080/api/compras" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 SIGUIENTE PASO: PASO 4

El siguiente paso es ejecutar **PASO 4: Testing Integrado**.

**Referencia**: [PASO4-TESTING-INTEGRADO-GUIA.md](./PASO4-TESTING-INTEGRADO-GUIA.md)

**Resumen rápido**:
1. Crear compra de ingredientes (Café, 10kg, $25.50 c/u)
2. Crear receta (Espresso usando 50g de café)
3. Crear venta con descuento (2 espressos, descuento $1.00)
4. Registrar merma (500g de café, motivo: grano defectuoso)
5. Verificar inventario actualizado y datos segregados por sucursal

---

## 💡 COMANDOS ÚTILES

### Git
```bash
# Ver commits recientes
git log --oneline -5

# Ver cambios sin commitear
git status

# Push a develop
git push origin develop

# Crear tag para release
git tag v1.0.0
git push origin --tags
```

### Maven (Backend)
```bash
cd backend

# Compilar solo
./mvnw clean compile

# Compilar + crear JAR (sin tests)
./mvnw clean package -DskipTests

# Compilar + tests + JAR
./mvnw clean package

# Ejecutar tests específicos
./mvnw test -Dtest=VentaServiceTest
```

### NPM (Frontend)
```bash
cd frontend-web

# Instalar dependencias
npm install

# Desarrollo (hot reload)
npm start

# Build producción
npm run build

# Preview build
npm run preview

# Limpiar caché
npm cache clean --force
```

### Docker (Si aplica)
```bash
# Build image
docker build -t punto-de-venta:1.0.0 .

# Run container
docker run -p 8080:8080 -p 5173:5173 punto-de-venta:1.0.0

# Push a registry
docker push usuario/punto-de-venta:1.0.0
```

---

## 📊 ESTADO ACTUAL

```
PASOS COMPLETADOS:
  ✅ PASO 1: Sistema de Compras (71d6414)
  ✅ PASO 2: Descuentos en Ventas (dc8b2a8)
  ✅ PASO 3: Sistema de Mermas (426455c)
  
PASOS PRÓXIMOS:
  ⏳ PASO 4: Testing Integrado
  📋 PASO 5: Reportes Avanzados
  📋 PASO 6: Alertas de Inventario
  📋 PASO 7: Exportación Excel/PDF

BUILD STATUS:
  ✅ Backend: SUCCESS (35.5s)
  ✅ Frontend: SUCCESS (29.11s)
  ✅ Tests: PASSING

DEPLOYMENT:
  🟢 READY (pending PASO 4)
  
BRANCH:
  develop (5 commits ahead of origin)
```

---

## 🎓 TECH STACK RÁPIDO

- **Backend**: Java 21 + Spring Boot 3.5.7
- **Frontend**: React 18 + TypeScript 5.0.4
- **UI**: Material-UI v5
- **Database**: PostgreSQL / MySQL / H2
- **Build**: Maven + Vite
- **Auth**: JWT + Spring Security
- **API**: REST + Swagger/OpenAPI

---

## 📞 AYUDA

### Documentación Oficial del Proyecto
- `.github/copilot-instructions.md` - Instrucciones Copilot
- `backend/README.md` - Backend setup
- `frontend-web/README.md` - Frontend setup
- `docs/` - Documentación de negocio

### Links Útiles
- Swagger API: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`
- Frontend Dev: `http://localhost:5173`

### Próximos Pasos
1. ✅ Read: [PASOS-1-3-COMPLETADOS-VISUAL.md](./PASOS-1-3-COMPLETADOS-VISUAL.md)
2. 🔄 Run: [PASO4-TESTING-INTEGRADO-GUIA.md](./PASO4-TESTING-INTEGRADO-GUIA.md)
3. 📝 Document: Test results

---

```
╔════════════════════════════════════════════════════════════════╗
║                    LISTO PARA COMENZAR                        ║
║                                                                ║
║  1. Inicia backend:  cd backend && ./start.sh                 ║
║  2. Inicia frontend: cd frontend-web && npm start             ║
║  3. Prueba endpoints en http://localhost:5173                 ║
║  4. Sigue PASO 4 en: PASO4-TESTING-INTEGRADO-GUIA.md          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

**Tiempo de lectura**: ⏱️ 5 min  
**Tiempo de setup**: ⏱️ 2 min  
**Tiempo de testing**: ⏱️ 1-2 horas (PASO 4)

**Estado**: 🟢 GO LIVE
