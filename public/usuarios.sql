create table usuarios
(
    id            bigserial
        constraint usuarios_pkey
            primary key,
    nombre        varchar(100) not null,
    username      varchar(50)  not null
        constraint usuarios_username_key
            unique,
    password      varchar(255) not null,
    rol_id        bigint       not null
        constraint fk_usuarios_rol
            references roles,
    sucursal_id   bigint
        constraint fk_usuarios_sucursal
            references sucursales,
    activo        integer   default 1,
    created_at    timestamp default CURRENT_TIMESTAMP,
    updated_at    timestamp default CURRENT_TIMESTAMP,
    apellido      varchar(100) not null,
    email         varchar(100) not null
        constraint ukkfsp0s1tflm1cwlj8idhqsad0
            unique,
    ultimo_acceso timestamp(6)
);

alter table usuarios
    owner to postgres;

create index idx_usuarios_username
    on usuarios (username);

