from fastapi import HTTPException, status
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from core.security import crear_access_token
from repositories.usuario_repository import UsuarioRepository
from schemas.usuario import UsuarioCreate, UsuarioUpdate
from schemas.auth_schema import LoginRequest
from models.usuario import Usuario


password_hash = PasswordHash.recommended()


class UsuarioService:

    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def crear(self, data: UsuarioCreate) -> Usuario:

        usuario_existente = self.repository.buscar_por_email(data.email)

        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado"
            )

        hashed_password = password_hash.hash(data.password)

        return self.repository.crear(
            nombre=data.nombre,
            email=data.email,
            password_hash=hashed_password
        )

    def login(self, data: LoginRequest) -> dict:

        usuario = self.repository.buscar_por_email(data.email)

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )

        password_correcta = password_hash.verify(
            data.password,
            usuario.password_hash
        )

        if not password_correcta:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )

        if usuario.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo"
            )

        access_token = crear_access_token(usuario.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "usuario": usuario
        }

    def listar(self) -> list[Usuario]:
        return self.repository.listar()


        # =========================
    # ACTUALIZAR MI PERFIL
    # =========================

    def actualizar_perfil(
        self,
        usuario: Usuario,
        data: UsuarioUpdate
    ) -> Usuario:

        usuario_con_email = (
            self.repository.buscar_por_email(data.email)
        )

        if (
            usuario_con_email
            and usuario_con_email.id != usuario.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado"
            )

        return self.repository.actualizar_perfil(
            usuario=usuario,
            nombre=data.nombre,
            email=data.email
        )