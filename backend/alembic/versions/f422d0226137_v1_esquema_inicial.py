"""v1 esquema inicial

Revision ID: f422d0226137
Revises: 2ae0fdfef605
Create Date: 2026-08-26 19:19:13.648797

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f422d0226137"
down_revision: Union[str, Sequence[str], None] = "2ae0fdfef605"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "comercios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column("categoria", sa.String(length=80), nullable=False),
        sa.Column("direccion", sa.String(length=200), nullable=False),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "consorcios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column("direccion", sa.String(length=200), nullable=False),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_usuarios_email"),
        "usuarios",
        ["email"],
        unique=True,
    )

    op.create_table(
        "comunicados",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("autor_id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(length=150), nullable=False),
        sa.Column("mensaje", sa.Text(), nullable=False),
        sa.Column(
            "fecha_creacion",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["autor_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["consorcio_id"], ["consorcios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "gastos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("concepto", sa.String(length=150), nullable=False),
        sa.Column(
            "monto",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column("fecha", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
            name="fk_gastos_consorcio",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_gastos_consorcio_id"),
        "gastos",
        ["consorcio_id"],
        unique=False,
    )

    op.create_table(
        "ingresos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("concepto", sa.String(length=150), nullable=False),
        sa.Column(
            "monto",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column("fecha", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_ingresos_consorcio_id"),
        "ingresos",
        ["consorcio_id"],
        unique=False,
    )

    op.create_table(
        "invitaciones_consorcios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("creada_por", sa.Integer(), nullable=False),
        sa.Column("codigo", sa.String(length=20), nullable=False),
        sa.Column(
            "estado",
            sa.String(length=20),
            server_default=sa.text("'ACTIVA'"),
            nullable=False,
        ),
        sa.Column(
            "fecha_creacion",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
        ),
        sa.ForeignKeyConstraint(
            ["creada_por"],
            ["usuarios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("codigo"),
    )

    op.create_table(
        "liquidaciones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("mes", sa.Integer(), nullable=False),
        sa.Column("anio", sa.Integer(), nullable=False),
        sa.Column(
            "total_gastos",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column("fecha_generacion", sa.Date(), nullable=False),
        sa.Column(
            "estado",
            sa.String(length=20),
            server_default=sa.text("'GENERADA'"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "mes >= 1 AND mes <= 12",
            name="chk_liquidaciones_mes",
        ),
        sa.CheckConstraint(
            "total_gastos >= 0",
            name="chk_liquidaciones_total",
        ),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "consorcio_id",
            "mes",
            "anio",
            name="uq_liquidacion_periodo",
        ),
    )

    op.create_index(
        op.f("ix_liquidaciones_consorcio_id"),
        "liquidaciones",
        ["consorcio_id"],
        unique=False,
    )

    op.create_table(
        "pedidos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("comercio_id", sa.Integer(), nullable=False),
        sa.Column(
            "estado",
            sa.String(length=20),
            server_default=sa.text("'PENDIENTE'"),
            nullable=False,
        ),
        sa.Column(
            "total",
            sa.Numeric(precision=10, scale=2),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "fecha_creacion",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["comercio_id"],
            ["comercios.id"],
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "productos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("comercio_id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column(
            "precio",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
        ),
        sa.Column(
            "stock",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(
            ["comercio_id"],
            ["comercios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "unidades",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column(
            "identificador",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "metros_cuadrados",
            sa.Numeric(precision=10, scale=2),
            nullable=True,
        ),
        sa.Column(
            "porcentaje_expensa",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
        sa.CheckConstraint(
            "porcentaje_expensa > 0 AND porcentaje_expensa <= 100",
            name="chk_porcentaje_expensa",
        ),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_unidades_consorcio_id"),
        "unidades",
        ["consorcio_id"],
        unique=False,
    )

    op.create_table(
        "usuarios_comercios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("comercio_id", sa.Integer(), nullable=False),
        sa.Column("rol", sa.String(length=30), nullable=False),
        sa.ForeignKeyConstraint(
            ["comercio_id"],
            ["comercios.id"],
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "expensas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("liquidacion_id", sa.Integer(), nullable=True),
        sa.Column(
            "porcentaje_aplicado",
            sa.Numeric(precision=5, scale=2),
            nullable=True,
        ),
        sa.Column("unidad_id", sa.Integer(), nullable=False),
        sa.Column("mes", sa.Integer(), nullable=True),
        sa.Column("anio", sa.Integer(), nullable=True),
        sa.Column(
            "monto",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column(
            "estado",
            sa.String(length=20),
            server_default=sa.text("'PENDIENTE'"),
            nullable=False,
        ),
        sa.Column("fecha_pago", sa.Date(), nullable=True),
        sa.CheckConstraint(
            "monto >= 0",
            name="chk_expensas_monto",
        ),
        sa.CheckConstraint(
            "porcentaje_aplicado IS NULL OR "
            "(porcentaje_aplicado >= 0 AND porcentaje_aplicado <= 100)",
            name="chk_expensas_porcentaje",
        ),
        sa.ForeignKeyConstraint(
            ["liquidacion_id"],
            ["liquidaciones.id"],
        ),
        sa.ForeignKeyConstraint(
            ["unidad_id"],
            ["unidades.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "liquidacion_id",
            "unidad_id",
            name="uq_expensa_liquidacion_unidad",
        ),
    )

    op.create_index(
        op.f("ix_expensas_liquidacion_id"),
        "expensas",
        ["liquidacion_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_expensas_unidad_id"),
        "expensas",
        ["unidad_id"],
        unique=False,
    )

    op.create_table(
        "pedido_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("pedido_id", sa.Integer(), nullable=False),
        sa.Column("producto_id", sa.Integer(), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False),
        sa.Column(
            "precio_unitario",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
        ),
        sa.Column(
            "subtotal",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pedido_id"],
            ["pedidos.id"],
        ),
        sa.ForeignKeyConstraint(
            ["producto_id"],
            ["productos.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "usuarios_consorcios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("consorcio_id", sa.Integer(), nullable=False),
        sa.Column("unidad_id", sa.Integer(), nullable=True),
        sa.Column("rol", sa.String(length=30), nullable=False),
        sa.ForeignKeyConstraint(
            ["consorcio_id"],
            ["consorcios.id"],
        ),
        sa.ForeignKeyConstraint(
            ["unidad_id"],
            ["unidades.id"],
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table("usuarios_consorcios")
    op.drop_table("pedido_items")

    op.drop_index(
        op.f("ix_expensas_unidad_id"),
        table_name="expensas",
    )
    op.drop_index(
        op.f("ix_expensas_liquidacion_id"),
        table_name="expensas",
    )
    op.drop_table("expensas")

    op.drop_table("usuarios_comercios")

    op.drop_index(
        op.f("ix_unidades_consorcio_id"),
        table_name="unidades",
    )
    op.drop_table("unidades")

    op.drop_table("productos")
    op.drop_table("pedidos")

    op.drop_index(
        op.f("ix_liquidaciones_consorcio_id"),
        table_name="liquidaciones",
    )
    op.drop_table("liquidaciones")

    op.drop_table("invitaciones_consorcios")

    op.drop_index(
        op.f("ix_ingresos_consorcio_id"),
        table_name="ingresos",
    )
    op.drop_table("ingresos")

    op.drop_index(
        op.f("ix_gastos_consorcio_id"),
        table_name="gastos",
    )
    op.drop_table("gastos")

    op.drop_table("comunicados")

    op.drop_index(
        op.f("ix_usuarios_email"),
        table_name="usuarios",
    )
    op.drop_table("usuarios")

    op.drop_table("consorcios")
    op.drop_table("comercios")