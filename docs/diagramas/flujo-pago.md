```mermaid
flowchart TD
    P[Seleccionar método de pago] --> F[Finalizar venta]
    P --> E1[Efectivo]
    P --> E2[Tarjeta]
    P --> E3[Transferencia]
    E1 --> F
    E2 --> F
    E3 --> F
```