from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

from database import Base, DATABASE_URL

# =========================================================
# IMPORTAR MODELOS
# =========================================================
# Es necesario importar todos los modelos para que Alembic
# los registre dentro de Base.metadata.
# =========================================================

import models.usuario
import models.comercio
import models.usuario_comercio
import models.consorcio
import models.usuario_consorcio
import models.invitacion_consorcio
import models.producto
import models.pedido
import models.pedido_item
import models.comunicado
import models.unidad
import models.gasto
import models.ingreso
import models.expensa
import models.liquidacion


# =========================================================
# CONFIGURACIÓN DE ALEMBIC
# =========================================================

config = context.config

# Usamos la misma URL configurada por nuestra aplicación.
config.set_main_option(
    "sqlalchemy.url",
    DATABASE_URL,
)

# Configuración del logging de Alembic.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Metadata utilizada por Alembic para comparar
# los modelos SQLAlchemy contra la base de datos.
target_metadata = Base.metadata


# =========================================================
# MIGRACIONES OFFLINE
# =========================================================

def run_migrations_offline() -> None:
    """
    Ejecuta las migraciones sin abrir una conexión
    directa contra la base de datos.

    Se utiliza, por ejemplo, con:
        alembic upgrade head --sql
    """

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# =========================================================
# MIGRACIONES ONLINE
# =========================================================

def run_migrations_online() -> None:
    """
    Ejecuta las migraciones conectándose directamente
    a PostgreSQL.
    """

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {}
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# =========================================================
# EJECUCIÓN
# =========================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()