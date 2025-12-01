import java.sql.*;

public class CheckDuplicates {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://yamabiko.proxy.rlwy.net:32280/railway";
        String user = "postgres";
        String password = "wJKSbcSmVIZwlENHMugzIxdIrNwumWft";
        
        // Primero verificamos las columnas de la tabla productos
        String queryColumns = "SELECT column_name FROM information_schema.columns WHERE table_name = 'productos' ORDER BY ordinal_position";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("\n=== COLUMNAS DE LA TABLA PRODUCTOS ===\n");
            ResultSet rsColumns = stmt.executeQuery(queryColumns);
            while (rsColumns.next()) {
                System.out.println("  - " + rsColumns.getString("column_name"));
            }
            rsColumns.close();
            
            // Ahora buscamos duplicados por nombre
            String query = "SELECT nombre, COUNT(*) AS duplicados, " +
                           "STRING_AGG(CAST(id AS VARCHAR), ', ') AS ids " +
                           "FROM productos GROUP BY nombre HAVING COUNT(*) > 1 ORDER BY nombre";
            
            ResultSet rs = stmt.executeQuery(query);
            
            System.out.println("\n=== PRODUCTOS DUPLICADOS ===\n");
            boolean foundDuplicates = false;
            
            while (rs.next()) {
                foundDuplicates = true;
                String nombre = rs.getString("nombre");
                int duplicados = rs.getInt("duplicados");
                String ids = rs.getString("ids");
                
                System.out.println("Producto: " + nombre);
                System.out.println("  Duplicados: " + duplicados);
                System.out.println("  IDs: " + ids);
                
                // Obtener detalles de cada producto duplicado
                String detailQuery = "SELECT id, nombre, precio FROM productos WHERE nombre = ? ORDER BY id";
                PreparedStatement pstmt = conn.prepareStatement(detailQuery);
                pstmt.setString(1, nombre);
                ResultSet rsDetail = pstmt.executeQuery();
                
                System.out.println("  Detalles:");
                while (rsDetail.next()) {
                    System.out.println("    ID " + rsDetail.getLong("id") + ": precio = " + rsDetail.getBigDecimal("precio"));
                }
                rsDetail.close();
                pstmt.close();
                System.out.println("---");
            }
            
            if (!foundDuplicates) {
                System.out.println("No se encontraron productos duplicados.");
            }
            
            rs.close();
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
