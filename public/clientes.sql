create table clientes
(
    id         bigserial
        constraint clientes_pkey
            primary key,
    nombre     varchar(255) not null,
    telefono   varchar(20),
    email      varchar(255),
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP
);

alter table clientes
    owner to postgres;

