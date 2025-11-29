create table categorias_productos
(
    id          bigserial
        constraint categorias_productos_pkey
            primary key,
    nombre      varchar(100)           not null
        constraint categorias_productos_nombre_key
            unique,
    created_at  timestamp default CURRENT_TIMESTAMP,
    updated_at  timestamp default CURRENT_TIMESTAMP,
    descripcion text,
    activa      boolean   default true not null
);

alter table categorias_productos
    owner to postgres;

