from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class UsuarioUpdate(BaseModel):
    nombre: str
    email: EmailStr


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    estado: str

    model_config = {
        "from_attributes": True
    }