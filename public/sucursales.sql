create table sucursales
(
    id         bigserial
        constraint sucursales_pkey
            primary key,
    nombre     varchar(100) not null,
    direccion  varchar(255),
    activa     boolean   default true,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    email      varchar(100),
    telefono   varchar(20),
    activo     integer      not null
);

alter table sucursales
    owner to postgres;

