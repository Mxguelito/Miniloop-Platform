from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.comercio import Comercio
from models.pedido import Pedido
from models.producto import Producto

from repositories.comercio_repository import ComercioRepository
from repositories.pedido_repository import PedidoRepository

from schemas.pedido import PedidoCreate

from services.entrega_service import EntregaService


TRANSICIONES_PEDIDO = {
    "PENDIENTE": {"PREPARANDO"},
    "PREPARANDO": {"LISTO"},
    "LISTO": {"ENTREGADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}

ESTADOS_CANCELABLES = {
    "PENDIENTE",
    "PREPARANDO",
}


class PedidoService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = PedidoRepository(db)
        self.comercio_repository = ComercioRepository(db)
        self.entrega_service = EntregaService(db)

    # =========================
    # CREAR PEDIDO
    # =========================

       # =========================
    # CREAR PEDIDO
    # =========================

    def crear(
        self,
        usuario_id: int,
        comercio_id: int,
        data: PedidoCreate
    ) -> Pedido:
        try:
            # =========================
            # TIPO DE ENTREGA
            # =========================

            tipo_entrega = data.tipo_entrega.strip().upper()

            if tipo_entrega not in {"RETIRO", "DELIVERY"}:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "El tipo de entrega debe ser "
                        "RETIRO o DELIVERY"
                    )
                )

            if tipo_entrega == "DELIVERY":
                if data.destino is None or not data.destino.strip():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "La dirección de entrega es obligatoria "
                            "para Delivery"
                        )
                    )

            # =========================
            # COMERCIO
            # =========================

            comercio = (
                self.db.query(Comercio)
                .filter(
                    Comercio.id == comercio_id
                )
                .first()
            )

            if not comercio:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Comercio no encontrado"
                )

            if comercio.estado != "ACTIVO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El comercio no está activo"
                )

            # =========================
            # DISPONIBILIDAD COMERCIO
            # =========================

            if comercio.disponibilidad_pedidos != "RECIBIENDO_PEDIDOS":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "El comercio está pausado "
                        "y no está recibiendo pedidos nuevos"
                    )
                )

            # =========================
            # VALIDACIÓN DELIVERY
            # =========================

            if tipo_entrega == "DELIVERY":
                if comercio.zona_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "El comercio no tiene una zona "
                            "Delivery configurada"
                        )
                    )

                hay_repartidor = (
                    self.entrega_service
                    .repartidor_repository
                    .existe_disponible_en_zona(
                        comercio.zona_id
                    )
                )

                if not hay_repartidor:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "No hay repartidores disponibles "
                            "en esta zona"
                        )
                    )

            # =========================
            # CREAR PEDIDO
            # =========================

            pedido = self.repository.crear_pedido(
                usuario_id=usuario_id,
                comercio_id=comercio_id,
                tipo_entrega=tipo_entrega
            )

            total_productos = Decimal("0.00")

            # =========================
            # ITEMS + STOCK
            # =========================

            for item_data in data.items:
                producto = (
                    self.db.query(Producto)
                    .filter(
                        Producto.id == item_data.producto_id
                    )
                    .first()
                )

                if not producto:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Producto no encontrado"
                    )

                if producto.comercio_id != comercio_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"El producto {producto.nombre} "
                            "no pertenece a este comercio"
                        )
                    )

                if producto.estado != "ACTIVO":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"El producto {producto.nombre} "
                            "no está disponible"
                        )
                    )

                if producto.stock < item_data.cantidad:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "Stock insuficiente para "
                            f"{producto.nombre}"
                        )
                    )

                subtotal = (
                    producto.precio
                    * item_data.cantidad
                )

                self.repository.crear_item(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item_data.cantidad,
                    precio_unitario=producto.precio,
                    subtotal=subtotal
                )

                producto.stock -= item_data.cantidad
                total_productos += subtotal

            # =========================
            # TOTAL DEL PEDIDO
            # =========================

            total = total_productos

            if tipo_entrega == "DELIVERY":
                total += Decimal("2000.00")

            pedido.total = total

            # Todavía no confirmamos la transacción.
            self.db.flush()

            pedido_creado = self.repository.buscar_por_id(
                pedido.id
            )

            if not pedido_creado:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se pudo recuperar el pedido creado"
                )

            # =========================
            # CREAR ENTREGA
            # =========================

            if tipo_entrega == "DELIVERY":
                self.entrega_service.crear_para_pedido(
                    pedido=pedido_creado,
                    destino=data.destino
                )

            # =========================
            # ÚNICO COMMIT
            # =========================

            self.db.commit()

            pedido_creado = self.repository.buscar_por_id(
                pedido.id
            )

            if not pedido_creado:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se pudo recuperar el pedido creado"
                )

            return pedido_creado

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el pedido"
            )

    # =========================
    # CLIENTE - LISTAR PEDIDOS
    # =========================

    def listar_del_usuario(
        self,
        usuario_id: int
    ) -> list[Pedido]:

        return self.repository.listar_por_usuario(
            usuario_id
        )

    # =========================
    # CLIENTE - DETALLE PEDIDO
    # =========================

    def obtener_del_usuario(
        self,
        pedido_id: int,
        usuario_id: int
    ) -> Pedido:

        pedido = self.repository.buscar_por_id(
            pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )

        if pedido.usuario_id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permiso para ver "
                    "este pedido"
                )
            )

        entrega = (
        self.entrega_service.repository.buscar_por_pedido(
        pedido.id
         )
)

        pedido.entrega_id = (
        entrega.id
        if entrega
        else None
        )

        return pedido

    # =========================
    # CLIENTE - CANCELAR
    # =========================

    def cancelar(
        self,
        pedido_id: int,
        usuario_id: int
    ) -> Pedido:

        pedido = self.repository.buscar_por_id(
            pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )

        if pedido.usuario_id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permiso para "
                    "cancelar este pedido"
                )
            )

        if pedido.estado not in ESTADOS_CANCELABLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Este pedido ya no puede "
                    "cancelarse"
                )
            )

        # =========================
        # PROTECCIÓN DELIVERY
        # =========================

        entrega = (
            self.entrega_service.repository.buscar_por_pedido(
                pedido.id
            )
        )

        if entrega:
            # Si un repartidor ya tomó la entrega,
            # el cliente no puede cancelarla por el flujo normal.
            if entrega.repartidor_id is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "El pedido ya tiene un repartidor asignado "
                        "y no puede cancelarse normalmente"
                    )
                )

            # Una entrega que ya avanzó fuera de PENDIENTE
            # tampoco puede cancelarse por este flujo.
            if entrega.estado != "PENDIENTE":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega ya inició su flujo Delivery "
                        "y no puede cancelarse normalmente"
                    )
                )

        # =========================
        # RESTAURAR STOCK
        # =========================

        for item in pedido.items:
            item.producto.stock += item.cantidad

        pedido.estado = "CANCELADO"

        # Si existía una entrega Delivery todavía pendiente,
        # también la cerramos.
        if entrega:
            entrega.estado = "CANCELADA"

        self.repository.guardar()

        pedido_actualizado = (
            self.repository.buscar_por_id(
                pedido.id
            )
        )

        if not pedido_actualizado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo recuperar el pedido"
            )

        return pedido_actualizado

    # =========================
    # COMERCIO - LISTAR PEDIDOS
    # =========================

    def listar_del_comercio(
        self,
        comercio_id: int,
        usuario_id: int
    ) -> list[Pedido]:

        comercio = (
            self.comercio_repository.buscar_por_id(
                comercio_id
            )
        )

        if not comercio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comercio no encontrado"
            )

        self._verificar_propietario(
            comercio_id=comercio_id,
            usuario_id=usuario_id
        )

        return self.repository.listar_por_comercio(
            comercio_id
        )

    # =========================
    # COMERCIO - DETALLE PEDIDO
    # =========================

    def obtener_del_comercio(
        self,
        pedido_id: int,
        comercio_id: int,
        usuario_id: int
    ) -> Pedido:

        self._verificar_propietario(
            comercio_id=comercio_id,
            usuario_id=usuario_id
        )

        pedido = self.repository.buscar_por_id(
            pedido_id
        )

        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )

        if pedido.comercio_id != comercio_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Este pedido no pertenece "
                    "al comercio"
                )
            )
        entrega = (
        self.entrega_service.repository.buscar_por_pedido(
        pedido.id
        )
        )

        pedido.entrega_id = (
        entrega.id
        if entrega
        else None
        )

        return pedido

    # =========================
    # COMERCIO - CAMBIAR ESTADO
    # =========================

    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str,
        usuario_id: int
    ) -> Pedido:

        try:
            pedido = self.repository.buscar_por_id(
                pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado"
                )

            # Verificamos que el usuario sea propietario
            # del comercio al que pertenece el pedido.
            self._verificar_propietario(
                comercio_id=pedido.comercio_id,
                usuario_id=usuario_id
            )

            estados_permitidos = (
                TRANSICIONES_PEDIDO.get(
                    pedido.estado,
                    set()
                )
            )

            # =========================
            # PROTECCIÓN DELIVERY
            # =========================

            # Un pedido Delivery no puede ser marcado
            # manualmente como ENTREGADO por el comercio.
            #
            # El estado ENTREGADO solamente se alcanza
            # mediante el código final del flujo Delivery.
            if (
                pedido.tipo_entrega == "DELIVERY"
                and nuevo_estado == "ENTREGADO"
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Un pedido Delivery solo puede completarse "
                        "mediante la confirmación final de la entrega"
                    )
                )

            # =========================
            # VALIDAR TRANSICIÓN
            # =========================

            if nuevo_estado not in estados_permitidos:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"No se puede cambiar el estado "
                        f"de {pedido.estado} a {nuevo_estado}"
                    )
                )

            # =========================
            # PUBLICAR DELIVERY
            # =========================

            if (
                pedido.tipo_entrega == "DELIVERY"
                and nuevo_estado == "PREPARANDO"
            ):
                entrega = (
                    self.entrega_service.repository.buscar_por_pedido(
                        pedido.id
                    )
                )

                if not entrega:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "El pedido Delivery no tiene "
                            "una entrega asociada"
                        )
                    )

                if entrega.estado != "PENDIENTE":
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "La entrega no puede publicarse "
                            "en su estado actual"
                        )
                    )

                # Acá comienza oficialmente la ventana
                # de 10 minutos para los repartidores.
                entrega.fecha_publicacion = datetime.now(
                    timezone.utc
                )

            # =========================
            # CAMBIAR ESTADO
            # =========================

            pedido.estado = nuevo_estado

            # Pedido + fecha_publicacion se guardan juntos.
            self.db.commit()

            self.db.refresh(pedido)

            pedido_actualizado = (
                self.repository.buscar_por_id(
                    pedido.id
                )
            )

            if not pedido_actualizado:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se pudo recuperar el pedido"
                )

            return pedido_actualizado

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cambiar el estado del pedido"
            )

        # =========================
    # COMERCIO - CANCELAR PEDIDO
    # =========================

    def cancelar_por_comercio(
        self,
        pedido_id: int,
        usuario_id: int,
        motivo: str
    ) -> Pedido:

        motivo_limpio = motivo.strip()

        if not motivo_limpio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El motivo de cancelación es obligatorio"
            )

        try:
            pedido = self.repository.buscar_por_id(
                pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado"
                )

            # Solo el propietario del comercio puede cancelar.
            self._verificar_propietario(
                comercio_id=pedido.comercio_id,
                usuario_id=usuario_id
            )

            if pedido.estado in {"ENTREGADO", "CANCELADO"}:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Este pedido ya no puede cancelarse"
                )

            entrega = (
                self.entrega_service.repository.buscar_por_pedido(
                    pedido.id
                )
            )

            # =========================
            # PROTECCIÓN DELIVERY
            # =========================

            if entrega:
                estados_despues_del_retiro = {
                    "RETIRADO",
                    "EN_CAMINO",
                    "ESPERANDO_AL_CLIENTE",
                    "EN_DEVOLUCION",
                    "DEVOLUCION_EN_COMERCIO",
                    "DEVOLUCION_CONFIRMADA",
                    "DEVOLUCION_CON_PROBLEMA",
                    "DEVUELTO",
                    "ENTREGADO",
                }

                if entrega.estado in estados_despues_del_retiro:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "El pedido ya fue retirado por el repartidor. "
                            "Debe resolverse mediante una incidencia"
                        )
                    )

            # =========================
            # RESTAURAR STOCK
            # =========================

            for item in pedido.items:
                item.producto.stock += item.cantidad

            pedido.estado = "CANCELADO"

            # =========================
            # CANCELAR ENTREGA
            # =========================

            if entrega:
                entrega.estado = "CANCELADA"

                # =========================
                # LIBERAR REPARTIDOR
                # =========================
                #
                # Si la entrega ya había sido aceptada,
                # el repartidor estaba OCUPADO.
                # Como todavía no retiró el pedido,
                # debe volver a DISPONIBLE.

                if entrega.repartidor_id is not None:

                    repartidor = (
                        self.entrega_service
                        .repartidor_repository
                        .buscar_por_id(
                            entrega.repartidor_id
                        )
                    )

                    if repartidor:
                        repartidor.disponibilidad = "DISPONIBLE"

                # Conservamos entrega.repartidor_id.
                # No lo ponemos en None porque sirve como
                # trazabilidad histórica de quién tenía
                # asignada la entrega al cancelarse.

                # =========================
                # TRAZABILIDAD
                # =========================

                self.entrega_service.incidencia_repository.crear(
                    entrega_id=entrega.id,
                    usuario_id=usuario_id,
                    tipo="CANCELACION_COMERCIO",
                    descripcion=motivo_limpio
                )

            # =========================
            # CONFIRMAR TODO JUNTO
            # =========================
            #
            # Pedido + Entrega + stock +
            # repartidor + incidencia.

            self.db.commit()

            self.db.refresh(pedido)

            if entrega:
                self.db.refresh(entrega)

            return pedido

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos cancelar el pedido"
            )

    # =========================
    # AUTORIZACIÓN COMERCIO
    # =========================

    def _verificar_propietario(
        self,
        comercio_id: int,
        usuario_id: int
    ) -> None:

        es_propietario = (
            self.comercio_repository.es_propietario(
                comercio_id=comercio_id,
                usuario_id=usuario_id
            )
        )

        if not es_propietario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permiso para "
                    "administrar este comercio"
                )
            )