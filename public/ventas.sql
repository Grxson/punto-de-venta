create table ventas
(
    id          bigserial
        constraint ventas_pkey
            primary key,
    sucursal_id bigint         not null
        constraint fk_ventas_sucursal
            references sucursales,
    caja_id     bigint         not null
        constraint fk_ventas_caja
            references cajas,
    turno_id    bigint         not null
        constraint fk_ventas_turno
            references turnos,
    fecha       timestamp      not null,
    total       numeric(12, 2) not null,
    impuestos   numeric(12, 2) default 0,
    descuento   numeric(12, 2) default 0,
    cliente_id  bigint
        constraint fk_ventas_cliente
            references clientes,
    canal       varchar(50),
    estado      varchar(20)    not null
        constraint ventas_estado_check
            check ((estado)::text = ANY
                   ((ARRAY ['abierta'::character varying, 'cerrada'::character varying, 'cancelada'::character varying])::text[])),
    created_at  timestamp      default CURRENT_TIMESTAMP,
    updated_at  timestamp      default CURRENT_TIMESTAMP,
    constraint fkco9r9xjcdqtgd4nvnnolsr6ei
        foreign key () references usuarios
);

alter table ventas
    owner to postgres;

create index idx_ventas_fecha
    on ventas (fecha);

create index idx_ventas_sucursal_fecha
    on ventas (sucursal_id, fecha);

create index idx_ventas_estado
    on ventas (estado);

