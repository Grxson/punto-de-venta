create table producto_costo_historico
(
    id          bigserial
        constraint producto_costo_historico_pkey
            primary key,
    producto_id bigint                              not null
        constraint producto_costo_historico_producto_id_fkey
            references productos,
    costo       numeric(12, 2)                      not null,
    precio      numeric(12, 2)                      not null,
    margen      numeric(12, 2)                      not null,
    fuente      varchar(50)                         not null,
    fecha       timestamp default CURRENT_TIMESTAMP not null
);

alter table producto_costo_historico
    owner to postgres;

create index idx_producto_costo_historico_producto_id
    on producto_costo_historico (producto_id);

create index idx_producto_costo_historico_fecha
    on producto_costo_historico (fecha);

