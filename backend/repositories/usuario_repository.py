from sqlalchemy.orm import Session

from models.usuario import Usuario


class UsuarioRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(
        self,
        nombre: str,
        email: str,
        password_hash: str
    ) -> Usuario:

        usuario = Usuario(
            nombre=nombre,
            email=email,
            password_hash=password_hash,
            estado="ACTIVO"
        )

        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)

        return usuario

    def buscar_por_email(self, email: str) -> Usuario | None:
        return (
            self.db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

    def listar(self) -> list[Usuario]:
        return self.db.query(Usuario).all()

        # =========================
    # ACTUALIZAR PERFIL
    # =========================

    def actualizar_perfil(
        self,
        usuario: Usuario,
        nombre: str,
        email: str
    ) -> Usuario:

        usuario.nombre = nombre
        usuario.email = email

        self.db.commit()
        self.db.refresh(usuario)

        return usuario