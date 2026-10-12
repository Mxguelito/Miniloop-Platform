"""corregir check porcentaje expensa

Revision ID: cd3fc87ed4c2
Revises: f422d0226137
Create Date: 2026-08-28 05:13:12.635127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd3fc87ed4c2'
down_revision: Union[str, Sequence[str], None] = 'f422d0226137'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.drop_constraint(
        "chk_expensas_porcentaje",
        "expensas",
        type_="check",
    )

    op.create_check_constraint(
        "chk_expensas_porcentaje",
        "expensas",
        "porcentaje_aplicado > 0 AND porcentaje_aplicado <= 100",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "chk_expensas_porcentaje",
        "expensas",
        type_="check",
    )

    op.create_check_constraint(
        "chk_expensas_porcentaje",
        "expensas",
        "porcentaje_aplicado IS NULL OR "
        "(porcentaje_aplicado >= 0 AND porcentaje_aplicado <= 100)",
    )
