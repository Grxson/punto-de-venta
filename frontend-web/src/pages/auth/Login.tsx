import { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';



export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, usuario } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir según rol
  useEffect(() => {
    if (isAuthenticated && usuario) {
      // Obtener el rol (puede venir como 'rol' o 'rolNombre')
      const rol = usuario.rol || usuario.rolNombre || '';
      
      // Detectar rol y redirigir automáticamente
      if (rol === 'ADMIN' || rol === 'GERENTE') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/pos', { replace: true });
      }
    }
  }, [isAuthenticated, usuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Hacer login usando el contexto (actualiza el estado automáticamente)
      await login(username, password);
      
      // Esperar un momento para que el estado se actualice
      // El useEffect también manejará la redirección, pero hacemos esto como respaldo
      setTimeout(() => {
        const storedUsuario = localStorage.getItem('auth_usuario');
        if (storedUsuario) {
          const usuarioData = JSON.parse(storedUsuario);
          // Obtener el rol (puede venir como 'rol' o 'rolNombre')
          const rol = usuarioData.rol || usuarioData.rolNombre || '';
          
          // Redirigir según el rol del usuario
          if (rol === 'ADMIN' || rol === 'GERENTE') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/pos', { replace: true });
          }
        } else {
          // Fallback: redirigir a POS si no se puede obtener el usuario
          navigate('/pos', { replace: true });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', padding: 2 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Punto de Venta
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ minHeight: '48px' }}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

