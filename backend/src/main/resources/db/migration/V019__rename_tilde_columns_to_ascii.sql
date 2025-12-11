-- V019: Estandarizar nombres de columnas - Usar tildes para consistencia con dominio en español
-- NOTA: Después de análisis, decidimos mantener tildes en nombres de columnas relacionadas a "tamaño"
-- ya que la BD actual usa tildes y es más consistente con el dominio en español.
-- Esta migración es IDEMPOTENTE - solo cambia si es necesario.

-- La estrategia final es:
-- - Mantener: tamaño_id, tamaño_nombre, precio_extra_tamaño (con tildes)
-- - Cambiar: todas las demás columnas BOOLEAN a SMALLINT (ya hecho en V018)

-- No hacer cambios en V019 relacionados a tamaño
-- La BD ya tiene los nombres correctos con tildes
