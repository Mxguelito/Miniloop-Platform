from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.usuario import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
)
from services.usuario_service import UsuarioService
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    service = UsuarioService(db)
    return service.crear(data)


@router.get(
    "",
    response_model=list[UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db)
):
    service = UsuarioService(db)
    return service.listar()

# =========================
# VER MI PERFIL
# =========================

@router.get(
    "/me",
    response_model=UsuarioResponse
)
def obtener_mi_perfil(
    usuario: Usuario = Depends(get_current_user)
):
    return usuario

# =========================
# EDITAR MI PERFIL
# =========================

@router.put(
    "/me",
    response_model=UsuarioResponse
)
def actualizar_mi_perfil(
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = UsuarioService(db)

    return service.actualizar_perfil(
        usuario,
        data
    )