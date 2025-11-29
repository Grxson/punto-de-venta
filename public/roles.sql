create table roles
(
    id            bigserial
        constraint roles_pkey
            primary key,
    nombre        varchar(50) not null
        constraint roles_nombre_key
            unique,
    permisos_json text,
    created_at    timestamp default CURRENT_TIMESTAMP,
    updated_at    timestamp default CURRENT_TIMESTAMP,
    descripcion   varchar(255),
    activo        integer     not null
);

alter table roles
    owner to postgres;

