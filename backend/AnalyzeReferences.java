import java.sql.*;

public class AnalyzeReferences {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://yamabiko.proxy.rlwy.net:32280/railway";
        String user = "postgres";
        String password = "wJKSbcSmVIZwlENHMugzIxdIrNwumWft";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("\n=== PRODUCTOS CON REFERENCIAS (producto_base_id) ===\n");
            
            String query = "SELECT p.id, p.nombre, p.producto_base_id, pb.nombre AS base_nombre, p.precio " +
                          "FROM productos p " +
                          "LEFT JOIN productos pb ON p.producto_base_id = pb.id " +
                          "WHERE p.producto_base_id IN (470, 490, 501, 471, 491, 504, 467, 487, 468, 488, 469, 489, 463, 465, 464, 466) " +
                          "ORDER BY p.producto_base_id, p.id";
            
            ResultSet rs = stmt.executeQuery(query);
            boolean hasReferences = false;
            
            while (rs.next()) {
                hasReferences = true;
                System.out.printf("ID %d (%s) → referencia a base ID %d (%s) precio=%.2f%n",
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getLong("producto_base_id"),
                    rs.getString("base_nombre"),
                    rs.getBigDecimal("precio"));
            }
            rs.close();
            
            if (!hasReferences) {
                System.out.println("✅ No hay productos que referencien a los duplicados a eliminar.");
            }
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
