import java.sql.*;

public class ExecuteCleanup {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://yamabiko.proxy.rlwy.net:32280/railway";
        String user = "postgres";
        String password = "wJKSbcSmVIZwlENHMugzIxdIrNwumWft";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            conn.setAutoCommit(false); // Comenzar transacción
            
            // PASO 1: Verificar productos a eliminar
            System.out.println("\n=== PASO 1: PRODUCTOS A ELIMINAR ===\n");
            String verifyQuery = "SELECT id, nombre, precio, activo, created_at FROM productos " +
                                "WHERE id IN (470, 490, 501, 471, 491, 504, 467, 487, 468, 488, 469, 489, 463, 465, 464, 466) " +
                                "ORDER BY nombre, id";
            ResultSet rs = stmt.executeQuery(verifyQuery);
            int count = 0;
            while (rs.next()) {
                count++;
                System.out.printf("ID %d: %-30s precio=%.2f activo=%s%n", 
                    rs.getLong("id"), 
                    rs.getString("nombre"), 
                    rs.getBigDecimal("precio"),
                    rs.getBoolean("activo") ? "Sí" : "No");
            }
            rs.close();
            System.out.println("\nTotal a eliminar: " + count + " productos");
            
            // PASO 2: Ejecutar DELETE
            System.out.println("\n=== PASO 2: ELIMINANDO DUPLICADOS ===\n");
            String deleteQuery = "DELETE FROM productos WHERE id IN " +
                                "(470, 490, 501, 471, 491, 504, 467, 487, 468, 488, 469, 489, 463, 465, 464, 466)";
            int deleted = stmt.executeUpdate(deleteQuery);
            System.out.println("Productos eliminados: " + deleted);
            
            // PASO 3: Verificar que no queden duplicados
            System.out.println("\n=== PASO 3: VERIFICANDO DUPLICADOS RESTANTES ===\n");
            String duplicatesQuery = "SELECT nombre, COUNT(*) AS duplicados, " +
                                    "STRING_AGG(CAST(id AS VARCHAR), ', ') AS ids " +
                                    "FROM productos GROUP BY nombre HAVING COUNT(*) > 1 ORDER BY nombre";
            rs = stmt.executeQuery(duplicatesQuery);
            boolean hasDuplicates = false;
            while (rs.next()) {
                hasDuplicates = true;
                System.out.println("⚠️  " + rs.getString("nombre") + ": " + rs.getInt("duplicados") + 
                                  " duplicados (IDs: " + rs.getString("ids") + ")");
            }
            rs.close();
            
            if (!hasDuplicates) {
                System.out.println("✅ No quedan productos duplicados");
            }
            
            // COMMIT
            conn.commit();
            System.out.println("\n✅ TRANSACCIÓN CONFIRMADA - Cambios aplicados exitosamente\n");
            
        } catch (Exception e) {
            System.err.println("\n❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            System.err.println("\n⚠️  Los cambios NO fueron aplicados (rollback automático)\n");
        }
    }
}
