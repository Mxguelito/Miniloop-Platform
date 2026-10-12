from decimal import Decimal
import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.pedido import Pedido

from repositories.entrega_repository import EntregaRepository
from repositories.repartidor_repository import RepartidorRepository
from repositories.pedido_repository import PedidoRepository
from repositories.comercio_repository import ComercioRepository
from repositories.incidencia_entrega_repository import (
    IncidenciaEntregaRepository,
)
from repositories.ganancia_repartidor_repository import (
    GananciaRepartidorRepository,
)


class EntregaService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = EntregaRepository(db)
        self.repartidor_repository = RepartidorRepository(db)
        self.pedido_repository = PedidoRepository(db)
        self.comercio_repository = ComercioRepository(db)
        self.incidencia_repository = IncidenciaEntregaRepository(db)
        self.ganancia_repartidor_repository = GananciaRepartidorRepository(db)    

    # =========================
    # GENERAR CÓDIGO
    # =========================

    def _generar_codigo(self) -> str:
        caracteres = string.ascii_uppercase + string.digits

        return "".join(
            secrets.choice(caracteres)
            for _ in range(6)
        )

    # =========================
    # CREAR ENTREGA
    # =========================

    def crear_para_pedido(
        self,
        pedido: Pedido,
        destino: str
    ):
        if pedido.comercio.zona_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El comercio no tiene una zona Delivery configurada"
            )

        destino_limpio = destino.strip()

        if not destino_limpio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La dirección de entrega es obligatoria"
            )

        entrega_existente = self.repository.buscar_por_pedido(
            pedido.id
        )

        if entrega_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este pedido ya tiene una entrega"
            )

        hay_repartidor = (
            self.repartidor_repository.existe_disponible_en_zona(
                pedido.comercio.zona_id
            )
        )

        if not hay_repartidor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay repartidores disponibles en esta zona"
            )

        costo_delivery = Decimal("2000.00")
        ganancia_repartidor = (costo_delivery * Decimal("0.50"))

        codigo_llegada = self._generar_codigo()
        codigo_retiro = self._generar_codigo()
        codigo_final = self._generar_codigo()
        codigo_devolucion = self._generar_codigo()

        return self.repository.crear(
            pedido_id=pedido.id,
            zona_id=pedido.comercio.zona_id,
            destino=destino_limpio,
            costo_delivery=costo_delivery,
            ganancia_repartidor=ganancia_repartidor,
            codigo_llegada=codigo_llegada,
            codigo_retiro=codigo_retiro,
            codigo_final=codigo_final,
            codigo_devolucion=codigo_devolucion
        )

    # =========================
    # LISTAR ENTREGAS DISPONIBLES
    # =========================

    def listar_disponibles_para_repartidor(
        self,
        usuario_id: int
    ):
        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu perfil de repartidor no está activo"
            )

        if repartidor.disponibilidad not in {
            "DISPONIBLE",
            "OCUPADO"
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenés que iniciar tu jornada para ver entregas"
            )

        entregas = self.repository.listar_pendientes_por_zona(
            repartidor.zona_id
        )

        ahora = datetime.now(timezone.utc)
        entregas_disponibles = []
        hubo_cambios = False

        for entrega in entregas:

            # Si todavía no fue publicada por el comercio,
            # no debe aparecer para los repartidores.
            if entrega.fecha_publicacion is None:
                continue

            limite_aceptacion = (
                entrega.fecha_publicacion
                + timedelta(minutes=10)
            )

            # Si vencieron los 10 minutos sin aceptación,
            # deja de publicarse y pasa al fallback.
            if ahora >= limite_aceptacion:
                entrega.estado = "SIN_REPARTIDOR"
                hubo_cambios = True
                continue

            entregas_disponibles.append(entrega)

        if hubo_cambios:
            self.db.commit()

        return entregas_disponibles

    # =========================
    # MI ENTREGA ACTIVA
    # =========================

    def obtener_activa_del_repartidor(
        self,
        usuario_id: int
    ):
        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu perfil de repartidor no está activo"
            )

        return self.repository.buscar_activa_por_repartidor(
            repartidor.id
        )

        # =========================
    # OBTENER ENTREGA POR ID
    # =========================

    def obtener_por_id(
        self,
        entrega_id: int
    ):
        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        return entrega
        # =========================
    # ACEPTAR ENTREGA
    # =========================

    def aceptar(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        try:
            # Bloqueamos al repartidor durante toda la aceptación.
            # Evita que pueda aceptar dos entregas simultáneamente.
            repartidor = (
                self.repartidor_repository.buscar_por_usuario_para_aceptar(
                    usuario_id
                )
            )

            if not repartidor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No tenés un perfil Delivery"
                )

            if repartidor.estado != "ACTIVO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tu perfil de repartidor no está activo"
                )

            # Bloqueamos también la entrega.
            # Evita que dos repartidores acepten la misma.
            entrega = self.repository.buscar_para_aceptar(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            if (
                entrega.estado != "PENDIENTE"
                or entrega.repartidor_id is not None
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Esta entrega ya no está disponible"
                )

            # =========================
            # VENTANA DE ACEPTACIÓN
            # =========================

            # La entrega existe desde que se crea el pedido,
            # pero solamente puede aceptarse después de que
            # el comercio la publique al pasar a PREPARANDO.
            if entrega.fecha_publicacion is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega todavía no fue "
                        "publicada por el comercio"
                    )
                )

            ahora = datetime.now(timezone.utc)

            limite_aceptacion = (
                entrega.fecha_publicacion
                + timedelta(minutes=10)
            )

            # Si ya venció la ventana, nadie puede tomarla.
            if ahora >= limite_aceptacion:
                entrega.estado = "SIN_REPARTIDOR"

                # Este commit es intencional:
                # queremos persistir el vencimiento aunque
                # después respondamos con HTTP 409.
                self.db.commit()
                self.db.refresh(entrega)

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La ventana de 10 minutos para "
                        "aceptar esta entrega ya venció"
                    )
                )

            # Un repartidor OCUPADO puede ver trabajos,
            # pero solamente uno DISPONIBLE puede aceptar.
            if repartidor.disponibilidad != "DISPONIBLE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No estás disponible para aceptar entregas"
                )

            if repartidor.zona_id != entrega.zona_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Esta entrega no pertenece a tu zona"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            # Solo puede aceptarse cuando el comercio
            # ya comenzó a preparar el pedido.
            if pedido.estado not in {
                "PREPARANDO",
                "LISTO"
            }:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega todavía no está "
                        "disponible para ser aceptada"
                    )
                )

            # No puede entregar su propio pedido.
            if pedido.usuario_id == usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "No podés aceptar una entrega "
                        "de tu propio pedido"
                    )
                )

            # Tampoco puede repartir pedidos
            # pertenecientes a un comercio propio.
            es_propietario = (
                self.comercio_repository.es_propietario(
                    comercio_id=pedido.comercio_id,
                    usuario_id=usuario_id
                )
            )

            if es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "No podés aceptar una entrega "
                        "de un comercio propio"
                    )
                )

            # =========================
            # ASIGNAR ENTREGA
            # =========================

            entrega.repartidor_id = repartidor.id
            entrega.estado = "ASIGNADA"

            # Guardamos exactamente cuándo fue aceptada.
            entrega.fecha_asignacion = datetime.now(
                timezone.utc
            )

            # El repartidor queda ocupado.
            repartidor.disponibilidad = "OCUPADO"

            # Entrega + repartidor se confirman juntos.
            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(repartidor)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos aceptar la entrega"
            )

            # =========================
    # EXTENDER LLEGADA AL COMERCIO
    # =========================

    def extender_llegada_comercio(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        try:
            repartidor = (
                self.repartidor_repository.buscar_por_usuario(
                    usuario_id
                )
            )

            if not repartidor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No tenés un perfil Delivery"
                )

            if repartidor.estado != "ACTIVO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tu perfil de repartidor no está activo"
                )

            # Bloqueamos la entrega para evitar dos
            # extensiones simultáneas desde distintos dispositivos.
            entrega = self.repository.buscar_para_liberar(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            if entrega.repartidor_id != repartidor.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Esta entrega no está asignada a vos"
                )

            # La extensión solamente tiene sentido mientras
            # todavía está viajando hacia el comercio.
            if entrega.estado != "ASIGNADA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La extensión solamente puede usarse "
                        "antes de llegar al comercio"
                    )
                )

            if not entrega.fecha_asignacion:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La entrega no tiene horario de asignación"
                )

            if entrega.extension_llegada_usada == 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Ya utilizaste la extensión "
                        "de esta entrega"
                    )
                )

            ahora = datetime.now(timezone.utc)

            limite_inicial = (
                entrega.fecha_asignacion
                + timedelta(minutes=15)
            )

            # RN-D101:
            # no puede pedir la extensión antes de que
            # terminen los primeros 15 minutos.
            if ahora < limite_inicial:
                minutos_restantes = max(
                    1,
                    int(
                        (
                            limite_inicial - ahora
                        ).total_seconds() / 60
                    ) + 1
                )

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Todavía no podés extender el tiempo. "
                        f"Faltan aproximadamente "
                        f"{minutos_restantes} minuto(s)"
                    )
                )

            limite_final = (
                entrega.fecha_asignacion
                + timedelta(minutes=30)
            )

            # RN-D103:
            # una vez superados los 30 minutos,
            # ya no existe posibilidad de extensión.
            if ahora >= limite_final:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Ya venció el tiempo máximo de "
                        "30 minutos para llegar al comercio"
                    )
                )

            # RN-D102:
            # consume su única extensión.
            entrega.extension_llegada_usada = 1

            self.db.commit()
            self.db.refresh(entrega)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos extender el tiempo de llegada"
            )
        # =========================
    # LLEGAR AL COMERCIO
    # =========================

    def llegar_al_comercio(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        try:
            repartidor = (
                self.repartidor_repository.buscar_por_usuario(
                    usuario_id
                )
            )

            if not repartidor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No tenés un perfil Delivery"
                )

            if repartidor.estado != "ACTIVO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tu perfil de repartidor no está activo"
                )

            # Bloqueamos la entrega para que el control
            # del tiempo y el cambio de estado sean atómicos.
            entrega = self.repository.buscar_para_liberar(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            if entrega.repartidor_id != repartidor.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Esta entrega no está asignada a vos"
                )

            if entrega.estado != "ASIGNADA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La entrega no está en estado ASIGNADA"
                )

            if not entrega.fecha_asignacion:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La entrega no tiene horario de asignación"
                )

            ahora = datetime.now(timezone.utc)

            limite_inicial = (
                entrega.fecha_asignacion
                + timedelta(minutes=15)
            )

            limite_final = (
                entrega.fecha_asignacion
                + timedelta(minutes=30)
            )

            # =========================
            # ENTRE 15 Y 30 MINUTOS
            # =========================

            if (
                ahora >= limite_inicial
                and ahora < limite_final
                and entrega.extension_llegada_usada == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Venció el tiempo inicial de 15 minutos. "
                        "Tenés que extender el plazo o liberar la entrega"
                    )
                )

            # =========================
            # MÁS DE 30 MINUTOS
            # =========================

            if ahora >= limite_final:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Venció el tiempo máximo de 30 minutos. "
                        "La entrega debe ser liberada o reportada"
                    )
                )

            # =========================
            # LLEGADA CORRECTA
            # =========================

            entrega.estado = "EN_COMERCIO"

            # Fecha histórica e inmutable.
            entrega.fecha_llegada_comercio = ahora

            self.db.commit()
            self.db.refresh(entrega)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos registrar la llegada al comercio"
            )


    def obtener_codigo_llegada(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        # =========================
        # VALIDAR REPARTIDOR
        # =========================

        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu perfil de repartidor no está activo"
            )

        # El código solamente puede verlo
        # el repartidor asignado a esta entrega.
        if entrega.repartidor_id != repartidor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No podés ver el código de esta entrega"
            )

        # =========================
        # VALIDAR ETAPA
        # =========================

        # El repartidor primero debe haber marcado
        # que llegó físicamente al comercio.
        if entrega.estado != "EN_COMERCIO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "El código de llegada solamente está "
                    "disponible al llegar al comercio"
                )
            )

        return {
            "entrega_id": entrega.id,
            "codigo_llegada": entrega.codigo_llegada
        }
    # =========================
    # CONFIRMAR LLEGADA
    # =========================

    def confirmar_llegada(
        self,
        entrega_id: int,
        usuario_id: int,
        codigo: str
    ):
        try:
            entrega = (
                self.repository.buscar_para_confirmar_llegada(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            es_propietario = (
                self.comercio_repository.es_propietario(
                    comercio_id=pedido.comercio_id,
                    usuario_id=usuario_id
                )
            )

            if not es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No podés confirmar la llegada de esta entrega"
                )

            # Si el código ya alcanzó los 3 intentos,
            # no permitimos nuevos intentos.
            if entrega.intentos_codigo_llegada >= 3:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=(
                        "Código de llegada bloqueado "
                        "por demasiados intentos"
                    )
                )

            if entrega.estado != "EN_COMERCIO":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega no está esperando "
                        "confirmación de llegada"
                    )
                )

            codigo_limpio = codigo.strip().upper()

            if codigo_limpio != entrega.codigo_llegada:
                entrega.intentos_codigo_llegada += 1

                intentos_restantes = (
                    3 - entrega.intentos_codigo_llegada
                )

                # Tercer intento incorrecto:
                # bloqueamos la entrega y generamos una incidencia.
                if intentos_restantes <= 0:
                    entrega.estado = "BLOQUEADA_CODIGO_LLEGADA"

                    self.incidencia_repository.crear(
                        entrega_id=entrega.id,
                        usuario_id=usuario_id,
                        tipo="CODIGO_LLEGADA_BLOQUEADO",
                        descripcion=(
                            "El código de llegada fue bloqueado "
                            "después de 3 intentos incorrectos."
                        )
                    )

                    self.db.commit()
                    self.db.refresh(entrega)

                    raise HTTPException(
                        status_code=status.HTTP_423_LOCKED,
                        detail=(
                            "Código de llegada bloqueado "
                            "por demasiados intentos"
                        )
                    )

                # Intento 1 o 2.
                self.db.commit()
                self.db.refresh(entrega)

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Código incorrecto. "
                        f"Quedan {intentos_restantes} intentos"
                    )
                )

            # Código correcto.
            entrega.estado = "LLEGADA_CONFIRMADA"
            entrega.fecha_llegada_confirmada = datetime.now(timezone.utc)

            self.db.commit()
            self.db.refresh(entrega)

            return entrega

        except HTTPException:
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos confirmar la llegada"
            )

    def obtener_codigo_retiro(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        # =========================
        # VALIDAR REPARTIDOR
        # =========================

        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu perfil de repartidor no está activo"
            )

        if entrega.repartidor_id != repartidor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No podés ver el código de esta entrega"
            )

        # =========================
        # VALIDAR ENTREGA
        # =========================

        if entrega.estado != "LLEGADA_CONFIRMADA":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "La llegada al comercio todavía "
                    "no está confirmada"
                )
            )

        # =========================
        # VALIDAR PEDIDO
        # =========================

        pedido = self.pedido_repository.buscar_por_id(
            entrega.pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido asociado no encontrado"
            )

        # RN-D35:
        # el código de retiro solamente se revela
        # cuando el comercio terminó de preparar el pedido.
        if pedido.estado != "LISTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "El código de retiro estará disponible "
                    "cuando el pedido esté listo"
                )
            )

        return {
            "entrega_id": entrega.id,
            "codigo_retiro": entrega.codigo_retiro
        }
    # =========================
    # CONFIRMAR RETIRO
    # =========================

    def confirmar_retiro(
        self,
        entrega_id: int,
        usuario_id: int,
        codigo: str
    ):
        try:
            entrega = (
                self.repository.buscar_para_confirmar_retiro(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            es_propietario = (
                self.comercio_repository.es_propietario(
                    comercio_id=pedido.comercio_id,
                    usuario_id=usuario_id
                )
            )

            if not es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No podés confirmar el retiro de esta entrega"
                )

            # Si ya alcanzó los 3 intentos,
            # no permitimos nuevos intentos.
            if entrega.intentos_codigo_retiro >= 3:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=(
                        "Código de retiro bloqueado "
                        "por demasiados intentos"
                    )
                )

            if entrega.estado != "LLEGADA_CONFIRMADA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La llegada todavía no está confirmada"
                )

            codigo_limpio = codigo.strip().upper()

            if codigo_limpio != entrega.codigo_retiro:
                entrega.intentos_codigo_retiro += 1

                intentos_restantes = (
                    3 - entrega.intentos_codigo_retiro
                )

                # Tercer intento incorrecto:
                # bloqueamos la entrega y generamos una incidencia.
                if intentos_restantes <= 0:
                    entrega.estado = "BLOQUEADA_CODIGO_RETIRO"

                    self.incidencia_repository.crear(
                        entrega_id=entrega.id,
                        usuario_id=usuario_id,
                        tipo="CODIGO_RETIRO_BLOQUEADO",
                        descripcion=(
                            "El código de retiro fue bloqueado "
                            "después de 3 intentos incorrectos."
                        )
                    )

                    self.db.commit()
                    self.db.refresh(entrega)

                    raise HTTPException(
                        status_code=status.HTTP_423_LOCKED,
                        detail=(
                            "Código de retiro bloqueado "
                            "por demasiados intentos"
                        )
                    )

                # Intento 1 o 2.
                self.db.commit()
                self.db.refresh(entrega)

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Código incorrecto. "
                        f"Quedan {intentos_restantes} intentos"
                    )
                )

            # Código correcto:
            # el producto pasa formalmente a custodia del repartidor.
            entrega.estado = "RETIRADO"
            entrega.fecha_retiro = datetime.now(timezone.utc)

            self.db.commit()
            self.db.refresh(entrega)

            return entrega

        except HTTPException:
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos confirmar el retiro"
            )
    # =========================
    # INICIAR CAMINO AL CLIENTE
    # =========================

    def iniciar_camino(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu perfil de repartidor no está activo"
            )

        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        if entrega.repartidor_id != repartidor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Esta entrega no está asignada a vos"
            )

        if entrega.estado != "RETIRADO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "La entrega todavía no está lista "
                    "para iniciar el viaje"
                )
            )

        entrega.estado = "EN_CAMINO"
        entrega.fecha_en_camino = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(entrega)

        return entrega

    # =========================
    # LLEGAR AL CLIENTE
    # =========================

    def llegar_al_cliente(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu perfil de repartidor no está activo"
            )

        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        if entrega.repartidor_id != repartidor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Esta entrega no está asignada a vos"
            )

        if entrega.estado != "EN_CAMINO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La entrega no está en camino"
            )

        entrega.estado = "ESPERANDO_AL_CLIENTE"
        entrega.fecha_llegada_cliente = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(entrega)

        return entrega


    def iniciar_devolucion(
        self,
    entrega_id: int,
    usuario_id: int
     ):
         repartidor = (
       self.repartidor_repository.buscar_por_usuario(
            usuario_id
        )
    )

         if not repartidor:
          raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tenés un perfil Delivery"
        )

         if repartidor.estado != "ACTIVO":
          raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu perfil de repartidor no está activo"
        )
 
         entrega = self.repository.buscar_por_id(
          entrega_id
    )

         if not entrega:
          raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrega no encontrada"
        )

         if entrega.repartidor_id != repartidor.id:
          raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta entrega no está asignada a vos"
        )

         if entrega.estado != "ESPERANDO_AL_CLIENTE":
          raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
           detail="La entrega no está esperando al cliente"
          )

         if not entrega.fecha_llegada_cliente:
          raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
          detail="No existe un horario de llegada al cliente"
            )

         ahora = datetime.now(timezone.utc)
         limite_espera = entrega.fecha_llegada_cliente + timedelta(minutes=10)

         if ahora < limite_espera:
          minutos_restantes = max(
         1,
         int(
            (
                limite_espera - ahora
            ).total_seconds() / 60
        ) + 1
    )

          raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=(
            f"Tenés que esperar al cliente. "
            f"Faltan aproximadamente {minutos_restantes} minuto(s)"
        )
    )

         entrega.estado = "EN_DEVOLUCION"

         self.db.commit()
         self.db.refresh(entrega)

         return entrega

    def llegar_devolucion_al_comercio(
    self,
    entrega_id: int,
    usuario_id: int
):
     repartidor = (
        self.repartidor_repository.buscar_por_usuario(
            usuario_id
        )
    )

     if not repartidor:
              raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tenés un perfil Delivery"
        )

     if repartidor.estado != "ACTIVO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu perfil de repartidor no está activo"
        )

     entrega = self.repository.buscar_por_id(
     entrega_id
    )

     if not entrega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrega no encontrada"
        )

     if entrega.repartidor_id != repartidor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta entrega no está asignada a vos"
        )

     if entrega.estado != "EN_DEVOLUCION":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La entrega no está en devolución"
        )

     entrega.estado = "DEVOLUCION_EN_COMERCIO"

     self.db.commit()
     self.db.refresh(entrega)

     return entrega


    

    def obtener_codigo_final(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        # =========================
        # VALIDAR PEDIDO
        # =========================

        pedido = self.pedido_repository.buscar_por_id(
            entrega.pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido asociado no encontrado"
            )

        # El código final solamente puede verlo
        # el cliente dueño del pedido.
        if pedido.usuario_id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No podés ver el código final de esta entrega"
            )

        # =========================
        # VALIDAR ETAPA
        # =========================

        # RN-D36:
        # el código final se revela solamente
        # después de que el pedido fue retirado
        # y comenzó el viaje hacia el cliente.
        if entrega.estado not in {
            "EN_CAMINO",
            "ESPERANDO_AL_CLIENTE"
        }:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "El código final todavía "
                    "no está disponible"
                )
            )

        return {
            "entrega_id": entrega.id,
            "codigo_final": entrega.codigo_final
        }

        # =========================
    # CONFIRMAR ENTREGA FINAL
    # =========================

    def confirmar_final(
        self,
        entrega_id: int,
        usuario_id: int,
        codigo: str
    ):
        try:
            # Bloqueamos la entrega durante la confirmación.
            entrega = (
                self.repository.buscar_para_confirmar_final(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            # =========================
            # CONTROL DE INTENTOS
            # =========================

            if entrega.intentos_codigo_final >= 3:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=(
                        "Código final bloqueado "
                        "por demasiados intentos"
                    )
                )

            if entrega.estado != "ESPERANDO_AL_CLIENTE":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La entrega no está esperando al cliente"
                )

            # =========================
            # PEDIDO
            # =========================

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

           

            # =========================
            # REPARTIDOR
            # =========================

            if entrega.repartidor_id is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La entrega no tiene un repartidor asignado"
                )

            repartidor = (
                self.repartidor_repository.buscar_por_id(
                    entrega.repartidor_id
                )
            )

            # =========================
