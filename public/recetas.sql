create table recetas
(
    ingrediente_id bigint         not null
        constraint fknmst63aha52rjm72s64kh55o7
            references ingredientes,
    producto_id    bigint         not null
        constraint fkqh7vc8jkvfyuylq89i0chxpcs
            references productos,
    cantidad       numeric(12, 6) not null,
    merma_teorica  numeric(6, 4),
    unidad_id      bigint         not null
        constraint fksbj0uqpl3wl5hcffm3jqy4gt6
            references unidades,
    constraint recetas_pkey
        primary key (ingrediente_id, producto_id)
);

alter table recetas
    owner to postgres;

