create table productos
(
    id                 bigserial
        constraint productos_pkey
            primary key,
    nombre             varchar(200)   not null,
    categoria_id       bigint         not null
        constraint fk_productos_categoria
            references categorias_productos,
    precio             numeric(12, 2) not null,
    activo             boolean   default true,
    created_at         timestamp default CURRENT_TIMESTAMP,
    updated_at         timestamp default CURRENT_TIMESTAMP,
    costo_estimado     numeric(12, 4),
    descripcion        text,
    disponible_en_menu boolean        not null,
    sku                varchar(50),
    producto_base_id   bigint
        constraint fk2ghuqmvdch7ykavhg4mctdu7u
            references productos,
    nombre_variante    varchar(100),
    orden_variante     integer
);

alter table productos
    owner to postgres;

create index idx_productos_producto_base_id
    on productos (producto_base_id);

create index idx_productos_base_orden
    on productos (producto_base_id, orden_variante);