#        VALIDAR REPARTIDOR ASIGNADO
# =========================

            repartidor_actual = (
            self.repartidor_repository.buscar_por_usuario(
             usuario_id
             )
               )

            if not repartidor_actual:
             raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tenés un perfil Delivery"
    )

            if repartidor_actual.estado != "ACTIVO":
             raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Tu perfil de repartidor no está activo"
    )

            if repartidor_actual.id != entrega.repartidor_id:
             raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Esta entrega no está asignada a vos"
    )

            if not repartidor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Repartidor asociado no encontrado"
                )

            # =========================
            # VALIDAR CÓDIGO FINAL
            # =========================

            codigo_limpio = codigo.strip().upper()

            if codigo_limpio != entrega.codigo_final:
                entrega.intentos_codigo_final += 1

                intentos_restantes = (
                    3 - entrega.intentos_codigo_final
                )

                if intentos_restantes <= 0:
                    entrega.estado = "BLOQUEADA_CODIGO_FINAL"

                    self.incidencia_repository.crear(
                        entrega_id=entrega.id,
                        usuario_id=usuario_id,
                        tipo="CODIGO_FINAL_BLOQUEADO",
                        descripcion=(
                            "El código final fue bloqueado "
                            "después de 3 intentos incorrectos."
                        )
                    )

                    self.db.commit()
                    self.db.refresh(entrega)

                    raise HTTPException(
                        status_code=status.HTTP_423_LOCKED,
                        detail=(
                            "Código final bloqueado "
                            "por demasiados intentos"
                        )
                    )

                self.db.commit()
                self.db.refresh(entrega)

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Código incorrecto. "
                        f"Quedan {intentos_restantes} intentos"
                    )
                )

            # =========================
            # INCIDENCIAS ABIERTAS
            # =========================

            tiene_incidencia_abierta = (
                self.incidencia_repository.existe_abierta_por_entrega(
                    entrega.id
                )
            )

            if tiene_incidencia_abierta:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega tiene una incidencia abierta. "
                        "Debe ser resuelta por un Super Admin "
                        "antes de completar la operación."
                    )
                )

            # =========================
            # EVITAR DOBLE GANANCIA
            # =========================

            ganancia_existente = (
                self.ganancia_repartidor_repository.buscar_por_entrega(
                    entrega.id
                )
            )

            if ganancia_existente:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La ganancia de esta entrega "
                        "ya fue registrada"
                    )
                )

            # =========================
            # CALCULAR GANANCIA
            # =========================

            ganancia_final = (
                entrega.ganancia_repartidor
                + repartidor.bono_pendiente
            )

            # =========================
            # REGISTRAR GANANCIA
            # =========================

            self.ganancia_repartidor_repository.crear(
                repartidor_id=repartidor.id,
                entrega_id=entrega.id,
                monto=ganancia_final
            )

            # Consumimos el bono pendiente.
            repartidor.bono_pendiente = Decimal("0.00")

            # =========================
            # CERRAR ENTREGA
            # =========================

            entrega.estado = "ENTREGADO"
            entrega.fecha_entregado = datetime.now(
                timezone.utc
            )

            pedido.estado = "ENTREGADO"
            repartidor.disponibilidad = "DISPONIBLE"

            # Todo se confirma en una sola transacción.
            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(pedido)
            self.db.refresh(repartidor)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos completar la entrega"
            )
        # =========================
    # LIBERAR ENTREGA
    # =========================

    def liberar(
        self,
        entrega_id: int,
        usuario_id: int,
        motivo: str
    ):
        motivo_limpio = motivo.strip().upper()

        if not motivo_limpio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El motivo de liberación es obligatorio"
            )

        try:
            entrega = self.repository.buscar_para_liberar(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            repartidor = (
                self.repartidor_repository.buscar_por_usuario(
                    usuario_id
                )
            )

            if not repartidor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No tenés un perfil Delivery"
                )

            if repartidor.estado != "ACTIVO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tu perfil de repartidor no está activo"
                )

            if entrega.repartidor_id != repartidor.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Esta entrega no está asignada a vos"
                )

            estados_liberables = {
                "ASIGNADA",
                "EN_COMERCIO",
                "LLEGADA_CONFIRMADA"
            }

            if entrega.estado not in estados_liberables:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega ya no puede liberarse "
                        "por el flujo normal"
                    )
                )

            # =========================
            # DEMORA DEL COMERCIO
            # =========================
            #
            # RN-D51:
            # El repartidor solamente puede liberar por
            # DEMORA_COMERCIO después de 20 minutos desde
            # la confirmación de llegada.

            if motivo_limpio == "DEMORA_COMERCIO":

                if entrega.estado != "LLEGADA_CONFIRMADA":
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "La demora del comercio solamente puede "
                            "informarse después de confirmar la llegada"
                        )
                    )

                if not entrega.fecha_llegada_confirmada:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "No existe una fecha de llegada "
                            "confirmada al comercio"
                        )
                    )

                ahora = datetime.now(timezone.utc)

                limite_demora = (
                    entrega.fecha_llegada_confirmada
                    + timedelta(minutes=20)
                )

                if ahora < limite_demora:
                    minutos_restantes = max(
                        1,
                        int(
                            (
                                limite_demora - ahora
                            ).total_seconds() / 60
                        ) + 1
                    )

                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "Todavía no se cumplió el tiempo de espera "
                            "por demora del comercio. "
                            f"Faltan aproximadamente "
                            f"{minutos_restantes} minuto(s)"
                        )
                    )

            # =========================
            # MÁXIMO DE LIBERACIONES
            # =========================

            if entrega.cantidad_liberaciones >= 2:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega alcanzó el máximo "
                        "de liberaciones permitidas"
                    )
                )

            # =========================
            # REGISTRAR LIBERACIÓN
            # =========================

            entrega.repartidor_id = None
            entrega.cantidad_liberaciones += 1
            entrega.motivo_ultima_liberacion = motivo_limpio

            # =========================
            # PRIMERA LIBERACIÓN
            # =========================
            #
            # RN-D48:
            # vuelve a publicarse y comienza una ventana
            # NUEVA de 10 minutos.

            if entrega.cantidad_liberaciones < 2:
                entrega.estado = "PENDIENTE"

                entrega.fecha_publicacion = datetime.now(
                    timezone.utc
                )

            # =========================
            # SEGUNDA LIBERACIÓN
            # =========================
            #
            # RN-D49:
            # ya no vuelve a publicarse.
            # El cliente deberá elegir RETIRO o CANCELAR.

            else:
                entrega.estado = "SIN_REPARTIDOR"

            # =========================
            # LIBERAR REPARTIDOR
            # =========================

            repartidor.disponibilidad = "DISPONIBLE"

            # Entrega + repartidor se guardan
            # en una única transacción.
            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(repartidor)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos liberar la entrega"
            )



        # =========================
    # RESOLVER SIN REPARTIDOR
    # =========================

    def resolver_sin_repartidor(
        self,
        entrega_id: int,
        usuario_id: int,
        opcion: str
    ):
        opcion_limpia = opcion.strip().upper()

        if opcion_limpia not in {"RETIRO", "CANCELAR"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La opción debe ser RETIRO o CANCELAR"
            )

        try:
            entrega = self.repository.buscar_para_liberar(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            # Solamente el cliente dueño del pedido
            # puede decidir qué hacer.
            if pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No podés resolver esta entrega"
                )

            if entrega.estado != "SIN_REPARTIDOR":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega no está esperando "
                        "una decisión del cliente"
                    )
                )

            # =========================
            # OPCIÓN: CANCELAR
            # =========================

            if opcion_limpia == "CANCELAR":

                # Restauramos TODO el stock reservado
                # por el pedido.
                for item in pedido.items:
                    item.producto.stock += item.cantidad

                pedido.estado = "CANCELADO"
                entrega.estado = "CANCELADA"

                self.db.commit()

                self.db.refresh(pedido)
                self.db.refresh(entrega)

                return entrega

            # =========================
            # OPCIÓN: RETIRO
            # =========================

            # La entrega sale definitivamente
            # del circuito Delivery.
            entrega.estado = "CONVERTIDA_A_RETIRO"

           # El pedido continúa activo,
