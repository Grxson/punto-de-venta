create table rol_permisos
(
    rol_id     bigint not null
        constraint fk3brv6p1mw68brbj5gq8xtq8el
            references roles,
    permiso_id bigint not null
        constraint fk9a92613h451aryhufw6j7m4yd
            references permisos,
    constraint rol_permisos_pkey
        primary key (rol_id, permiso_id)
);

alter table rol_permisos
    owner to postgres;

