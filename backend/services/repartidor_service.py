from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.repartidor import Repartidor
from models.usuario import Usuario
from models.zona import Zona
from repositories.repartidor_repository import RepartidorRepository
from schemas.repartidor import RepartidorCreate
from decimal import Decimal

from repositories.calificacion_repartidor_repository import (CalificacionRepartidorRepository,)
from repositories.ganancia_repartidor_repository import (  GananciaRepartidorRepository,)


class RepartidorService:

    TRANSPORTES_PERMITIDOS = {
        "A_PIE",
        "BICI",
        "MOTO",
        "AUTO"
    }

    def __init__(self, db: Session):
        self.db = db
        self.repository = RepartidorRepository(db)
        self.calificacion_repository = (CalificacionRepartidorRepository(db))
        self.ganancia_repository = (   GananciaRepartidorRepository(db))

    # =========================
    # ACTIVAR DELIVERY
    # =========================

    def activar(
        self,
        data: RepartidorCreate,
        usuario: Usuario
    ) -> Repartidor:

        # Un usuario solo puede tener un perfil Delivery
        existente = self.repository.buscar_por_usuario(
            usuario.id
        )

        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario ya tiene un perfil de repartidor"
            )

        # La zona debe existir y estar activa
        zona = (
            self.db.query(Zona)
            .filter(Zona.id == data.zona_id)
            .first()
        )

        if not zona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Zona no encontrada"
            )

        if zona.estado != "ACTIVA":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La zona seleccionada no está activa"
            )

        # Normalizamos el transporte
        transporte = data.transporte.strip().upper()

        if transporte not in self.TRANSPORTES_PERMITIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transporte no válido"
            )

        return self.repository.crear(
            usuario_id=usuario.id,
            zona_id=data.zona_id,
            transporte=transporte
        )

    # =========================
    # OBTENER MI PERFIL
    # =========================

    def obtener_mi_perfil(
        self,
        usuario: Usuario
    ) -> Repartidor:

        repartidor = self.repository.buscar_por_usuario(
            usuario.id
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El usuario no tiene un perfil de repartidor"
            )

        return repartidor

        # =========================
    # INICIAR JORNADA
    # =========================

    def iniciar_jornada(
        self,
        usuario: Usuario
    ) -> Repartidor:

        repartidor = self.obtener_mi_perfil(usuario)

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El perfil de repartidor no está activo"
            )

        if repartidor.disponibilidad != "NO_DISPONIBLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés iniciar la jornada en el estado actual"
            )

        return self.repository.actualizar_disponibilidad(
            repartidor,
            "DISPONIBLE"
        )


    # =========================
    # TERMINAR JORNADA
    # =========================

    def terminar_jornada(
        self,
        usuario: Usuario
    ) -> Repartidor:

        repartidor = self.obtener_mi_perfil(usuario)

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El perfil de repartidor no está activo"
            )

        if repartidor.disponibilidad != "DISPONIBLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés terminar la jornada en el estado actual"
            )

        return self.repository.actualizar_disponibilidad(
            repartidor,
            "NO_DISPONIBLE"
        )

    def obtener_estadisticas(
        self,
        usuario_id: int
    ):
        repartidor = (
            self.repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        ganancias = (
            self.ganancia_repository.listar_por_repartidor(
                repartidor.id
            )
        )

        calificaciones = (
            self.calificacion_repository.listar_por_repartidor(
                repartidor.id
            )
        )

        cantidad_calificaciones = (
            self.calificacion_repository.contar_por_repartidor(
                repartidor.id
            )
        )

        ganancia_total = sum(
            (
                ganancia.monto
                for ganancia in ganancias
            ),
            Decimal("0.00")
        )

        calificacion_promedio = None

        if cantidad_calificaciones > 0:
            suma_puntuaciones = sum(
                calificacion.puntuacion
                for calificacion in calificaciones
            )

            calificacion_promedio = round(
                suma_puntuaciones
                / cantidad_calificaciones,
                2
            )

        return {
            "entregas_completadas": len(ganancias),
            "ganancia_total": ganancia_total,
            "calificacion_promedio": calificacion_promedio,
            "cantidad_calificaciones": cantidad_calificaciones,
            "bono_pendiente": repartidor.bono_pendiente,
        }