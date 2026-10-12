from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UsuarioLoginResponse(BaseModel):
    id: int
    nombre: str
    email: str
    estado: str

    model_config = {
        "from_attributes": True
    }


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioLoginResponse