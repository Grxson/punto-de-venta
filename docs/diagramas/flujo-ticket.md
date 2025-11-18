```mermaid
flowchart TD
    K[Agregar al ticket] --> Q{¿Gestionar ticket?}
    Q -->|Editar| E[Editar producto en ticket]
    Q -->|Cancelar| C[Cancelar producto del ticket]
    Q -->|Agregar| A[Agregar otro producto]
    Q -->|Listo| P[Seleccionar método de pago]
    E --> Q
    C --> Q
    A --> B[Seleccionar categoría del menú]
    B --> ...
``