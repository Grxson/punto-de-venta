create table pagos
(
    id             bigserial
        constraint pagos_pkey
            primary key,
    venta_id       bigint         not null
        constraint fk_pagos_venta
            references ventas,
    metodo_pago_id bigint         not null
        constraint fk_pagos_metodo_pago
            references metodos_pago,
    monto          numeric(12, 2) not null,
    referencia     varchar(255),
    fecha          timestamp      not null,
    created_at     timestamp default CURRENT_TIMESTAMP,
    updated_at     timestamp default CURRENT_TIMESTAMP
);

alter table pagos
    owner to postgres;

create index idx_pagos_venta
    on pagos (venta_id);

