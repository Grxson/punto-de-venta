create table descuentos
(
    id               bigserial
        constraint descuentos_pkey
            primary key,
    nombre           varchar(255)   not null,
    tipo             varchar(20)
        constraint descuentos_tipo_check
            check ((tipo)::text = ANY ((ARRAY ['porcentaje'::character varying, 'monto'::character varying])::text[])),
    valor            numeric(12, 4) not null,
    activo           boolean   default true,
    max_por_rol_json text,
    created_at       timestamp default CURRENT_TIMESTAMP,
    updated_at       timestamp default CURRENT_TIMESTAMP
);

alter table descuentos
    owner to postgres;

