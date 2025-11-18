
# Instrucciones Copilot para punto-de-venta

## Descripción general del proyecto
Este repositorio documenta la arquitectura, los flujos de trabajo y los modelos de datos para un sistema de punto de venta (POS). El código está orientado principalmente a la documentación, con la lógica de negocio, flujos de datos y procedimientos operativos descritos en archivos markdown dentro del directorio `docs/`.

## Directorios y archivos clave
- `docs/flujo-interno.md`: Flujo interno principal del sistema POS.
- `docs/admin/`: Documentación administrativa, incluyendo:
  - `vision.md`: Visión y alcance del proyecto.
  - `inventario.md`: Inventario, recetas y gestión de mermas.
  - `finanzas.md`: Operaciones financieras (ingresos, gastos, caja).
  - `reportes.md`: Reportes y analítica.
  - `seguridad.md`: Seguridad y roles.
  - `operacion.md`: Operación diaria.
- `docs/datos/`: Arquitectura de datos y reportes:
  - `modelo-datos.md`: Propuesta de modelo de datos.
  - `especificacion-bd.md`: Especificación de la base de datos (tablas, índices, vistas).
  - `escalabilidad.md`: Consideraciones de escalabilidad de datos.
  - `reportes-sql.md`: Consultas SQL para KPIs y reportes.
- `docs/diagramas/`: Diagramas visuales de flujos para diferentes productos/servicios (por ejemplo, `flujo-pago.md`, `flujo-pedido.md`).

## Arquitectura y patrones
- El sistema está diseñado con una clara separación de responsabilidades: administración, datos y flujos operativos se documentan de forma independiente.
- Los modelos de datos y especificaciones de la base de datos están centralizados en `docs/datos/`.
- La lógica de negocio y los procesos se describen en markdown, no en código; los agentes AI deben consultar estos archivos para requisitos y lógica.
- Los diagramas en `docs/diagramas/` ilustran los flujos de extremo a extremo para productos/servicios específicos.

## Flujos de trabajo para desarrolladores
- No existe automatización de builds o tests; toda la lógica está documentada para futura implementación.
- Al generar código, siempre consulta los archivos de documentación relevantes para requisitos, estructuras de datos y pasos de proceso.
- Usa español para la documentación y comentarios en el código, siguiendo la convención del proyecto.

## Integración y dependencias
- No hay dependencias externas ni integraciones definidas aún en el código.
- Toda la comunicación entre componentes y puntos de integración se describe en los archivos de documentación.

## Ejemplos y convenciones
- Para lógica de inventario, consulta `docs/admin/inventario.md` y `docs/datos/modelo-datos.md`.
- Para reportes, utiliza las consultas SQL en `docs/datos/reportes-sql.md` como referencia.
- Para seguridad y roles, sigue las directrices en `docs/admin/seguridad.md`.

## Guía práctica
- Antes de implementar cualquier funcionalidad, lee la documentación relevante en `docs/`.
- Documenta nueva lógica o flujos en español y colócalos en el subdirectorio correspondiente.
- Si tienes dudas, pide aclaraciones sobre reglas de negocio o flujos de datos según lo descrito en los archivos markdown.

## Buenas prácticas y convenciones de desarrollo
- Genera código limpio, legible y autoexplicativo.
- Evita duplicación de código; sugiere refactorizaciones cuando sean claras.
- Utiliza nombres descriptivos en variables, funciones y componentes.
- Prioriza la separación de responsabilidades: UI, lógica, datos.
- Usa principios SOLID y patrones de diseño cuando sea apropiado.
- Incluye documentación en funciones y clases (comentarios en español).
- Sugiere tests unitarios y de integración para cada pieza de lógica importante.
- Mantén consistencia en nombres, rutas, controladores y modelos.
- Aplica validación estricta de datos y manejo de errores.
- Evita suposiciones de datos no verificados.
- Propón mejoras cuando el rendimiento pueda verse afectado.
- No generes código si no está relacionado con el contexto del proyecto Punto de Venta.
- Sugerir actualizaciones a las instrucciones si se identifican áreas de mejora.

---
