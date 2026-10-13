import { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';



/**
 * Pantalla de inicio de sesión, punto de entrada único a la app.
 * @remarks Tras validar las credenciales decide la ruta de destino según el rol:
 * ADMIN y GERENTE van al panel de administración, el resto al punto de venta.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, usuario } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirige a la app si ya hay sesión activa y avisa cuando la sesión caducó.
  useEffect(() => {
    // El interceptor de Axios marca la caducidad con ?expired en la URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('expired')) {
      setSessionExpiredMessage('Tu sesión ha caducado. Por favor inicia sesión nuevamente.');
      // Se limpia el parámetro para que un refresco no repita el aviso
      window.history.replaceState({}, document.title, '/login');
    }

    // Ruta heredada: el aviso llegaba por sessionStorage en versiones previas
    const expiredMsg = sessionStorage.getItem('sessionExpiredMessage');
    if (expiredMsg) {
      setSessionExpiredMessage(expiredMsg);
      sessionStorage.removeItem('sessionExpiredMessage');
    }

    if (isAuthenticated && usuario) {
      // Obtener el rol (puede venir como 'rol' o 'rolNombre')
      const rol = usuario.rol || usuario.rolNombre || '';

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
      // El login vive en AuthContext: aquí sólo se consumen sus errores
      await login(username, password);

      // El useEffect ya redirige cuando `usuario` se actualiza; este setTimeout
      // es el respaldo para el caso en que el contexto llega antes que el effect.
      setTimeout(() => {
        const storedUsuario = localStorage.getItem('auth_usuario');
        if (storedUsuario) {
          const usuarioData = JSON.parse(storedUsuario);
          // El rol puede venir como 'rol' o 'rolNombre' según la versión del backend
          const rol = usuarioData.rol || usuarioData.rolNombre || '';

          if (rol === 'ADMIN' || rol === 'GERENTE') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/pos', { replace: true });
          }
        } else {
          // Sin usuario en localStorage se asume el flujo del punto de venta
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

          {sessionExpiredMessage && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {sessionExpiredMessage}
            </Alert>
          )}

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

