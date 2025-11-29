create table metodos_pago
(
    id                  bigserial
        constraint metodos_pago_pkey
            primary key,
    nombre              varchar(100)        not null
        constraint metodos_pago_nombre_key
            unique,
    requiere_referencia integer   default 0,
    created_at          timestamp default CURRENT_TIMESTAMP,
    updated_at          timestamp default CURRENT_TIMESTAMP,
    descripcion         text,
    activo              integer   default 1 not null
);

alter table metodos_pago
    owner to postgres;

