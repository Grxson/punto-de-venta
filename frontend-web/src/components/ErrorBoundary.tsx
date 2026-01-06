import React, { Component, ReactNode } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary global para evitar que la app quede en blanco
 * Captura errores de React y los muestra en una pantalla amigable
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
    }

    handleReset = () => {
        console.log('🔄 [ErrorBoundary] Reiniciando aplicación...');
        this.setState({ hasError: false, error: null });
        // Recargar la página para limpiar todo el estado
        window.location.href = '/login';
    };

    handleRetry = () => {
        console.log('🔄 [ErrorBoundary] Reintentando...');
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

                            {process.env.NODE_ENV === 'development' && this.state.error && (
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
