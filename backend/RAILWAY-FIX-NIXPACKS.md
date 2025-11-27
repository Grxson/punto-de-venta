# Fix: Railway Build Error - Dockerfile not found

## Problema
Railway está intentando usar Dockerfile pero no lo encuentra:
```
Build Failed: build daemon returned an error < failed to solve: failed to read dockerfile: open backend/Dockerfile: no such file or directory >
```

## Solución

### Opción 1: Usar Nixpacks (Recomendado)

El archivo `railway.toml` ya está configurado para usar Nixpacks. Verifica en Railway Dashboard:

1. Ve a tu servicio del backend
2. Settings → Build
3. Asegúrate de que:
   - **Root Directory**: `backend`
   - **Builder**: `Nixpacks` (NO Dockerfile)

### Opción 2: Si Railway sigue usando Dockerfile

Si Railway sigue intentando usar Dockerfile después de cambiar a Nixpacks:

1. **Opción A**: Elimina temporalmente el Dockerfile
   ```bash
   git mv backend/Dockerfile backend/Dockerfile.backup
   git commit -m "Temporalmente deshabilitar Dockerfile para usar Nixpacks"
   git push
   ```

2. **Opción B**: Fuerza Nixpacks en Railway Dashboard
   - Ve a Settings → Build
   - Cambia manualmente el builder a "Nixpacks"
   - Guarda los cambios

### Verificación

Después de hacer el cambio, el build debería:
1. Detectar `nixpacks.toml`
2. Instalar JDK 21 y Maven
3. Ejecutar `./mvnw clean package`
4. Iniciar con `java -jar target/backend-*.jar`

## Configuración Actual

- ✅ `railway.toml` configurado para Nixpacks
- ✅ `nixpacks.toml` presente y configurado
- ⚠️ Railway puede estar cacheando la configuración anterior

## Próximos Pasos

1. Verifica la configuración en Railway Dashboard
2. Si es necesario, haz un redeploy manual
3. Si el problema persiste, elimina el Dockerfile temporalmente