# pero ahora lo retira el cliente.
            pedido.tipo_entrega = "RETIRO"

# RN-D45:
# al convertirse a RETIRO, el cliente
# deja de pagar el costo de Delivery.
            pedido.total -= entrega.costo_delivery

            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(pedido)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos resolver la entrega"
            )

    def obtener_codigo_devolucion(
        self,
        entrega_id: int,
        usuario_id: int
    ):
        entrega = self.repository.buscar_por_id(
            entrega_id
        )

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        # =========================
        # VALIDAR REPARTIDOR
        # =========================

        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu perfil de repartidor no está activo"
            )

        # Solamente el repartidor que está realizando
        # esta entrega puede ver el código.
        if entrega.repartidor_id != repartidor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No podés ver el código de devolución "
                    "de esta entrega"
                )
            )

        # =========================
        # VALIDAR ETAPA
        # =========================

        # El código se muestra cuando el repartidor
        # ya regresó físicamente al comercio.
        if entrega.estado != "DEVOLUCION_EN_COMERCIO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "El código de devolución todavía "
                    "no está disponible"
                )
            )

        return {
            "entrega_id": entrega.id,
            "codigo_devolucion": entrega.codigo_devolucion
        }


    def confirmar_devolucion(
        self,
        entrega_id: int,
        usuario_id: int,
        codigo: str
    ):
        try:
            entrega = (
                self.repository.buscar_para_confirmar_devolucion(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            es_propietario = (
                self.comercio_repository.es_propietario(
                    comercio_id=pedido.comercio_id,
                    usuario_id=usuario_id
                )
            )

            if not es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "No podés confirmar la devolución "
                        "de este comercio"
                    )
                )

            # Si ya alcanzó los 3 intentos,
            # no permitimos nuevos intentos.
            if entrega.intentos_codigo_devolucion >= 3:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="El código de devolución está bloqueado"
                )

            if entrega.estado != "DEVOLUCION_EN_COMERCIO":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega no está esperando "
                        "confirmación de devolución"
                    )
                )

            codigo_ingresado = codigo.strip().upper()

            if codigo_ingresado != entrega.codigo_devolucion:
                entrega.intentos_codigo_devolucion += 1

                intentos_restantes = (
                    3 - entrega.intentos_codigo_devolucion
                )

                # Tercer intento incorrecto:
                # bloqueamos la devolución y generamos una incidencia.
                if intentos_restantes <= 0:
                    entrega.estado = "BLOQUEADA_CODIGO_DEVOLUCION"

                    self.incidencia_repository.crear(
                        entrega_id=entrega.id,
                        usuario_id=usuario_id,
                        tipo="CODIGO_DEVOLUCION_BLOQUEADO",
                        descripcion=(
                            "El código de devolución fue bloqueado "
                            "después de 3 intentos incorrectos."
                        )
                    )

                    self.db.commit()
                    self.db.refresh(entrega)

                    raise HTTPException(
                        status_code=status.HTTP_423_LOCKED,
                        detail=(
                            "Código incorrecto. "
                            "La devolución quedó bloqueada"
                        )
                    )

                # Intento 1 o 2.
                self.db.commit()
                self.db.refresh(entrega)

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Código de devolución incorrecto. "
                        f"Quedan {intentos_restantes} intentos"
                    )
                )

            # Código correcto.
            # Todavía NO restauramos stock:
            # primero el comercio debe revisar el estado del pedido.
            entrega.estado = "DEVOLUCION_CONFIRMADA"

            self.db.commit()
            self.db.refresh(entrega)

            return entrega

        except HTTPException:
            # Los commits de intentos/bloqueo ya quedaron persistidos.
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos confirmar la devolución"
            )

    def inspeccionar_devolucion(
        self,
        entrega_id: int,
        usuario_id: int,
        resultado: str
    ):
        try:
            resultado_normalizado = resultado.strip().upper()

            if resultado_normalizado not in {"OK", "PROBLEMA"}:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El resultado debe ser OK o PROBLEMA"
                )

            entrega = (
                self.repository.buscar_para_confirmar_devolucion(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            es_propietario = (
                self.comercio_repository.es_propietario(
                    comercio_id=pedido.comercio_id,
                    usuario_id=usuario_id
                )
            )

            if not es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No podés inspeccionar esta devolución"
                )

            if entrega.estado != "DEVOLUCION_CONFIRMADA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La devolución todavía no puede "
                        "ser inspeccionada"
                    )
                )

            # =========================
            # DEVOLUCIÓN CON PROBLEMA
            # =========================

            if resultado_normalizado == "PROBLEMA":
                entrega.estado = "DEVOLUCION_CON_PROBLEMA"

                self.incidencia_repository.crear(
                    entrega_id=entrega.id,
                    usuario_id=usuario_id,
                    tipo="DEVOLUCION_CON_PROBLEMA",
                    descripcion=(
                        "El comercio informó que el pedido devuelto "
                        "presenta un problema y requiere revisión."
                    )
                )

                self.db.commit()
                self.db.refresh(entrega)

                return entrega

            # =========================
            # DEVOLUCIÓN CORRECTA
            # =========================

            # El pedido volvió correctamente al comercio,
            # por lo tanto restauramos el stock reservado.
            for item in pedido.items:
                item.producto.stock += item.cantidad

            entrega.estado = "DEVUELTO"
            pedido.estado = "CANCELADO"

            # =========================
            # REPARTIDOR
            # =========================

            repartidor = None

            if entrega.repartidor_id is not None:
                repartidor = (
                    self.repartidor_repository.buscar_por_id(
                        entrega.repartidor_id
                    )
                )

            if repartidor:
                # Finalizó la devolución y vuelve a estar disponible.
                repartidor.disponibilidad = "DISPONIBLE"

                # =========================
                # BONO POR DEVOLUCIÓN
                # =========================
                #
                # RN-D57:
                # bono = 25% de la tarifa Delivery.
                #
                # RN-D58:
                # los bonos NO se acumulan.
                # Si ya existe uno pendiente, lo conservamos.

                if repartidor.bono_pendiente == Decimal("0.00"):
                    repartidor.bono_pendiente = (
                        entrega.costo_delivery
                        * Decimal("0.25")
                    )

            # Stock + entrega + pedido + repartidor + bono
            # se confirman en una única transacción.
            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(pedido)

            if repartidor:
                self.db.refresh(repartidor)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "No pudimos registrar la inspección "
                    "de la devolución"
                )
            )

    def regenerar_codigo_admin(
        self,
        entrega_id: int
    ):
        try:
            entrega = (
                self.repository.buscar_para_regenerar_codigo(
                    entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            # Cada estado bloqueado conoce:
            # - qué tipo de incidencia lo originó
            # - a qué estado debe regresar
            configuracion_bloqueo = {
                "BLOQUEADA_CODIGO_LLEGADA": {
                    "tipo": "CODIGO_LLEGADA_BLOQUEADO",
                    "estado_restaurado": "EN_COMERCIO",
                },
                "BLOQUEADA_CODIGO_RETIRO": {
                    "tipo": "CODIGO_RETIRO_BLOQUEADO",
                    "estado_restaurado": "LLEGADA_CONFIRMADA",
                },
                "BLOQUEADA_CODIGO_FINAL": {
                    "tipo": "CODIGO_FINAL_BLOQUEADO",
                    "estado_restaurado": "ESPERANDO_AL_CLIENTE",
                },
                "BLOQUEADA_CODIGO_DEVOLUCION": {
                    "tipo": "CODIGO_DEVOLUCION_BLOQUEADO",
                    "estado_restaurado": "DEVOLUCION_EN_COMERCIO",
                },
            }

            configuracion = configuracion_bloqueo.get(
                entrega.estado
            )

            if not configuracion:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega no tiene un código "
                        "bloqueado para regenerar"
                    )
                )

            # Buscamos SOLAMENTE la incidencia correspondiente
            # al código que estamos regenerando.
            incidencia = (
                self.incidencia_repository
                .buscar_abierta_por_entrega_y_tipo(
                    entrega_id=entrega.id,
                    tipo=configuracion["tipo"]
                )
            )

            if not incidencia:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "No existe una incidencia abierta "
                        "para este bloqueo de código"
                    )
                )

            # =========================
            # REGENERAR CÓDIGO
            # =========================

            if entrega.estado == "BLOQUEADA_CODIGO_LLEGADA":
                entrega.codigo_llegada = self._generar_codigo()
                entrega.intentos_codigo_llegada = 0

            elif entrega.estado == "BLOQUEADA_CODIGO_RETIRO":
                entrega.codigo_retiro = self._generar_codigo()
                entrega.intentos_codigo_retiro = 0

            elif entrega.estado == "BLOQUEADA_CODIGO_FINAL":
                entrega.codigo_final = self._generar_codigo()
                entrega.intentos_codigo_final = 0

            elif entrega.estado == "BLOQUEADA_CODIGO_DEVOLUCION":
                entrega.codigo_devolucion = self._generar_codigo()
                entrega.intentos_codigo_devolucion = 0

            # Restauramos exactamente la etapa anterior al bloqueo.
            entrega.estado = configuracion["estado_restaurado"]

            # Cerramos únicamente la incidencia que fue solucionada.
            self.incidencia_repository.cerrar(
                incidencia=incidencia,
                resolucion="CODIGO_REGENERADO"
            )

            # Código + intentos + estado + incidencia
            # quedan confirmados juntos.
            self.db.commit()

            self.db.refresh(entrega)
            self.db.refresh(incidencia)

            return entrega

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()
            raise


    def listar_incidencias_abiertas(self):
        return self.incidencia_repository.listar_abiertas()

    def resolver_incidencia_admin(
        self,
        incidencia_id: int,
        resolucion: str
    ):
        try:
            # Bloqueamos la incidencia para evitar
            # dos resoluciones administrativas simultáneas.
            incidencia = (
                self.incidencia_repository.buscar_para_resolver(
                    incidencia_id
                )
            )

            if not incidencia:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Incidencia no encontrada"
                )

            if incidencia.estado != "ABIERTA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La incidencia ya fue resuelta"
                )

            resolucion_limpia = resolucion.strip().upper()

            resoluciones_permitidas = {
                "CERRAR_SIN_ACCION",
                "DEVOLUCION_OK",
                "DEVOLUCION_CON_PERDIDA",
            }

            if resolucion_limpia not in resoluciones_permitidas:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Resolución administrativa no válida"
                )

            # =========================
            # CERRAR SIN ACCIÓN
            # =========================

            if resolucion_limpia == "CERRAR_SIN_ACCION":
                incidencia = self.incidencia_repository.cerrar(
                    incidencia=incidencia,
                    resolucion=resolucion_limpia
                )

                self.db.commit()
                self.db.refresh(incidencia)

                return incidencia

            # =========================
            # RESOLUCIONES DE DEVOLUCIÓN
            # =========================

            # Estas resoluciones solamente son válidas
            # para una incidencia de devolución problemática.
            if incidencia.tipo != "DEVOLUCION_CON_PROBLEMA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta resolución solamente puede aplicarse "
                        "a una devolución con problema"
                    )
                )

            # Bloqueamos también la entrega.
            entrega = (
                self.repository.buscar_para_regenerar_codigo(
                    incidencia.entrega_id
                )
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega asociada no encontrada"
                )

            if entrega.estado != "DEVOLUCION_CON_PROBLEMA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega ya no está esperando "
                        "resolución administrativa de devolución"
                    )
                )

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            repartidor = None

            if entrega.repartidor_id is not None:
                repartidor = (
                    self.repartidor_repository.buscar_por_id(
                        entrega.repartidor_id
                    )
                )

            # =========================
            # DEVOLUCIÓN OK
            # =========================
            #
            # El administrador verificó que los productos
            # regresaron correctamente al comercio.
            # Recién acá restauramos el stock.

            if resolucion_limpia == "DEVOLUCION_OK":

                for item in pedido.items:
                    item.producto.stock += item.cantidad

                entrega.estado = "DEVUELTO"
                pedido.estado = "CANCELADO"

                if repartidor:
                    repartidor.disponibilidad = "DISPONIBLE"

                    # Mantenemos la misma regla del flujo normal:
                    # 25% de la tarifa y sin acumulación.
                    if repartidor.bono_pendiente == Decimal("0.00"):
                        repartidor.bono_pendiente = (
                            entrega.costo_delivery
                            * Decimal("0.25")
                        )

            # =========================
            # DEVOLUCIÓN CON PÉRDIDA
            # =========================
            #
            # El pedido vuelve a cerrarse, pero NO restauramos
            # stock porque MiniLoop no puede afirmar que los
            # productos regresaron en condiciones vendibles.

            elif resolucion_limpia == "DEVOLUCION_CON_PERDIDA":

                entrega.estado = "DEVUELTO"
                pedido.estado = "CANCELADO"

                if repartidor:
                    repartidor.disponibilidad = "DISPONIBLE"

            # =========================
            # CERRAR INCIDENCIA
            # =========================

            incidencia = self.incidencia_repository.cerrar(
                incidencia=incidencia,
                resolucion=resolucion_limpia
            )

            # Stock (si corresponde) + pedido + entrega
            # + repartidor + incidencia se guardan juntos.
            self.db.commit()

            self.db.refresh(incidencia)
            self.db.refresh(entrega)
            self.db.refresh(pedido)

            if repartidor:
                self.db.refresh(repartidor)

            return incidencia

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()
            raise


    def reportar_incidencia(
        self,
        entrega_id: int,
        usuario_id: int,
        tipo: str,
        descripcion: str | None = None
    ):
        entrega = self.repository.buscar_por_id(entrega_id)

        if not entrega:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrega no encontrada"
            )

        pedido = self.pedido_repository.buscar_por_id(
            entrega.pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido asociado no encontrado"
            )

        # =========================
        # CLIENTE
        # =========================

        es_cliente = pedido.usuario_id == usuario_id

        # =========================
        # COMERCIO
        # =========================

        es_comercio = self.comercio_repository.es_propietario(
            comercio_id=pedido.comercio_id,
            usuario_id=usuario_id
        )

        # =========================
        # REPARTIDOR
        # =========================

        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        es_repartidor = (
            repartidor is not None
            and entrega.repartidor_id == repartidor.id
        )

        # El usuario tiene que participar realmente
        # de esta entrega.
        if not (
            es_cliente
            or es_comercio
            or es_repartidor
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No podés reportar esta entrega"
            )

        tipo_limpio = tipo.strip().upper()

        if not tipo_limpio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El tipo de incidencia es obligatorio"
            )

        descripcion_limpia = (
            descripcion.strip()
            if descripcion and descripcion.strip()
            else None
        )

        incidencia = self.incidencia_repository.crear(
            entrega_id=entrega.id,
            usuario_id=usuario_id,
            tipo=tipo_limpio,
            descripcion=descripcion_limpia
        )

        self.db.commit()
        self.db.refresh(incidencia)

        return incidencia

        # =========================
    # REPARTIDOR - MIS GANANCIAS
    # =========================

    def listar_mis_ganancias(
        self,
        usuario_id: int
    ):
        repartidor = (
            self.repartidor_repository.buscar_por_usuario(
                usuario_id
            )
        )

        if not repartidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tenés un perfil Delivery"
            )

        if repartidor.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tu perfil de repartidor no está activo"
            )

        ganancias = (
            self.ganancia_repartidor_repository.listar_por_repartidor(
                repartidor.id
            )
        )

        total_ganado = sum(
            (
                ganancia.monto
                for ganancia in ganancias
            ),
            Decimal("0.00")
        )

        return {
            "total_ganado": total_ganado,
            "cantidad_entregas": len(ganancias),
            "ganancias": ganancias
        }