create table ventas_items
(
    id              bigserial
        constraint ventas_items_pkey
            primary key,
    venta_id        bigint         not null
        constraint fk_ventas_items_venta
            references ventas,
    producto_id     bigint         not null
        constraint fk_ventas_items_producto
            references productos,
    cantidad        numeric(12, 3) not null,
    precio_unitario numeric(12, 2) not null,
    costo_estimado  numeric(12, 4),
    nota            text,
    created_at      timestamp default CURRENT_TIMESTAMP,
    updated_at      timestamp default CURRENT_TIMESTAMP,
    producto_nombre varchar(255)
);

alter table ventas_items
    owner to postgres;

create index idx_ventas_items_venta
    on ventas_items (venta_id);

create index idx_ventas_items_producto
    on ventas_items (producto_id);

