# 📏 Unidades de Medida Predeterminadas

## Lista de Unidades Disponibles en el Sistema

El sistema incluye 20 unidades de medida predefinidas organizadas por tipo:

### ⚖️ **Unidades de Peso**

| Nombre | Abreviatura | Factor Base | Descripción |
|--------|-------------|-------------|-------------|
| Kilogramo | kg | 1.0 | Unidad estándar de peso |
| Gramo | g | 0.001 | 1/1000 kilogramo |
| Miligramo | mg | 0.000001 | 1/1,000,000 kilogramo |
| Tonelada | tn | 1000.0 | 1000 kilogramos |
| Onza | oz | 0.0283495 | 28.3495 gramos (Imperial) |
| Libra | lb | 0.453592 | 453.592 gramos (Imperial) |

### 📊 **Unidades de Volumen**

| Nombre | Abreviatura | Factor Base | Descripción |
|--------|-------------|-------------|-------------|
| Litro | l | 1.0 | Unidad estándar de volumen |
| Mililitro | ml | 0.001 | 1/1000 litro |
| Taza | tz | 0.236588 | 236.588 mililitros |
| Cucharada | cda | 0.014787 | 14.787 mililitros |
| Cucharadita | cdita | 0.004929 | 4.929 mililitros |
| Galón | gal | 3.78541 | 3785.41 mililitros |

### 📏 **Unidades de Longitud**

| Nombre | Abreviatura | Factor Base | Descripción |
|--------|-------------|-------------|-------------|
| Metro | m | 1.0 | Unidad estándar de longitud |
| Centímetro | cm | 0.01 | 1/100 metro |

### 📦 **Unidades de Cantidad/Envase**

| Nombre | Abreviatura | Factor Base | Descripción |
|--------|-------------|-------------|-------------|
| Unidad | u | 1.0 | Unidad individual |
| Docena | dz | 12.0 | Grupo de 12 unidades |
| Paquete | paq | 1.0 | Paquete o caja genérica |
| Botella | bot | 1.0 | Botella individual |
| Lata | lat | 1.0 | Lata individual |
| Caja | caja | 1.0 | Caja de producto |

## 🔧 Cómo usar las unidades

### En el Panel de Ingredientes:

1. Accede a **Menú → Ingredientes**
2. Haz clic en **"Nuevo Ingrediente"**
3. En el campo **"Unidad de Medida"**, selecciona la unidad deseada:
   - Para **harina**: selecciona "Kilogramo" (kg)
   - Para **leche**: selecciona "Litro" (l)
   - Para **huevos**: selecciona "Unidad" (u)
   - Para **mantequilla**: selecciona "Gramo" (g)

### En el Panel de Recetas:

Al agregar ingredientes a una receta, la unidad se carga automáticamente desde el ingrediente configurado.

## 📋 Factor Base

El **factor base** se utiliza para conversiones entre unidades:
- **1.0**: Es la unidad base (kg para peso, l para volumen)
- **0.001**: Divide por 1000 (conversión de g a kg)
- **1000.0**: Multiplica por 1000 (conversión de kg a tn)

Ejemplo:
- 1 kg = 1000 g (factor 0.001 → 1 ÷ 0.001 = 1000)
- 1 tn = 1000 kg (factor 1000.0)

## ✨ Características

✅ 20 unidades predefinidas  
✅ Soporta conversiones decimales (factor_base)  
✅ Unidades métricas e imperiales  
✅ Descripción detallada de cada unidad  
✅ Facilita cálculos automáticos de costos  

## 🔄 Agregar nuevas unidades

Si necesitas agregar una unidad personalizada:

```sql
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
VALUES ('Nombre', 'abr', 1.0, 'Descripción');
```

Ejemplo:
```sql
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
VALUES ('Metro Cuadrado', 'm²', 1.0, 'Unidad de área');
```
