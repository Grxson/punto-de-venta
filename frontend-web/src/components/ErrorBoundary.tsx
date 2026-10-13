import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const sentryWindowEnv: Record<string, string | undefined> =
  (window as any).__ENV__ || {};

const sentryDsn =
  sentryWindowEnv.VITE_SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN || '';

const sentryEnvironment =
  sentryWindowEnv.VITE_APP_ENV || import.meta.env.VITE_APP_ENV || 'development';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
  });
}

interface ErrorBoundaryProps {
    /** Árbol de componentes cuya renderización queda protegida por el boundary. */
    children: ReactNode;
}

interface ErrorBoundaryState {
    /** Indica si se capturó un error y se está mostrando la pantalla de fallo. */
    hasError: boolean;
    /** Error capturado, o `null` mientras no haya fallo. */
    error: Error | null;
}

/**
 * Boundary global de errores de React.
 * Evita que la aplicación quede en blanco: captura los errores de renderizado,
 * los reporta a Sentry y muestra una pantalla amigable con opciones de reintento.
 * Si detecta un error de carga de `chunk`, recarga la página una sola vez por sesión.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error) {
        console.error('🔴 [ErrorBoundary] Error capturado:', error);
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('📋 [ErrorBoundary] Error Info:', errorInfo);
        console.error('   Stack:', error.stack);
        Sentry.captureException(error, {
            contexts: { react: { componentStack: errorInfo.componentStack } },
        });

        const isChunkError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
            error.message
        );
        if (isChunkError) {
            const reloadKey = 'errorBoundaryChunkReloaded';
            if (!sessionStorage.getItem(reloadKey)) {
                sessionStorage.setItem(reloadKey, '1');
                window.location.reload();
            }
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Recargar la página para limpiar todo el estado
        window.location.href = '/login';
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        backgroundColor: '#f5f5f5',
                        padding: 2,
                    }}
                >
                    <Card
                        sx={{
                            maxWidth: 500,
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent
                            sx={{
                                textAlign: 'center',
                                padding: 4,
                            }}
                        >
                            <ErrorIcon
                                sx={{
                                    fontSize: 64,
                                    color: '#d32f2f',
                                    marginBottom: 2,
                                }}
                            />

                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    marginBottom: 2,
                                    color: '#d32f2f',
                                }}
                            >
                                ¡Algo salió mal!
                            </Typography>

                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{
                                    marginBottom: 3,
                                    lineHeight: 1.6,
                                }}
                            >
                                Se presentó un error inesperado. Por favor intenta de nuevo o contacta con soporte si el problema persiste.
                            </Typography>

                            {import.meta.env.DEV && this.state.error && (
                                <Box
                                    sx={{
                                        backgroundColor: '#f5f5f5',
                                        padding: 2,
                                        borderRadius: 1,
                                        marginBottom: 2,
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        color: '#d32f2f',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                        border: '1px solid #ffcdd2',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            marginBottom: 1,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Detalles del Error:
                                    </Typography>
                                    <code>{this.state.error.message}</code>
                                    {this.state.error.stack && (
                                        <pre
                                            style={{
                                                marginTop: 8,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {this.state.error.stack}
                                        </pre>
                                    )}
                                </Box>
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.handleRetry}
                                    sx={{
                                        minHeight: 44,
                                        minWidth: 120,
                                    }}
                                >
                                    Reintentar
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={this.handleReset}
                                    sx={{
                                        minHeight: 44,
                                        minWidth: 120,
                                    }}
                                >
                                    Ir a Login
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
