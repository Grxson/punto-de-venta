import java.sql.*;

public class ExecuteCleanupWithFK {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://yamabiko.proxy.rlwy.net:32280/railway";
        String user = "postgres";
        String password = "wJKSbcSmVIZwlENHMugzIxdIrNwumWft";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            conn.setAutoCommit(false);
            
            System.out.println("\n=== LIMPIEZA DE DUPLICADOS CON REASIGNACIÓN FK ===\n");
            
            // PASO 1: REASIGNAR REFERENCIAS
            System.out.println("PASO 1: Reasignando referencias...\n");
            
            int updated = 0;
            updated += stmt.executeUpdate("UPDATE productos SET producto_base_id = 461 WHERE producto_base_id = 465");
            System.out.println("  Mini Hot Cakes: " + updated + " productos reasignados de 465 → 461");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 462 WHERE producto_base_id = 466");
            System.out.println("  Molletes: " + updated + " productos reasignados de 466 → 462");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 492 WHERE producto_base_id IN (467, 487)");
            System.out.println("  Naranja/Toronja: " + updated + " productos reasignados de 467,487 → 492");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 495 WHERE producto_base_id IN (468, 488)");
            System.out.println("  Naranja/Zanahoria: " + updated + " productos reasignados de 468,488 → 495");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 498 WHERE producto_base_id IN (469, 489)");
            System.out.println("  Zanahoria/Toronja: " + updated + " productos reasignados de 469,489 → 498");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 502 WHERE producto_base_id IN (470, 490)");
            System.out.println("  Betabel/Naranja: " + updated + " productos reasignados de 470,490 → 502");
            
            updated = stmt.executeUpdate("UPDATE productos SET producto_base_id = 505 WHERE producto_base_id IN (471, 491)");
            System.out.println("  Betabel/Zanahoria: " + updated + " productos reasignados de 471,491 → 505");
            
            // PASO 2: ELIMINAR DUPLICADOS
            System.out.println("\nPASO 2: Eliminando duplicados...\n");
            
            String deleteQuery = "DELETE FROM productos WHERE id IN " +
                                "(463, 465, 464, 466, 467, 487, 468, 488, 469, 489, 470, 490, 501, 471, 491, 504)";
            int deleted = stmt.executeUpdate(deleteQuery);
            System.out.println("  Productos eliminados: " + deleted);
            
            // PASO 3: VERIFICAR
            System.out.println("\nPASO 3: Verificando duplicados restantes...\n");
            
            String verifyQuery = "SELECT nombre, COUNT(*) AS duplicados, " +
                                "STRING_AGG(CAST(id AS VARCHAR), ', ') AS ids " +
                                "FROM productos GROUP BY nombre HAVING COUNT(*) > 1 ORDER BY nombre";
            ResultSet rs = stmt.executeQuery(verifyQuery);
            
            boolean hasDuplicates = false;
            while (rs.next()) {
                hasDuplicates = true;
                System.out.println("  ⚠️  " + rs.getString("nombre") + ": " + 
                                  rs.getInt("duplicados") + " duplicados (IDs: " + rs.getString("ids") + ")");
            }
            rs.close();
            
            if (!hasDuplicates) {
                System.out.println("  ✅ No quedan productos duplicados");
            }
            
            conn.commit();
            System.out.println("\n✅ TRANSACCIÓN CONFIRMADA - Limpieza exitosa\n");
            
        } catch (Exception e) {
            System.err.println("\n❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            System.err.println("\n⚠️  Rollback automático aplicado\n");
        }
    }
}
