create table turnos
(
    id                  bigserial
        constraint turnos_pkey
            primary key,
    sucursal_id         bigint    not null
        constraint fk_turnos_sucursal
            references sucursales,
    caja_id             bigint    not null
        constraint fk_turnos_caja
            references cajas,
    usuario_id_apertura bigint    not null
        constraint fk_turnos_usuario_apertura
            references usuarios,
    fecha_apertura      timestamp not null,
    usuario_id_cierre   bigint
        constraint fk_turnos_usuario_cierre
            references usuarios,
    fecha_cierre        timestamp,
    activo              boolean   default true,
    created_at          timestamp default CURRENT_TIMESTAMP,
    updated_at          timestamp default CURRENT_TIMESTAMP
);

alter table turnos
    owner to postgres;

create index idx_turnos_activo
    on turnos (activo);

