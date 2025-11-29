create table cajas
(
    id          bigserial
        constraint cajas_pkey
            primary key,
    sucursal_id bigint       not null
        constraint fk_cajas_sucursal
            references sucursales,
    nombre      varchar(255) not null,
    activa      boolean   default true,
    created_at  timestamp default CURRENT_TIMESTAMP,
    updated_at  timestamp default CURRENT_TIMESTAMP
);

alter table cajas
    owner to postgres;

